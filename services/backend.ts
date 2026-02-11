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

  async getDailyStandupGreeting(userContext: any): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/api/crew/standup/greeting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userContext }),
    });

    if (!response.ok) throw new Error('Failed to get standup greeting');
    const data = await response.json();
    return data.greeting;
  }

  async sendDailyStandupMessage(message: string, userContext: any, conversationHistory: string): Promise<string> {
    const response = await fetch(`${BACKEND_URL}/api/crew/standup/response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userContext, conversationHistory }),
    });

    if (!response.ok) throw new Error('Failed to send standup message');
    const data = await response.json();
    return data.response;
  }
}

export const backendService = new BackendService();