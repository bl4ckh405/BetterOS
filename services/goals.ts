import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './auth';

export interface Goal {
  id: string;
  title: string;
  goal_type: 'long_term' | 'weekly' | 'daily';
  deadline?: string;
  deadline_days: number;
  progress: number;
  milestones: Milestone[];
  reminder_time?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  name: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  time?: string;
  deadline?: string;
  reminder_time?: string;
  completed: boolean;
  goal_id?: string;
  user_id?: string;
  created_at: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  completed_today: boolean;
  streak: number;
  user_id?: string;
  created_at: string;
}

class GoalsService {
  private readonly GOALS_CACHE_KEY = 'cached_goals';
  private readonly TASKS_CACHE_KEY = 'cached_tasks';
  private readonly HABITS_CACHE_KEY = 'cached_habits';

  // Goals
  async createGoal(goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Goal> {
    try {
      const userId = authService.getUserId();
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      await this.updateGoalsCache();
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  async getGoals(goalType?: 'long_term' | 'weekly' | 'daily', skipCache = false): Promise<Goal[]> {
    try {
      const userId = authService.getUserId();
      let query = supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (goalType) {
        query = query.eq('goal_type', goalType);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Filter out old weekly goals from previous weeks
      if (goalType === 'weekly' && filteredData.length > 0) {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday of current week
        weekStart.setHours(0, 0, 0, 0);
        
        filteredData = filteredData.filter(goal => {
          const goalDate = new Date(goal.created_at);
          return goalDate >= weekStart;
        });
      }

      await AsyncStorage.setItem(this.GOALS_CACHE_KEY, JSON.stringify(filteredData));
      return filteredData;
    } catch (error) {
      console.error('Error fetching goals:', error);
      if (skipCache) return [];
      const cached = await AsyncStorage.getItem(this.GOALS_CACHE_KEY);
      return cached ? JSON.parse(cached) : this.getDefaultGoals();
    }
  }

  async updateGoalProgress(goalId: string, progress: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ 
          progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) throw error;
      await this.updateGoalsCache();
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  async toggleMilestone(goalId: string, milestoneIndex: number): Promise<void> {
    try {
      const { data: goal } = await supabase
        .from('goals')
        .select('milestones')
        .eq('id', goalId)
        .single();

      if (!goal) return;

      const milestones = [...goal.milestones];
      milestones[milestoneIndex].done = !milestones[milestoneIndex].done;

      const completedCount = milestones.filter(m => m.done).length;
      const progress = Math.round((completedCount / milestones.length) * 100);

      const { error } = await supabase
        .from('goals')
        .update({ 
          milestones,
          progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) throw error;
      await this.updateGoalsCache();
    } catch (error) {
      console.error('Error toggling milestone:', error);
      throw error;
    }
  }

  // Tasks
  async getTodaysTasks(skipCache = false): Promise<Task[]> {
    try {
      const userId = authService.getUserId();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', todayStr)
        .order('created_at', { ascending: true });

      if (error) throw error;

      await AsyncStorage.setItem(this.TASKS_CACHE_KEY, JSON.stringify(data));
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (skipCache) return [];
      const cached = await AsyncStorage.getItem(this.TASKS_CACHE_KEY);
      return cached ? JSON.parse(cached) : this.getDefaultTasks();
    }
  }

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'user_id'>): Promise<Task> {
    try {
      const userId = authService.getUserId();
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: userId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async createHabit(habitData: Omit<Habit, 'id' | 'created_at' | 'user_id'>): Promise<Habit> {
    try {
      const userId = authService.getUserId();
      const { data, error } = await supabase
        .from('habits')
        .insert({
          ...habitData,
          user_id: userId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  }

  async deleteGoal(goalId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting goal:', goalId);
      const { error, data } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .select();

      console.log('Delete response:', { error, data });
      if (error) throw error;
      await AsyncStorage.removeItem(this.GOALS_CACHE_KEY);
    } catch (error) {
      console.error('❌ Error deleting goal:', error);
      throw error;
    }
  }

  async toggleTask(taskId: string): Promise<void> {
    try {
      const { data: task } = await supabase
        .from('tasks')
        .select('completed')
        .eq('id', taskId)
        .single();

      if (!task) return;

      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting task:', taskId);
      const { error, data } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .select();

      console.log('Delete response:', { error, data });
      if (error) throw error;
      await AsyncStorage.removeItem(this.TASKS_CACHE_KEY);
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      throw error;
    }
  }

  async deleteHabit(habitId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting habit:', habitId);
      const { error, data } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .select();

      console.log('Delete response:', { error, data });
      if (error) throw error;
      await AsyncStorage.removeItem(this.HABITS_CACHE_KEY);
    } catch (error) {
      console.error('❌ Error deleting habit:', error);
      throw error;
    }
  }

  // Habits
  async getHabits(skipCache = false): Promise<Habit[]> {
    try {
      const userId = authService.getUserId();
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      await AsyncStorage.setItem(this.HABITS_CACHE_KEY, JSON.stringify(data));
      return data || [];
    } catch (error) {
      console.error('Error fetching habits:', error);
      if (skipCache) return [];
      const cached = await AsyncStorage.getItem(this.HABITS_CACHE_KEY);
      return cached ? JSON.parse(cached) : this.getDefaultHabits();
    }
  }

  async toggleHabit(habitId: string): Promise<void> {
    try {
      const { data: habit } = await supabase
        .from('habits')
        .select('completed_today, streak')
        .eq('id', habitId)
        .single();

      if (!habit) return;

      const newCompleted = !habit.completed_today;
      const newStreak = newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1);

      const { error } = await supabase
        .from('habits')
        .update({ 
          completed_today: newCompleted,
          streak: newStreak
        })
        .eq('id', habitId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling habit:', error);
      throw error;
    }
  }

  // Default data for offline/fallback
  private getDefaultGoals(): Goal[] {
    return [
      {
        id: 'default-1',
        title: 'Buy a car',
        goal_type: 'long_term',
        deadline_days: 89,
        progress: 35,
        milestones: [
          { name: 'Research', done: true },
          { name: 'Test drives', done: false },
          { name: 'Financing', done: false },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  private getDefaultTasks(): Task[] {
    return [
      {
        id: 'task-1',
        title: 'Schedule test drive',
        time: '2:00 PM',
        completed: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'task-2',
        title: 'Call insurance',
        time: '4:00 PM',
        completed: false,
        created_at: new Date().toISOString(),
      },
    ];
  }

  private getDefaultHabits(): Habit[] {
    return [];
  }

  private async updateGoalsCache() {
    try {
      const goals = await this.getGoals();
      await AsyncStorage.setItem(this.GOALS_CACHE_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Error updating goals cache:', error);
    }
  }
}

export const goalsService = new GoalsService();