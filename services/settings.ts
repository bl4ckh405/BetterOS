import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  textSize: 'small' | 'medium' | 'large';
  
  // Voice
  voiceEnabled: boolean;
  voiceSpeed: number; // 0.5 to 2.0
  voiceVolume: number; // 0 to 1
}

const SETTINGS_KEY = '@betterOS_settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'auto',
  textSize: 'medium',
  voiceEnabled: true,
  voiceSpeed: 1.0,
  voiceVolume: 0.8,
};

class SettingsService {
  async getSettings(): Promise<AppSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  }

  async resetSettings(): Promise<void> {
    await AsyncStorage.removeItem(SETTINGS_KEY);
  }
}

export const settingsService = new SettingsService();
