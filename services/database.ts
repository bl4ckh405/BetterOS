import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './auth';

export interface Coach {
  id: string;
  name: string;
  tagline: string;
  personality: string[];
  expertise: string[];
  background: string;
  conversation_style: string;
  color: string;
  system_prompt: string;
  avatar_url?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  core_values: string[];
  five_year_goal: string;
  current_anxieties: string[];
  ten_year_goal?: string;
  one_year_goal?: string;
  last_daily_checkin?: string;
  last_weekly_checkin?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  coach_id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

class DatabaseService {
  private readonly COACHES_CACHE_KEY = 'cached_coaches';
  private readonly PROFILE_CACHE_KEY = 'cached_profile';
  
  // Export supabase for direct queries
  public supabase = supabase;

  // User Profile
  async saveUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const userId = authService.getUserId();
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          ...profile,
          user_id: userId,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      // Cache offline
      await AsyncStorage.setItem(this.PROFILE_CACHE_KEY, JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  async updateCheckInTimestamp(type: 'daily' | 'weekly') {
    try {
      const userId = authService.getUserId();
      const field = type === 'daily' ? 'last_daily_checkin' : 'last_weekly_checkin';
      const timestamp = new Date().toISOString();
      
      console.log(`🔄 Updating ${type} check-in for user:`, userId);
      console.log(`📅 Setting ${field} to:`, timestamp);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          [field]: timestamp,
          updated_at: timestamp
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Update successful, returned data:', data);
      
      if (data) {
        await AsyncStorage.setItem(this.PROFILE_CACHE_KEY, JSON.stringify(data));
        console.log('💾 Cached updated profile');
      }
      return data;
    } catch (error) {
      console.error('❌ Error updating check-in timestamp:', error);
      return null;
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const userId = authService.getUserId();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        await AsyncStorage.setItem(this.PROFILE_CACHE_KEY, JSON.stringify(data));
        return data;
      }

      // Fallback to cache
      const cached = await AsyncStorage.getItem(this.PROFILE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Return cached data on error
      const cached = await AsyncStorage.getItem(this.PROFILE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    }
  }

  // Coaches
  async createCoach(coachData: Omit<Coach, 'id' | 'created_at' | 'updated_at' | 'user_id'>) {
    try {
      const userId = authService.getUserId();
      const { data, error } = await supabase
        .from('coaches')
        .insert({
          ...coachData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update cache
      await this.updateCoachesCache();
      return data;
    } catch (error) {
      console.error('Error creating coach:', error);
      throw error;
    }
  }

  async getCoaches(): Promise<Coach[]> {
    try {
      const userId = authService.getUserId();
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cache the data
      await AsyncStorage.setItem(this.COACHES_CACHE_KEY, JSON.stringify(data));
      return data || [];
    } catch (error) {
      console.error('Error fetching coaches:', error);
      // Return cached data on error
      const cached = await AsyncStorage.getItem(this.COACHES_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    }
  }

  async getCoach(id: string): Promise<Coach | null> {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching coach:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Coach fetched:', {
          id: data.id,
          name: data.name,
          avatar_url: data.avatar_url,
          hasAvatar: !!data.avatar_url
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching coach:', error);
      return null;
    }
  }

  // Chat Sessions
  async createChatSession(coachId: string): Promise<ChatSession> {
    try {
      const userId = authService.getUserId();
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          coach_id: coachId,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  // Messages
  async saveMessage(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...message,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  private async updateCoachesCache() {
    try {
      const coaches = await this.getCoaches();
      await AsyncStorage.setItem(this.COACHES_CACHE_KEY, JSON.stringify(coaches));
    } catch (error) {
      console.error('Error updating coaches cache:', error);
    }
  }

  // Offline sync
  async syncOfflineData() {
    try {
      // Sync any pending offline data when connection is restored
      console.log('Syncing offline data...');
      await this.updateCoachesCache();
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }
}

export const databaseService = new DatabaseService();