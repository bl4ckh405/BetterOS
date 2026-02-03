import { Router } from 'express';
import { ragService } from '../services/rag';

const router = Router();

// Ingest YouTube video for a coach
router.post('/ingest/video', async (req, res) => {
  try {
    const { coachId, videoUrl } = req.body;

    if (!coachId || !videoUrl) {
      return res.status(400).json({ error: 'coachId and videoUrl required' });
    }

    console.log(`📥 Starting video ingestion: ${videoUrl}`);
    await ragService.ingestYouTubeVideo(videoUrl, coachId);
    console.log(`✅ Video ingestion complete`);

    res.json({ 
      success: true, 
      message: 'Video ingested successfully' 
    });
  } catch (error: any) {
    console.error('❌ Error ingesting video:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Ingest YouTube channel (up to 50 videos)
router.post('/ingest/channel', async (req, res) => {
  try {
    const { coachId, channelUrl, maxVideos = 50 } = req.body;

    if (!coachId || !channelUrl) {
      return res.status(400).json({ error: 'coachId and channelUrl required' });
    }

    console.log(`📥 Starting channel ingestion: ${channelUrl}`);
    await ragService.ingestYouTubeChannel(channelUrl, coachId, maxVideos);
    console.log(`✅ Channel ingestion complete`);

    res.json({ 
      success: true, 
      message: `Channel ingested successfully (max ${maxVideos} videos)` 
    });
  } catch (error: any) {
    console.error('❌ Error ingesting channel:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Ingest multiple videos
router.post('/ingest/batch', async (req, res) => {
  try {
    const { coachId, videoUrls } = req.body;

    if (!coachId || !Array.isArray(videoUrls)) {
      return res.status(400).json({ error: 'coachId and videoUrls array required' });
    }

    const results = [];
    for (const url of videoUrls) {
      try {
        await ragService.ingestYouTubeVideo(url, coachId);
        results.push({ url, success: true });
      } catch (error: any) {
        results.push({ url, success: false, error: error.message });
      }
    }

    res.json({ results });
  } catch (error: any) {
    console.error('❌ Error batch ingesting:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint - check if knowledge exists for a coach
router.get('/test/:coachId', async (req, res) => {
  try {
    const { coachId } = req.params;
    const testQuery = 'leadership';
    
    console.log(`🔍 Testing knowledge retrieval for coach: ${coachId}`);
    const context = await ragService.retrieveContext(coachId, testQuery, 3);
    
    res.json({
      coachId,
      testQuery,
      foundChunks: context.length,
      preview: context.map(c => c.substring(0, 100) + '...')
    });
  } catch (error: any) {
    console.error('❌ Error testing knowledge:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Manual test - ingest Simon Sinek's famous TED talk
router.post('/test/ingest-ted-talk', async (req, res) => {
  try {
    const { coachId } = req.body;
    
    if (!coachId) {
      return res.status(400).json({ error: 'coachId required' });
    }

    console.log('🎯 Testing with Simon Sinek TED Talk...');
    await ragService.ingestYouTubeVideo(
      'https://www.youtube.com/watch?v=u4ZoJKF_VuA',
      coachId
    );
    
    res.json({ 
      success: true, 
      message: 'TED talk ingested successfully' 
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

export default router;
