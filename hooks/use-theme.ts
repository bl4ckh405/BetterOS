import { THEME_COLORS } from '@/constants/modes';
import { useThemeContext } from '@/contexts/ThemeContext';

export const useTheme = () => {
  const { actualTheme } = useThemeContext();
  const isDark = actualTheme === 'dark';
  const colors = THEME_COLORS[actualTheme];

  return {
    colors,
    isDark,
    colorScheme: actualTheme,
  };
};