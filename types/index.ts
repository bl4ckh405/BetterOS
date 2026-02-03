export interface UserProfile {
  id: string;
  coreValues: string[];
  fiveYearGoal: string;
  currentAnxieties: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMode {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  color: string;
  temperature: number;
  isCustom: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  modeId: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  modeId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export type ModeType = 'boss' | 'creative' | 'stoic' | 'clarity' | 'custom';