import { supabase } from './supabase';
import { authService } from './auth';

export interface StandupMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

class StandupService {
  private getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  async getTodayMessages(): Promise<StandupMessage[]> {
    const userId = await authService.getUserId();
    const today = this.getTodayDateString();

    const { data, error } = await supabase
      .from('standup_messages')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async saveMessage(role: 'user' | 'assistant', content: string): Promise<void> {
    const userId = await authService.getUserId();
    const today = this.getTodayDateString();

    const { error } = await supabase
      .from('standup_messages')
      .insert({
        user_id: userId,
        date: today,
        role,
        content,
      });

    if (error) throw error;
  }
}

export const standupService = new StandupService();
