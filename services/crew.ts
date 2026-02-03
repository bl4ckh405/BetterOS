const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface UserContext {
  values?: string[];
  five_year_goal?: string;
  anxieties?: string[];
  financial_data?: any;
  goals?: Array<{ title: string; progress: number }>;
  todos?: string[];
}

export interface GoalPlan {
  goal: string;
  deadline_days: number;
  plan: string;
  agents_involved: string[];
}

export interface HomescreenInsights {
  briefing: string;
  timestamp: string;
}

export class CrewService {
  async createGoalPlan(
    goal: string,
    deadlineDays: number,
    userContext: UserContext
  ): Promise<GoalPlan> {
    const response = await fetch(`${API_URL}/api/crew/create-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goal,
        deadlineDays,
        userContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create goal plan: ${response.statusText}`);
    }

    return response.json();
  }

  async getHomescreenInsights(userContext: UserContext): Promise<HomescreenInsights> {
    const response = await fetch(`${API_URL}/api/crew/homescreen-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get homescreen insights: ${response.statusText}`);
    }

    return response.json();
  }

  async realignTodos(
    todos: string[],
    userContext: UserContext
  ): Promise<{ filtered_todos: string }> {
    const response = await fetch(`${API_URL}/api/crew/realignment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        todos,
        userContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to realign todos: ${response.statusText}`);
    }

    return response.json();
  }

  async getRealignment(userContext: UserContext): Promise<any> {
    const todos = userContext.todos || [];
    return this.realignTodos(todos, userContext);
  }
}

export const crewService = new CrewService();