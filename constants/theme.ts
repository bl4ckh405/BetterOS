/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const brandBlue = '#5BA3E0';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: brandBlue,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: brandBlue,
    primary: brandBlue,
    secondary: '#666666',
    tertiary: '#999999',
    surface: '#F8F9FA',
    surfaceSecondary: '#F1F3F4',
    border: '#E8EAED',
    textSecondary: '#666666',
    textTertiary: '#999999',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: brandBlue,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: brandBlue,
    primary: brandBlue,
    secondary: '#B3B3B3',
    tertiary: '#808080',
    surface: '#1A1A1A',
    surfaceSecondary: '#2A2A2A',
    border: '#333333',
    textSecondary: '#B3B3B3',
    textTertiary: '#808080',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
