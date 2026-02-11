import { Router } from 'express';
import { aiService } from '../services/ai';
import { supabase } from '../services/supabase';
import { SendMessageRequest } from '../types';

export const chatRoutes = Router();

// POST /api/chat/sessions - Create new chat session
chatRoutes.post('/sessions', async (req, res) => {
  try {
    const { coachId } = req.body;
    
    if (!coachId) {
      return res.status(400).json({ error: 'Coach ID is required' });
    }

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert({ coach_id: coachId })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ session });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// POST /api/chat/message - Send message to coach
chatRoutes.post('/message', async (req, res) => {
  try {
    console.log('📨 Received message request');
    
    const { coachId, message, sessionId, coach: coachData, userContext }: SendMessageRequest & { coach?: any; userContext?: any } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!coachData) {
      return res.status(400).json({ error: 'Coach data is required' });
    }

    console.log('✅ Using coach:', coachData.name);
    if (userContext) {
      console.log('👤 User context provided:', {
        coreValues: userContext.coreValues?.length || 0,
        hasGoals: !!(userContext.fiveYearGoal || userContext.oneYearGoal),
      });
    }

    // Use provided sessionId or get from Supabase
    let currentSessionId = sessionId;
    
    // Get conversation history from Supabase
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true });

    const conversationHistory = (messages || []).map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      id: msg.id,
      coachId: msg.coach_id || coachId,
      sessionId: msg.session_id
    }));

    console.log('📚 Conversation history length:', conversationHistory.length);
    console.log('🤖 Generating AI response...');
    
    const aiResponse = await aiService.generateResponse(coachData, message, conversationHistory, userContext);
    
    console.log('✅ AI response generated');

    const { data: savedMessage, error: saveError } = await supabase
      .from('messages')
      .insert({
        session_id: currentSessionId,
        content: aiResponse,
        role: 'assistant'
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Error saving message:', saveError);
      throw saveError;
    }

    console.log('💾 Message saved to database:', savedMessage.id);

    res.json({
      sessionId: currentSessionId,
      response: aiResponse,
    });
  } catch (error) {
    console.error('❌ Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// GET /api/chat/sessions/:id - Get session messages
chatRoutes.get('/sessions/:id', async (req, res) => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});