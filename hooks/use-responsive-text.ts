import { useTextSize } from '@/contexts/TextSizeContext';

export const useResponsiveText = () => {
  const { getFontSize } = useTextSize();

  return {
    // Common text sizes
    xs: getFontSize(11),
    sm: getFontSize(13),
    base: getFontSize(14),
    md: getFontSize(16),
    lg: getFontSize(18),
    xl: getFontSize(20),
    xl2: getFontSize(24),
    xl3: getFontSize(32),
    xl4: getFontSize(40),
    
    // Custom size
    size: getFontSize,
  };
};
