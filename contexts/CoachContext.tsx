import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { databaseService, Coach } from '../services/database';

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
    loadCoaches();

    // Subscribe to realtime changes
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
          console.log('🔄 Coach change detected:', payload.eventType, payload.new?.name || payload.old?.name);
          
          if (payload.eventType === 'INSERT') {
            console.log('➕ Adding new coach:', payload.new.name);
            setCoaches(prev => [payload.new as Coach, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            console.log('✏️ Updating coach:', payload.new.name);
            setCoaches(prev => 
              prev.map(coach => 
                coach.id === payload.new.id ? payload.new as Coach : coach
              )
            );
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ Deleting coach:', payload.old.name);
            setCoaches(prev => 
              prev.filter(coach => coach.id !== payload.old.id)
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
  }, []);

  return (
    <CoachContext.Provider value={{ coaches, loading, refreshCoaches }}>
      {children}
    </CoachContext.Provider>
  );
};