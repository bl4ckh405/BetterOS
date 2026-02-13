import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { aiService } from '../services/ai';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const standupRoutes = Router();

// GET /api/standup/messages - Get today's standup messages
standupRoutes.get('/messages', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('standup_messages')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ messages: data || [] });
  } catch (error) {
    console.error('Error fetching standup messages:', error);
    res.status(500).json({ error: 'Failed to fetch standup messages' });
  }
});

// POST /api/standup/chat - Send message and get response
standupRoutes.post('/chat', async (req, res) => {
  try {
    const { userId, message, userContext } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Get existing messages for today
    const { data: existingMessages } = await supabase
      .from('standup_messages')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .order('created_at', { ascending: true });

    let allMessages = existingMessages || [];

    // If no messages exist, generate greeting
    if (allMessages.length === 0) {
      const greeting = await aiService.getDailyStandupGreeting(userContext || {});
      
      const { data: greetingMsg, error: greetingError } = await supabase
        .from('standup_messages')
        .insert({
          user_id: userId,
          date: today,
          role: 'assistant',
          content: greeting,
        })
        .select()
        .single();

      if (greetingError) throw greetingError;
      allMessages = [greetingMsg];
    }

    // If user sent a message, save it and generate response
    if (message && message.trim()) {
      // Save user message
      const { data: userMsg, error: userError } = await supabase
        .from('standup_messages')
        .insert({
          user_id: userId,
          date: today,
          role: 'user',
          content: message,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Build conversation history
      const conversationHistory = allMessages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      // Generate AI response
      const aiResponse = await aiService.getDailyStandupResponse(
        message,
        userContext || {},
        conversationHistory
      );

      // Save AI response
      const { data: assistantMsg, error: assistantError } = await supabase
        .from('standup_messages')
        .insert({
          user_id: userId,
          date: today,
          role: 'assistant',
          content: aiResponse,
        })
        .select()
        .single();

      if (assistantError) throw assistantError;

      allMessages = [...allMessages, userMsg, assistantMsg];
    }

    res.json({
      response: allMessages[allMessages.length - 1]?.content || '',
      messages: allMessages,
    });
  } catch (error) {
    console.error('Error in standup chat:', error);
    res.status(500).json({ error: 'Failed to process standup message' });
  }
});

export default standupRoutes;
