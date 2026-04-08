import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { databaseService, Coach } from '../services/database';
import { authService } from '../services/auth';

interface CoachContextType {
  coaches: Coach[];
  loading: boolean;
  refreshCoaches: () => Promise<void>;
}

const CoachContext = createContext<CoachContextType | undefined>(undefined);

export const useCoaches = () => {
  const context = useContext(CoachContext);
  if (!context) {
    throw new Error('useCoaches must be used within a CoachProvider');
  }
  return context;
};

interface CoachProviderProps {
  children: ReactNode;
}

export const CoachProvider: React.FC<CoachProviderProps> = ({ children }) => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCoaches = async () => {
    try {
      const coachData = await databaseService.getCoaches();
      setCoaches(coachData);
    } catch (error) {
      console.error('Error loading coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCoaches = async () => {
    await loadCoaches();
  };

  useEffect(() => {
    initializeAndLoad();
  }, []);

  const initializeAndLoad = async () => {
    try {
      await authService.initialize();
      await loadCoaches();
      subscribeToChanges();
    } catch (error) {
      console.error('Error initializing coaches:', error);
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const userId = authService.getUserId();
    const subscription = databaseService.supabase
      .channel('coaches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'coaches',
        },
        (payload) => {
          const newCoach = payload.new as Coach;
          const oldCoach = payload.old as Coach;
          
          // Only process if coach belongs to user, is public, or is system coach
          if (newCoach && newCoach.user_id && newCoach.user_id !== userId && !newCoach.is_public) return;
          if (oldCoach && oldCoach.user_id && oldCoach.user_id !== userId && !oldCoach.is_public) return;
          console.log('🔄 Coach change detected:', payload.eventType, newCoach?.name || oldCoach?.name);
          
          if (payload.eventType === 'INSERT') {
            console.log('➕ Adding new coach:', newCoach.name);
            setCoaches(prev => [newCoach, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            console.log('✏️ Updating coach:', newCoach.name);
            setCoaches(prev => 
              prev.map(coach => 
                coach.id === newCoach.id ? newCoach : coach
              )
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ Deleting coach:', oldCoach.name);
            setCoaches(prev => 
              prev.filter(coach => coach.id !== oldCoach.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Coaches subscription status:', status);
      });

    return () => {
      subscription.unsubscribe();
    };
  };

  return (
    <CoachContext.Provider value={{ coaches, loading, refreshCoaches }}>
      {children}
    </CoachContext.Provider>
  );
};