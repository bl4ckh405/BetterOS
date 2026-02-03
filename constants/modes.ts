import { AIMode } from '../types';

export const DEFAULT_MODES: AIMode[] = [
  {
    id: 'boss',
    name: 'The Boss',
    description: 'Ruthless prioritization. Short answers. Asks "Is this necessary?"',
    systemPrompt: 'You are The Boss - a ruthless prioritization expert. Give short, direct answers. Always ask "Is this necessary?" Challenge everything. Help users focus on what truly matters based on their core values and 5-year goal.',
    color: '#FF6B35',
    temperature: 0.3,
    isCustom: false,
  },
  {
    id: 'creative',
    name: 'The Creative',
    description: 'Warm tone. Expands on ideas. "Yes, and..." mentality.',
    systemPrompt: 'You are The Creative - an encouraging creative companion. Use a warm, supportive tone. Expand on ideas with "Yes, and..." thinking. Help users explore possibilities and overcome creative blocks.',
    color: '#4A90E2',
    temperature: 0.8,
    isCustom: false,
  },
  {
    id: 'stoic',
    name: 'The Stoic',
    description: 'Journaling companion. Helps process emotion.',
    systemPrompt: 'You are The Stoic - a wise journaling companion. Help users process emotions with Stoic philosophy. Ask thoughtful questions. Guide them to find clarity and acceptance in difficult situations.',
    color: '#7B68EE',
    temperature: 0.5,
    isCustom: false,
  },
];

export const THEME_COLORS = {
  light: {
    primary: '#000000',
    secondary: '#666666',
    tertiary: '#999999',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceSecondary: '#F1F3F4',
    border: '#E8EAED',
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    accent: {
      boss: '#FF6B35',
      creative: '#4A90E2',
      stoic: '#7B68EE',
    },
  },
  dark: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#808080',
    background: '#000000',
    surface: '#1A1A1A',
    surfaceSecondary: '#2A2A2A',
    border: '#333333',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#808080',
    accent: {
      boss: '#FF8A65',
      creative: '#64B5F6',
      stoic: '#9575CD',
    },
  },
};