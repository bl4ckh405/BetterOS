import { GoogleGenerativeAI } from '@google/generative-ai';
import { Opik } from 'opik';

// Initialize Opik client
const opik = new Opik({
  apiKey: process.env.OPIK_API_KEY,
  projectName: 'BetterOS',
  workspaceName: 'default',
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface CoachData {
  id: string;
  name: string;
  tagline: string;
  personality: string[];
  expertise: string[];
  background: string;
  conversationStyle: string;
  color: string;
  image?: string;
  systemPrompt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class BetterOSBackend {
  private coaches: Map<string, CoachData> = new Map();

  // Create a new coach
  async createCoach(coachData: Omit<CoachData, 'id' | 'systemPrompt'>): Promise<CoachData> {
    const trace = opik.trace({
      name: 'create_coach',
      input: { coachData },
    });

    try {
      const id = `coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate system prompt based on coach data
      const systemPrompt = this.generateSystemPrompt(coachData);
      
      const coach: CoachData = {
        ...coachData,
        id,
        systemPrompt,
      };

      this.coaches.set(id, coach);
      
      trace.update({
        output: { coachId: id, success: true },
      });
      
      return coach;
    } catch (error) {
      trace.update({
        output: { error: error.message },
      });
      throw error;
    } finally {
      trace.end();
    }
  }

  // Generate system prompt for coach
  private generateSystemPrompt(coachData: Omit<CoachData, 'id' | 'systemPrompt'>): string {
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
- Keep responses concise but meaningful
- Ask follow-up questions to better understand the user's needs
- Reference your background and expertise when relevant`;
  }

  // Chat with a coach
  async chatWithCoach(
    coachId: string, 
    message: string, 
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    const trace = opik.trace({
      name: 'chat_with_coach',
      input: { coachId, message, historyLength: conversationHistory.length },
    });

    try {
      const coach = this.coaches.get(coachId);
      if (!coach) {
        throw new Error(`Coach with ID ${coachId} not found`);
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Build conversation context
      const conversationContext = conversationHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${coach.systemPrompt}

CONVERSATION HISTORY:
${conversationContext}

USER: ${message}

ASSISTANT:`;

      const span = trace.span({
        name: 'gemini_generation',
        type: 'llm',
        input: { prompt: fullPrompt, model: 'gemini-pro' },
      });

      const result = await model.generateContent(fullPrompt);
      const response = result.response.text();

      span.update({
        output: { response },
      });
      span.end();

      trace.update({
        output: { response, success: true },
      });

      return response;
    } catch (error) {
      trace.update({
        output: { error: error.message },
      });
      throw error;
    } finally {
      trace.end();
    }
  }

  // Get all coaches
  getCoaches(): CoachData[] {
    return Array.from(this.coaches.values());
  }

  // Get specific coach
  getCoach(coachId: string): CoachData | undefined {
    return this.coaches.get(coachId);
  }

  // Delete coach
  deleteCoach(coachId: string): boolean {
    return this.coaches.delete(coachId);
  }
}

// Export singleton instance
export const betterOSBackend = new BetterOSBackend();