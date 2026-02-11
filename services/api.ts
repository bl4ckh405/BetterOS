import { databaseService } from './database';

const API_BASE_URL = __DEV__ ? 'http://192.168.0.104:3000/api' : 'https://your-production-api.com/api';

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
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  coachId: string;
  sessionId: string;
}

export class APIService {
  // Create a new coach using Supabase
  static async createCoach(coachData: {
    name: string;
    tagline: string;
    personality: string[];
    expertise: string[];
    background: string;
    conversationStyle: string;
    color: string;
    image?: string;
  }): Promise<CoachData> {
    try {
      const coach = await databaseService.createCoach({
        name: coachData.name,
        tagline: coachData.tagline,
        personality: coachData.personality,
        expertise: coachData.expertise,
        background: coachData.background,
        conversation_style: coachData.conversationStyle,
        color: coachData.color,
        avatar_url: coachData.image,
        system_prompt: `You are ${coachData.name}, ${coachData.tagline}. ${coachData.background}`,
      });

      return {
        id: coach.id,
        name: coach.name,
        tagline: coach.tagline,
        personality: coach.personality,
        expertise: coach.expertise,
        background: coach.background,
        conversationStyle: coach.conversation_style,
        color: coach.color,
        systemPrompt: coach.system_prompt,
        createdAt: coach.created_at,
        updatedAt: coach.updated_at,
      };
    } catch (error) {
      console.error('Failed to create coach:', error);
      throw new Error('Failed to create coach. Please try again.');
    }
  }

  // Send message to coach (uses backend for AI, saves to Supabase)
  static async sendMessage(
    coachId: string,
    message: string,
    sessionId?: string,
    onTyping?: (text: string) => void
  ): Promise<{
    sessionId: string;
    response: string;
  }> {
    try {
      const coach = await databaseService.getCoach(coachId);
      if (!coach) {
        throw new Error('Coach not found');
      }

      // Get user's Orbit profile for context
      const userProfile = await databaseService.getUserProfile();

      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          coachId, 
          message,
          sessionId,
          coach: {
            id: coach.id,
            name: coach.name,
            tagline: coach.tagline,
            personality: coach.personality,
            expertise: coach.expertise,
            background: coach.background,
            conversationStyle: coach.conversation_style,
            systemPrompt: coach.system_prompt
          },
          userContext: userProfile ? {
            coreValues: userProfile.core_values,
            fiveYearGoal: userProfile.five_year_goal,
            oneYearGoal: userProfile.one_year_goal,
            tenYearGoal: userProfile.ten_year_goal,
            currentAnxieties: userProfile.current_anxieties,
          } : null
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Simulate typing animation
      if (onTyping && data.response) {
        const words = data.response.split(' ');
        let currentText = '';
        
        for (let i = 0; i < words.length; i++) {
          currentText += (i > 0 ? ' ' : '') + words[i];
          onTyping(currentText);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      return data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  }

  // Get all coaches from Supabase
  static async getCoaches(): Promise<CoachData[]> {
    try {
      const coaches = await databaseService.getCoaches();
      return coaches.map(coach => ({
        id: coach.id,
        name: coach.name,
        tagline: coach.tagline,
        personality: coach.personality,
        expertise: coach.expertise,
        background: coach.background,
        conversationStyle: coach.conversation_style,
        color: coach.color,
        image: coach.avatar_url,
        systemPrompt: coach.system_prompt,
        createdAt: coach.created_at,
        updatedAt: coach.updated_at,
      }));
    } catch (error) {
      console.error('Failed to fetch coaches:', error);
      return [];
    }
  }

  // Get specific coach from Supabase
  static async getCoach(coachId: string): Promise<CoachData | null> {
    try {
      const coach = await databaseService.getCoach(coachId);
      if (!coach) return null;

      return {
        id: coach.id,
        name: coach.name,
        tagline: coach.tagline,
        personality: coach.personality,
        expertise: coach.expertise,
        background: coach.background,
        conversationStyle: coach.conversation_style,
        color: coach.color,
        systemPrompt: coach.system_prompt,
        createdAt: coach.created_at,
        updatedAt: coach.updated_at,
      };
    } catch (error) {
      console.error('Failed to fetch coach:', error);
      return null;
    }
  }

  // Create chat session using Supabase
  static async createChatSession(coachId: string): Promise<string> {
    try {
      const session = await databaseService.createChatSession(coachId);
      return session.id;
    } catch (error) {
      console.error('Failed to create chat session:', error);
      throw new Error('Failed to create chat session.');
    }
  }
}