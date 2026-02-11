import { Router } from 'express';
import { aiService } from '../services/ai';

export const crewChatRoutes = Router();

// POST /api/crew/chat - Send message to crew member
crewChatRoutes.post('/chat', async (req, res) => {
  try {
    const { modeId, message, userContext, conversationHistory } = req.body;
    
    if (!modeId || !message) {
      return res.status(400).json({ error: 'Mode ID and message are required' });
    }

    const response = await aiService.getCrewResponse(
      modeId,
      message,
      userContext || {},
      conversationHistory || ''
    );

    res.json({ response });
  } catch (error) {
    console.error('Error in crew chat:', error);
    res.status(500).json({ error: 'Failed to process crew message' });
  }
});

// POST /api/crew/standup/greeting - Get daily standup greeting
crewChatRoutes.post('/standup/greeting', async (req, res) => {
  try {
    const { userContext } = req.body;
    
    const greeting = await aiService.getDailyStandupGreeting(userContext || {});

    res.json({ greeting });
  } catch (error) {
    console.error('Error in standup greeting:', error);
    res.status(500).json({ error: 'Failed to generate standup greeting' });
  }
});

// POST /api/crew/standup/response - Get daily standup response
crewChatRoutes.post('/standup/response', async (req, res) => {
  try {
    const { message, userContext, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await aiService.getDailyStandupResponse(
      message,
      userContext || {},
      conversationHistory || ''
    );

    res.json({ response });
  } catch (error) {
    console.error('Error in standup response:', error);
    res.status(500).json({ error: 'Failed to process standup message' });
  }
});

export default crewChatRoutes;
