import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Goal {
  id: string;
  title: string;
  deadline_days: number;
  progress: number;
  milestones: Milestone[];
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
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
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

  async getGoals(): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      await AsyncStorage.setItem(this.GOALS_CACHE_KEY, JSON.stringify(data));
      return data || [];
    } catch (error) {
      console.error('Error fetching goals:', error);
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

  // Tasks
  async getTodaysTasks(): Promise<Task[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('created_at', today)
        .order('created_at', { ascending: true });

      if (error) throw error;

      await AsyncStorage.setItem(this.TASKS_CACHE_KEY, JSON.stringify(data));
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      const cached = await AsyncStorage.getItem(this.TASKS_CACHE_KEY);
      return cached ? JSON.parse(cached) : this.getDefaultTasks();
    }
  }

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'user_id'>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
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

  // Habits
  async getHabits(): Promise<Habit[]> {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      await AsyncStorage.setItem(this.HABITS_CACHE_KEY, JSON.stringify(data));
      return data || [];
    } catch (error) {
      console.error('Error fetching habits:', error);
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
    return [
      {
        id: 'habit-1',
        name: 'Morning Pages',
        icon: 'pencil',
        completed_today: true,
        streak: 5,
        created_at: new Date().toISOString(),
      },
      {
        id: 'habit-2',
        name: 'Exercise',
        icon: 'figure.run',
        completed_today: true,
        streak: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: 'habit-3',
        name: 'Meditation',
        icon: 'brain.head.profile',
        completed_today: true,
        streak: 7,
        created_at: new Date().toISOString(),
      },
      {
        id: 'habit-4',
        name: 'Reading',
        icon: 'book.fill',
        completed_today: false,
        streak: 0,
        created_at: new Date().toISOString(),
      },
    ];
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