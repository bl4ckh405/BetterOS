import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsService } from '@/services/settings';

type TextSize = 'small' | 'medium' | 'large';

type TextSizeContextType = {
  textSize: TextSize;
  setTextSize: (size: TextSize) => Promise<void>;
  getFontSize: (base: number) => number;
};

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

const SIZE_MULTIPLIERS = {
  small: 0.875,   // 87.5%
  medium: 1,      // 100%
  large: 1.125,   // 112.5%
};

export function TextSizeProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSize>('medium');

  useEffect(() => {
    loadTextSize();
  }, []);

  const loadTextSize = async () => {
    const settings = await settingsService.getSettings();
    setTextSizeState(settings.textSize);
  };

  const setTextSize = async (size: TextSize) => {
    setTextSizeState(size);
    await settingsService.updateSettings({ textSize: size });
  };

  const getFontSize = (base: number): number => {
    return Math.round(base * SIZE_MULTIPLIERS[textSize]);
  };

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize, getFontSize }}>
      {children}
    </TextSizeContext.Provider>
  );
}

export function useTextSize() {
  const context = useContext(TextSizeContext);
  if (!context) {
    throw new Error('useTextSize must be used within TextSizeProvider');
  }
  return context;
}
