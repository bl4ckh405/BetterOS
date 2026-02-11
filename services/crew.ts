import { supabase } from './supabase';
import { authService } from './auth';
import { goalsService } from './goals';

export interface CrewMessage {
  id: string;
  user_id: string;
  session_date: string;
  crew_member: 'boss' | 'creative' | 'stoic';
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

class CrewService {
  // Get today's date in YYYY-MM-DD format
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Get all messages for today's session (across all crew members)
  async getTodaySession(): Promise<CrewMessage[]> {
    try {
      const userId = authService.getUserId();
      const today = this.getTodayDate();

      const { data, error } = await supabase
        .from('crew_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('session_date', today)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching today session:', error);
      return [];
    }
  }

  // Get messages for a specific crew member today
  async getCrewMemberMessages(crewMember: 'boss' | 'creative' | 'stoic'): Promise<CrewMessage[]> {
    try {
      const userId = authService.getUserId();
      const today = this.getTodayDate();

      const { data, error } = await supabase
        .from('crew_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('session_date', today)
        .eq('crew_member', crewMember)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching ${crewMember} messages:`, error);
      return [];
    }
  }

  // Save a message to the shared session
  async saveMessage(
    crewMember: 'boss' | 'creative' | 'stoic',
    role: 'user' | 'assistant',
    content: string
  ): Promise<CrewMessage | null> {
    try {
      const userId = authService.getUserId();
      const today = this.getTodayDate();

      const { data, error } = await supabase
        .from('crew_messages')
        .insert({
          user_id: userId,
          session_date: today,
          crew_member: crewMember,
          role,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  }

  // Build context for AI including goals, habits, tasks, and other crew conversations
  async buildCrewContext(currentCrewMember: 'boss' | 'creative' | 'stoic'): Promise<string> {
    try {
      const [goals, weeklyGoals, tasks, habits, allMessages] = await Promise.all([
        goalsService.getGoals('long_term'),
        goalsService.getGoals('weekly'),
        goalsService.getTodaysTasks(),
        goalsService.getHabits(),
        this.getTodaySession(),
      ]);

      let context = '# Today\'s Context\n\n';

      // Add goals
      if (goals.length > 0) {
        context += '## Long-term Goals:\n';
        goals.forEach(goal => {
          context += `- ${goal.title} (${goal.progress}% complete, ${goal.deadline_days} days left)\n`;
          if (goal.milestones.length > 0) {
            goal.milestones.forEach(m => {
              context += `  ${m.done ? '✓' : '○'} ${m.name}\n`;
            });
          }
        });
        context += '\n';
      }

      // Add weekly goals
      if (weeklyGoals.length > 0) {
        context += '## This Week\'s Goals:\n';
        weeklyGoals.forEach(goal => {
          context += `- ${goal.title} (${goal.progress}% complete)\n`;
          if (goal.milestones.length > 0) {
            goal.milestones.forEach(m => {
              context += `  ${m.done ? '✓' : '○'} ${m.name}\n`;
            });
          }
        });
        context += '\n';
      }

      // Add today's tasks
      if (tasks.length > 0) {
        context += '## Today\'s Tasks:\n';
        tasks.forEach(task => {
          context += `${task.completed ? '✓' : '○'} ${task.title}${task.time ? ` (${task.time})` : ''}\n`;
        });
        context += '\n';
      }

      // Add habits
      if (habits.length > 0) {
        context += '## Daily Rituals:\n';
        habits.forEach(habit => {
          context += `${habit.completed_today ? '✓' : '○'} ${habit.name} (${habit.streak} day streak)\n`;
        });
        context += '\n';
      }

      // Add conversations from other crew members
      const otherCrewMessages = allMessages.filter(m => m.crew_member !== currentCrewMember);
      if (otherCrewMessages.length > 0) {
        context += '## What the crew discussed today:\n';
        
        const crewNames = {
          boss: 'The Boss',
          creative: 'The Creative',
          stoic: 'The Stoic',
        };

        otherCrewMessages.forEach(msg => {
          if (msg.role === 'user') {
            context += `User to ${crewNames[msg.crew_member]}: "${msg.content}"\n`;
          } else {
            context += `${crewNames[msg.crew_member]}: "${msg.content}"\n`;
          }
        });
        context += '\n';
      }

      return context;
    } catch (error) {
      console.error('Error building crew context:', error);
      return '';
    }
  }

  // Clear old sessions (optional cleanup)
  async clearOldSessions(daysToKeep: number = 7): Promise<void> {
    try {
      const userId = authService.getUserId();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      const { error } = await supabase
        .from('crew_messages')
        .delete()
        .eq('user_id', userId)
        .lt('session_date', cutoffStr);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing old sessions:', error);
    }
  }
}

export const crewService = new CrewService();
