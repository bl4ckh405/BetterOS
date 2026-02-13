const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL|| 'http://localhost:3000';

export class BackendService {
  async sendCrewMessage(modeId: string, message: string, userContext: any, conversationHistory: string): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/api/crew/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modeId, message, userContext, conversationHistory }),
    });

    if (!response.ok) throw new Error('Failed to send crew message');
    const data = await response.json();
    return data.response;
  }

  async getTodayStandupMessages(userId: string): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/standup/messages?userId=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        console.warn('Backend standup endpoint not ready, returning empty array');
        return [];
      }
      const data = await response.json();
      return data.messages;
    } catch (error) {
      console.warn('Backend standup endpoint not available:', error);
      return [];
    }
  }

  async sendStandupMessage(userId: string, message: string, userContext: any): Promise<{ response: string; messages: any[] }> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/standup/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message, userContext }),
      });

      if (!response.ok) {
        console.warn('Backend standup endpoint not ready, using fallback');
        throw new Error('Using fallback');
      }
      return await response.json();
    } catch (error) {
      // Fallback: return mock response
      const mockResponse = message 
        ? "I understand. Let me help you with that. (Backend endpoint needed for full functionality)"
        : "Good evening! Ready for your daily standup? Share what you accomplished today and what's on your mind for tomorrow.";
      
      return {
        response: mockResponse,
        messages: [
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: mockResponse,
            created_at: new Date().toISOString(),
          },
          ...(message ? [{
            id: (Date.now() + 1).toString(),
            role: 'user',
            content: message,
            created_at: new Date().toISOString(),
          }] : [])
        ]
      };
    }
  }
}

export const backendService = new BackendService();