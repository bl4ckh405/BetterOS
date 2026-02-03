import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString(),
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

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
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
      const { data, error } = await supabase
        .from('coaches')
        .insert({
          ...coachData,
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
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
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

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching coach:', error);
      return null;
    }
  }

  // Chat Sessions
  async createChatSession(coachId: string): Promise<ChatSession> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          coach_id: coachId,
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