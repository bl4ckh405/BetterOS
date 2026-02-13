import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AIMode, ChatSession } from '../types';
import { DEFAULT_MODES } from '../constants/modes';
import { databaseService } from '../services/database';
import { authService } from '../services/auth';

interface OrbitContextType {
  userProfile: UserProfile | null;
  currentMode: AIMode;
  chatSessions: ChatSession[];
  setUserProfile: (profile: UserProfile) => void;
  setCurrentMode: (mode: AIMode) => void;
  addChatSession: (session: ChatSession) => void;
  isOnboarded: boolean;
  loading: boolean;
  loadUserProfile: () => Promise<void>;
}

const OrbitContext = createContext<OrbitContextType | undefined>(undefined);

export const OrbitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [currentMode, setCurrentMode] = useState<AIMode>(DEFAULT_MODES[0]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  const isOnboarded = userProfile !== null && 
    userProfile.coreValues && 
    userProfile.coreValues.length > 0 &&
    (userProfile as any).onboardingCompleted === true;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      await authService.initialize();
      await loadUserProfile();
    } catch (error) {
      console.error('Error initializing auth:', error);
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await databaseService.getUserProfile();
      if (profile) {
        setUserProfileState({
          id: profile.id,
          name: (profile as any).name,
          coreValues: profile.core_values,
          tenYearGoal: profile.ten_year_goal,
          fiveYearGoal: profile.five_year_goal,
          oneYearGoal: profile.one_year_goal,
          currentAnxieties: profile.current_anxieties,
          lastDailyCheckIn: profile.last_daily_checkin,
          lastWeeklyCheckIn: profile.last_weekly_checkin,
          createdAt: new Date(profile.created_at),
          updatedAt: new Date(profile.updated_at),
          onboardingCompleted: (profile as any).metadata?.onboarding_completed === true,
        } as any);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const setUserProfile = async (profile: UserProfile) => {
    try {
      await databaseService.saveUserProfile({
        core_values: profile.coreValues,
        five_year_goal: profile.fiveYearGoal,
        ten_year_goal: profile.tenYearGoal,
        one_year_goal: profile.oneYearGoal,
        current_anxieties: profile.currentAnxieties,
      });
      setUserProfileState(profile);
    } catch (error) {
      console.error('Error saving user profile:', error);
      // Still update local state for offline use
      setUserProfileState(profile);
    }
  };

  const addChatSession = (session: ChatSession) => {
    setChatSessions(prev => [...prev, session]);
  };

  return (
    <OrbitContext.Provider
      value={{
        userProfile,
        currentMode,
        chatSessions,
        setUserProfile,
        setCurrentMode,
        addChatSession,
        isOnboarded,
        loading,
        loadUserProfile,
      }}
    >
      {children}
    </OrbitContext.Provider>
  );
};

export const useOrbit = () => {
  const context = useContext(OrbitContext);
  if (context === undefined) {
    throw new Error('useOrbit must be used within an OrbitProvider');
  }
  return context;
};