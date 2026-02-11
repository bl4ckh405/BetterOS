import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { settingsService } from '@/services/settings';

type ThemeContextType = {
  theme: 'light' | 'dark' | 'auto';
  actualTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'auto') => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [theme, setThemeState] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const settings = await settingsService.getSettings();
    setThemeState(settings.theme);
  };

  const setTheme = async (newTheme: 'light' | 'dark' | 'auto') => {
    setThemeState(newTheme);
    await settingsService.updateSettings({ theme: newTheme });
  };

  const actualTheme = theme === 'auto' ? (systemScheme || 'light') : theme;

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
}
