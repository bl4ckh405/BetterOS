import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatSession, CoachData, CreateCoachRequest } from '../types';
import { aiService } from './ai';
import { ragService } from './rag';
import { supabase } from './supabase';

export class DataService {
  private coaches: Map<string, CoachData> = new Map();
  private sessions: Map<string, ChatSession> = new Map();
  private syncInitialized = false;

  constructor() {
    this.initializeSync();
  }

  private async initializeSync() {
    if (this.syncInitialized) return;
    this.syncInitialized = true;

    // Load existing coaches from Supabase
    await this.syncFromSupabase();

    // Subscribe to realtime changes
    supabase
      .channel('backend_coaches_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coaches' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const coach = this.mapSupabaseToCoach(payload.new);
            this.coaches.set(coach.id, coach);
            console.log(`🔄 Synced coach to memory: ${coach.name}`);
          } else if (payload.eventType === 'DELETE') {
            this.coaches.delete(payload.old.id);
            console.log(`🗑️ Removed coach from memory: ${payload.old.id}`);
          }
        }
      )
      .subscribe();
  }

  private async syncFromSupabase() {
    const { data } = await supabase.from('coaches').select('*');
    if (data) {
      data.forEach(row => {
        const coach = this.mapSupabaseToCoach(row);
        this.coaches.set(coach.id, coach);
      });
      console.log(`✅ Synced ${data.length} coaches to memory`);
      
      // Auto-ingest for coaches with empty knowledge base
      this.checkAndIngestMissingKnowledge(data);
    }
  }

  private async checkAndIngestMissingKnowledge(coaches: any[]) {
    for (const row of coaches) {
      try {
        // Check if coach has any knowledge
        const { count } = await supabase
          .from('coach_knowledge')
          .select('*', { count: 'exact', head: true })
          .eq('coach_id', row.id);

        if (count === 0 && row.youtube_channel_url) {
          console.log(`📥 Auto-ingesting missing knowledge for: ${row.name}`);
          ragService.ingestYouTubeChannel(row.youtube_channel_url, row.id, 50)
            .then(() => console.log(`✅ Knowledge base ready for ${row.name}`))
            .catch(err => console.error(`❌ Failed to ingest for ${row.name}:`, err.message));
        }
      } catch (error) {
        console.error(`❌ Error checking knowledge for ${row.name}:`, error);
      }
    }
  }

  private mapSupabaseToCoach(row: any): CoachData {
    return {
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      personality: row.personality,
      expertise: row.expertise,
      background: row.background,
      conversationStyle: row.conversation_style,
      color: row.color,
      image: row.avatar_url,
      systemPrompt: row.system_prompt,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  // Coach management
  async createCoach(data: CreateCoachRequest): Promise<CoachData> {
    const id = uuidv4();
    const now = new Date();
    
    const systemPrompt = aiService.generateSystemPrompt(data);
    
    const coach: CoachData = {
      ...data,
      id,
      systemPrompt,
      createdAt: now,
      updatedAt: now,
    };

    // Save to Supabase (will auto-sync to memory via realtime)
    const { error } = await supabase.from('coaches').insert({
      id: coach.id,
      name: coach.name,
      tagline: coach.tagline,
      personality: coach.personality,
      expertise: coach.expertise,
      background: coach.background,
      conversation_style: coach.conversationStyle,
      color: coach.color,
      system_prompt: systemPrompt,
      avatar_url: coach.image,
      youtube_channel_url: data.youtubeChannelUrl || null,
      user_id: data.userId || null,
      is_public: data.isPublic ?? false,
    });

    if (error) throw error;

    // Auto-ingest YouTube channel if provided
    if (data.youtubeChannelUrl) {
      console.log(`📥 Auto-ingesting YouTube channel for coach: ${coach.name}`);
      ragService.ingestYouTubeChannel(data.youtubeChannelUrl, id, 50)
        .then(() => console.log(`✅ YouTube knowledge base ready for ${coach.name}`))
        .catch(err => console.error(`❌ Failed to ingest channel:`, err.message));
    }

    // Auto-ingest PDFs if provided
    if (data.pdfUrls && data.pdfUrls.length > 0) {
      console.log(`📄 Auto-ingesting ${data.pdfUrls.length} PDF(s) for coach: ${coach.name}`);
      for (const pdfFile of data.pdfUrls) {
        ragService.ingestPDF(pdfFile.url, id, pdfFile.filename)
          .then(() => console.log(`✅ PDF "${pdfFile.filename}" ingested for ${coach.name}`))
          .catch(err => console.error(`❌ Failed to ingest PDF "${pdfFile.filename}":`, err.message));
      }
    }

    return coach;
  }

  getCoach(id: string): CoachData | undefined {
    return this.coaches.get(id);
  }

  getAllCoaches(): CoachData[] {
    return Array.from(this.coaches.values());
  }

  async updateCoach(id: string, updates: Partial<CreateCoachRequest>): Promise<CoachData | null> {
    const coach = this.coaches.get(id);
    if (!coach) return null;

    const updatedData: any = { updated_at: new Date() };

    if (updates.name) updatedData.name = updates.name;
    if (updates.tagline) updatedData.tagline = updates.tagline;
    if (updates.personality) updatedData.personality = updates.personality;
    if (updates.expertise) updatedData.expertise = updates.expertise;
    if (updates.background) updatedData.background = updates.background;
    if (updates.conversationStyle) updatedData.conversation_style = updates.conversationStyle;
    if (updates.color) updatedData.color = updates.color;
    if (updates.image) updatedData.avatar_url = updates.image;

    // Regenerate system prompt if relevant fields changed
    if (updates.name || updates.personality || updates.expertise || 
        updates.background || updates.conversationStyle) {
      const updatedCoach = { ...coach, ...updates };
      updatedData.system_prompt = aiService.generateSystemPrompt(updatedCoach);
    }

    const { error } = await supabase
      .from('coaches')
      .update(updatedData)
      .eq('id', id);

    if (error) throw error;

    return this.coaches.get(id) || null;
  }

  async deleteCoach(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Chat session management
  createSession(coachId: string, userId?: string): ChatSession {
    const id = uuidv4();
    const now = new Date();
    
    const session: ChatSession = {
      id,
      coachId,
      userId,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): ChatSession | undefined {
    return this.sessions.get(id);
  }

  addMessageToSession(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const chatMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    session.messages.push(chatMessage);
    session.updatedAt = new Date();
    
    return chatMessage;
  }

  getSessionMessages(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    return session ? session.messages : [];
  }
}

export const dataService = new DataService();