import { useColorScheme } from '@/hooks/use-color-scheme';
import { THEME_COLORS } from '@/constants/modes';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = THEME_COLORS[colorScheme || 'light'];

  return {
    colors,
    isDark,
    colorScheme: colorScheme || 'light',
  };
};