import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AIMode, ChatSession } from '../types';
import { DEFAULT_MODES } from '../constants/modes';
import { databaseService } from '../services/database';

interface OrbitContextType {
  userProfile: UserProfile | null;
  currentMode: AIMode;
  chatSessions: ChatSession[];
  setUserProfile: (profile: UserProfile) => void;
  setCurrentMode: (mode: AIMode) => void;
  addChatSession: (session: ChatSession) => void;
  isOnboarded: boolean;
  loading: boolean;
}

const OrbitContext = createContext<OrbitContextType | undefined>(undefined);

export const OrbitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [currentMode, setCurrentMode] = useState<AIMode>(DEFAULT_MODES[0]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  const isOnboarded = userProfile !== null;

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await databaseService.getUserProfile();
      if (profile) {
        setUserProfileState({
          id: profile.id,
          coreValues: profile.core_values,
          fiveYearGoal: profile.five_year_goal,
          currentAnxieties: profile.current_anxieties,
          createdAt: new Date(profile.created_at),
          updatedAt: new Date(profile.updated_at),
        });
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