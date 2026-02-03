import { GoogleGenAI } from '@google/genai';
import { trackGemini } from 'opik-gemini';
import { CoachData, ChatMessage } from '../types';
import { ragService } from './rag';

export class AIService {
  private trackedGenAI: any;

  constructor() {
    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    });

    this.trackedGenAI = trackGemini(genAI, {
      traceMetadata: {
        tags: ['betteros', 'coach'],
        environment: process.env.NODE_ENV || 'development',
      },
    });
  }

  generateSystemPrompt(coachData: Omit<CoachData, 'id' | 'systemPrompt' | 'createdAt' | 'updatedAt'>): string {
    const personalityStr = coachData.personality.join(', ');
    const expertiseStr = coachData.expertise.join(', ');
    
    return `You are ${coachData.name}, ${coachData.tagline}.

PERSONALITY: You are ${personalityStr}.

EXPERTISE: You specialize in ${expertiseStr}.

BACKGROUND: ${coachData.background}

COMMUNICATION STYLE: ${coachData.conversationStyle}

INSTRUCTIONS:
- Always stay in character as ${coachData.name}
- Provide helpful, actionable advice within your areas of expertise
- Match your personality traits in your responses
- Keep responses concise but meaningful (2-3 sentences max)
- Ask follow-up questions to better understand the user's needs
- Reference your background and expertise when relevant
- Be encouraging and supportive while maintaining your unique personality`;
  }

  async generateResponse(
    coach: CoachData,
    message: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Retrieve relevant knowledge from RAG (skip if no knowledge base yet)
      let relevantContext: string[] = [];
      try {
        relevantContext = await ragService.retrieveContext(coach.id, message, 3);
        if (relevantContext.length > 0) {
          console.log(`📚 Retrieved ${relevantContext.length} knowledge chunks`);
        } else {
          console.log('⚠️ No knowledge found for this query');
        }
      } catch (ragError: any) {
        console.log('⚠️ RAG retrieval error:', ragError.message);
      }
      
      const conversationContext = conversationHistory
        .slice(-10)
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n');

      // Build context-aware prompt
      const knowledgeContext = relevantContext.length > 0
        ? `\n\nRELEVANT KNOWLEDGE FROM YOUR CONTENT:\n${relevantContext.map((ctx, i) => `[${i + 1}] ${ctx}`).join('\n\n')}`
        : '';

      const fullPrompt = `${coach.systemPrompt}${knowledgeContext}\n\nCONVERSATION HISTORY:\n${conversationContext}\n\nUSER: ${message}\n\nASSISTANT:`;

      const response = await this.trackedGenAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: fullPrompt,
      });

      return response.text;
    } catch (error: any) {
      console.error('❌ Error generating response:', error);
      throw error;
    }
  }

  async flush() {
    await this.trackedGenAI.flush();
  }
}

export const aiService = new AIService();
