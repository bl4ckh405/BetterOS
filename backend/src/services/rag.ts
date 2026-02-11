import { YoutubeTranscript } from 'youtube-transcript';
import { google } from 'googleapis';
import { GoogleGenAI } from '@google/genai';
import { supabase } from './supabase';

interface TranscriptChunk {
  text: string;
  videoId: string;
  videoTitle: string;
  startTime: number;
}

export class RAGService {
  private genAI: any;
  private youtube: any;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY,
    });
  }

  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  private extractChannelId(url: string): string | null {
    const patterns = [
      /youtube\.com\/channel\/([^/\n?#]+)/,
      /youtube\.com\/@([^/\n?#]+)/,
      /youtube\.com\/c\/([^/\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  async ingestYouTubeVideo(videoUrl: string, coachId: string): Promise<void> {
    const videoId = this.extractVideoId(videoUrl);
    if (!videoId) throw new Error('Invalid YouTube URL');

    console.log(`📝 Fetching transcript for ${videoId} via TranscriptAPI...`);
    
    // Use TranscriptAPI instead of youtube-transcript
    const response = await fetch(
      `https://transcriptapi.com/api/v2/youtube/transcript?video_url=${videoId}&format=json&include_timestamp=true`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TRANSCRIPT_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`⚠️ Skipping ${videoId} - no transcript available`);
        return;
      }
      throw new Error(`TranscriptAPI error: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();
    const transcript = data.transcript;
    
    console.log(`✅ Got ${transcript.length} transcript segments`);
    
    if (transcript.length === 0) {
      console.log(`⚠️ Skipping ${videoId} - no transcript available`);
      return;
    }
    
    const chunks: TranscriptChunk[] = [];
    let currentChunk = '';
    let chunkStart = 0;

    for (const segment of transcript) {
      currentChunk += segment.text + ' ';
      
      if (currentChunk.split(' ').length >= 200 || (segment.start * 1000) - chunkStart >= 30000) {
        chunks.push({
          text: currentChunk.trim(),
          videoId,
          videoTitle: videoUrl,
          startTime: chunkStart / 1000,
        });
        currentChunk = '';
        chunkStart = segment.start * 1000;
      }
    }

    if (currentChunk) {
      chunks.push({
        text: currentChunk.trim(),
        videoId,
        videoTitle: videoUrl,
        startTime: chunkStart / 1000,
      });
    }

    console.log(`📦 Created ${chunks.length} chunks, starting embedding...`);

    for (const chunk of chunks) {
      console.log(`🧠 Generating embedding for chunk ${chunks.indexOf(chunk) + 1}/${chunks.length}...`);
      const embedding = await this.generateEmbedding(chunk.text);
      console.log(`✅ Embedding generated (${embedding.length} dimensions)`);
      
      console.log(`💾 Inserting chunk ${chunks.indexOf(chunk) + 1}/${chunks.length}`);
      const { data, error } = await supabase.from('coach_knowledge').insert({
        coach_id: coachId,
        content: chunk.text,
        embedding,
        metadata: {
          video_id: chunk.videoId,
          video_title: chunk.videoTitle,
          start_time: chunk.startTime,
        },
      });

      if (error) {
        console.error(`❌ Supabase insert error:`, error);
        throw error;
      }
      console.log(`✅ Chunk inserted successfully`);
    }
    
    console.log(`✅ Video ${videoId} fully ingested with ${chunks.length} chunks`);
  }

  async ingestYouTubeChannel(channelUrl: string, coachId: string, maxVideos = 10): Promise<void> {
    const channelId = this.extractChannelId(channelUrl);
    if (!channelId) throw new Error('Invalid YouTube channel URL');

    let resolvedChannelId = channelId;

    // Handle @username format
    if (channelUrl.includes('/@')) {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: channelId,
        type: ['channel'],
        maxResults: 1,
      });
      resolvedChannelId = response.data.items?.[0]?.id?.channelId;
      if (!resolvedChannelId) throw new Error('Channel not found');
    }

    // Fetch most viewed long-form videos (filter out Shorts)
    const response = await this.youtube.search.list({
      part: ['id'],
      channelId: resolvedChannelId,
      maxResults: 50, // Fetch more to filter
      order: 'viewCount',
      type: ['video'],
      videoDuration: 'long', // Only videos longer than 20 minutes
    });

    const videoIds = response.data.items?.map((item: any) => item.id.videoId) || [];
    
    // Take only first 10 long-form videos
    const longFormVideos = videoIds.slice(0, maxVideos);

    console.log(`📥 Found ${longFormVideos.length} long-form videos. Ingesting...`);

    for (const videoId of longFormVideos) {
      try {
        await this.ingestYouTubeVideo(`https://www.youtube.com/watch?v=${videoId}`, coachId);
        console.log(`✅ Ingested: ${videoId}`);
      } catch (error: any) {
        console.error(`❌ Failed ${videoId}:`, error.message);
      }
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Use REST API directly due to SDK bug
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: {
            parts: [{ text }]
          }
        })
      }
    );
    
    const result: any = await response.json();
    
    if (result.error) {
      throw new Error(`Gemini API error: ${result.error.message}`);
    }
    
    return result.embedding.values;
  }

  async retrieveContext(coachId: string, query: string, topK = 3): Promise<string[]> {
    const queryEmbedding = await this.generateEmbedding(query);

    const { data, error } = await supabase.rpc('match_coach_knowledge', {
      p_coach_id: coachId,
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: topK,
    });

    if (error) throw error;

    return data?.map((item: any) => item.content) || [];
  }
}

export const ragService = new RAGService();
