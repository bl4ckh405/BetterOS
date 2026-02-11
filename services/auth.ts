import { supabase } from './supabase';

class AuthService {
  private userId: string | null = null;

  async initialize() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      this.userId = session.user.id;
      return session.user.id;
    }
    
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) throw error;
    if (!data.user) throw new Error('Failed to create anonymous user');
    
    this.userId = data.user.id;
    return data.user.id;
  }

  getUserId(): string {
    if (!this.userId) {
      throw new Error('Auth not initialized. Call initialize() first.');
    }
    return this.userId;
  }

  async clearUser() {
    await supabase.auth.signOut();
    this.userId = null;
  }
}

export const authService = new AuthService();
