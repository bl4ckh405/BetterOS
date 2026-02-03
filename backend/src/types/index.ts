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
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  coachId: string;
  sessionId: string;
}

export interface ChatSession {
  id: string;
  coachId: string;
  userId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCoachRequest {
  name: string;
  tagline: string;
  personality: string[];
  expertise: string[];
  background: string;
  conversationStyle: string;
  color: string;
  image?: string;
  youtubeChannelUrl?: string;
}

export interface SendMessageRequest {
  coachId: string;
  message: string;
  sessionId?: string;
}