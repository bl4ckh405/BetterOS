import { GoogleGenAI } from '@google/genai';
import { trackGemini } from 'opik-gemini';
import { ChatMessage, CoachData } from '../types';
import { ragService } from './rag';

interface UserContext {
  values?: string[];
  five_year_goal?: string;
  anxieties?: string[];
  long_term_goals?: Array<{ title: string; progress: number }>;
  weekly_goals?: Array<{ title: string; progress: number }>;
  todays_tasks?: Array<{ title: string; completed: boolean }>;
  habits?: Array<{ name: string; completed: boolean }>;
  ai_preferences?: any;
  work_style?: string;
  motivation_type?: string;
}

export class AIService {
  private trackedGenAI: any;

  constructor() {
    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    });

    this.trackedGenAI = trackGemini(genAI, {
      traceMetadata: {
        tags: ['betteros', 'crew'],
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
    conversationHistory: ChatMessage[] = [],
    userContext?: any
  ): Promise<string> {
    try {
      let relevantContext: string[] = [];
      try {
        relevantContext = await ragService.retrieveContext(coach.id, message, 3);
        if (relevantContext.length > 0) {
          console.log(`📚 Retrieved ${relevantContext.length} knowledge chunks`);
        }
      } catch (ragError: any) {
        console.log('⚠️ RAG retrieval error:', ragError.message);
      }
      
      const conversationContext = conversationHistory
        .slice(-10)
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n');

      const knowledgeContext = relevantContext.length > 0
        ? `\n\nRELEVANT KNOWLEDGE FROM YOUR CONTENT:\n${relevantContext.map((ctx, i) => `[${i + 1}] ${ctx}`).join('\n\n')}`
        : '';

      // Add user Orbit context if available
      const orbitContext = userContext ? `\n\nUSER'S ORBIT CONTEXT (Use this to personalize your coaching):
- Core Values: ${userContext.coreValues?.join(', ') || 'Not set'}
- 5-Year Goal: ${userContext.fiveYearGoal || 'Not set'}
- 1-Year Goal: ${userContext.oneYearGoal || 'Not set'}
- 10-Year Vision: ${userContext.tenYearGoal || 'Not set'}
- Current Challenges: ${userContext.currentAnxieties?.join(', ') || 'None'}

Use this context to provide personalized, relevant coaching that aligns with their values and goals.` : '';

      const fullPrompt = `${coach.systemPrompt}${orbitContext}${knowledgeContext}\n\nCONVERSATION HISTORY:\n${conversationContext}\n\nUSER: ${message}\n\nASSISTANT:`;

      const response = await this.trackedGenAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: fullPrompt,
      });

      return response.text;
    } catch (error: any) {
      console.error('❌ Error generating response:', error);
      throw error;
    }
  }

  async getCrewResponse(modeId: string, message: string, userContext: UserContext, conversationHistory: string): Promise<string> {
    // Get AI preferences from user context
    const aiPrefs = userContext.ai_preferences || {};
    const bossPrefs = aiPrefs.boss || { tone: 'direct', verbosity: 'concise', challenge_level: 'high' };
    const creativePrefs = aiPrefs.creative || { tone: 'warm', verbosity: 'detailed', encouragement: 'high' };
    const stoicPrefs = aiPrefs.stoic || { tone: 'calm', verbosity: 'balanced', depth: 'philosophical' };

    // Build tone instructions
    const getToneInstruction = (tone: string) => {
      const tones: Record<string, string> = {
        direct: 'Be direct and to the point.',
        warm: 'Be warm and encouraging.',
        calm: 'Be calm and measured.',
      };
      return tones[tone] || tones.direct;
    };

    const getVerbosityInstruction = (verbosity: string) => {
      const verbosities: Record<string, string> = {
        concise: 'Keep responses brief (2-3 sentences).',
        balanced: 'Provide balanced responses (3-4 sentences).',
        detailed: 'Give detailed, thoughtful responses (4-6 sentences).',
      };
      return verbosities[verbosity] || verbosities.balanced;
    };

    const prompts: Record<string, string> = {
      boss: `You are "The Boss" - ruthless prioritization expert. Challenge everything.

Communication Style:
- ${getToneInstruction(bossPrefs.tone)}
- ${getVerbosityInstruction(bossPrefs.verbosity)}
- Challenge level: ${bossPrefs.challenge_level}

Context:
- Core Values: ${userContext.values?.join(', ') || 'Not set'}
- 5-Year Goal: ${userContext.five_year_goal || 'Not set'}
- Work Style: ${userContext.work_style || 'Not set'}
- Long-term Goals: ${userContext.long_term_goals?.map(g => `${g.title} (${g.progress}%)`).join(', ') || 'None'}
- Weekly Goals: ${userContext.weekly_goals?.map(g => `${g.title} (${g.progress}%)`).join(', ') || 'None'}
- Today's Tasks: ${userContext.todays_tasks?.map(t => t.title).join(', ') || 'None'}

Conversation:
${conversationHistory}

Message: "${message}"

Respond as The Boss. Focus on what truly matters. Speak naturally without labels.`,
      
      creative: `You are "The Creative" - expansive thinker. "Yes, and..." mentality.

Communication Style:
- ${getToneInstruction(creativePrefs.tone)}
- ${getVerbosityInstruction(creativePrefs.verbosity)}
- Encouragement level: ${creativePrefs.encouragement}

Context:
- Core Values: ${userContext.values?.join(', ') || 'Not set'}
- 5-Year Goal: ${userContext.five_year_goal || 'Not set'}
- Motivation: ${userContext.motivation_type || 'Not set'}
- Long-term Goals: ${userContext.long_term_goals?.map(g => `${g.title} (${g.progress}%)`).join(', ') || 'None'}
- Weekly Goals: ${userContext.weekly_goals?.map(g => `${g.title} (${g.progress}%)`).join(', ') || 'None'}

Conversation:
${conversationHistory}

Message: "${message}"

Respond as The Creative. Expand on their ideas, encourage exploration. Use "Yes, and..." thinking. Speak naturally without labels.`,
      
      stoic: `You are "The Stoic" - wise journaling companion. Help process emotions with Stoic philosophy.

Communication Style:
- ${getToneInstruction(stoicPrefs.tone)}
- ${getVerbosityInstruction(stoicPrefs.verbosity)}
- Philosophical depth: ${stoicPrefs.depth}

Context:
- Core Values: ${userContext.values?.join(', ') || 'Not set'}
- Current Anxieties: ${userContext.anxieties?.join(', ') || 'None'}
- Long-term Goals: ${userContext.long_term_goals?.map(g => g.title).join(', ') || 'None'}

Conversation:
${conversationHistory}

Message: "${message}"

Respond as The Stoic. Ask thoughtful questions, guide them to clarity and acceptance. Use Stoic wisdom. Speak naturally without labels.`
    };

    const response = await this.trackedGenAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompts[modeId] || prompts.boss,
    });

    return response.text;
  }

  async getDailyStandupGreeting(userContext: UserContext): Promise<string> {
    const completedTasks = userContext.todays_tasks?.filter(t => t.completed).length || 0;
    const totalTasks = userContext.todays_tasks?.length || 0;
    const completedHabits = userContext.habits?.filter(h => h.completed).length || 0;
    const totalHabits = userContext.habits?.length || 0;

    const prompt = `You are a PM doing a 5 PM daily standup. Be friendly but direct.

Today's Progress:
- Tasks: ${completedTasks}/${totalTasks} completed
- Habits: ${completedHabits}/${totalHabits} completed
- Weekly Goals: ${userContext.weekly_goals?.map(g => `${g.title} (${g.progress}%)`).join(', ') || 'None'}

Start the standup naturally. Ask how the day went and what was accomplished. Be conversational (2-3 sentences). Do not use labels like "user to boss" or "boss to user" - just speak directly.`;

    const response = await this.trackedGenAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  }

  async getDailyStandupResponse(message: string, userContext: UserContext, conversationHistory: string): Promise<string> {
    const completedTasks = userContext.todays_tasks?.filter(t => t.completed).length || 0;
    const totalTasks = userContext.todays_tasks?.length || 0;

    const prompt = `You are a PM holding a daily standup at 5 PM. Hold them accountable but be supportive.

Context:
- Core Values: ${userContext.values?.join(', ') || 'Not set'}
- 5-Year Goal: ${userContext.five_year_goal || 'Not set'}
- Tasks Today: ${completedTasks}/${totalTasks} completed
- Weekly Goals: ${userContext.weekly_goals?.map(g => `${g.title} (${g.progress}%)`).join(', ') || 'None'}

Conversation:
${conversationHistory}

Message: "${message}"

Respond as their PM. Ask follow-up questions about blockers, celebrate wins, hold them accountable for incomplete tasks. Be direct but encouraging (3-4 sentences). Speak naturally without labels.`;

    const response = await this.trackedGenAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  }

  async flush() {
    await this.trackedGenAI.flush();
  }
}

export const aiService = new AIService();
