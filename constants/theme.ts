/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const primaryColor = '#1dc962';
const primaryColorLight = '#4CD964';
const backgroundLight = '#ffffff';
const backgroundDark = '#000000';
const surfaceLight = '#f8fafe';
const surfaceDark = '#1c1c1e';
const cardLight = '#ffffff';
const cardDark = '#2c2c2e';

export const Colors = {
  light: {
    text: '#000000',
    textSecondary: '#6b7280',
    background: backgroundLight,
    surface: surfaceLight,
    tint: primaryColor,
    icon: '#6b7280',
    tabIconDefault: '#9ca3af',
    tabIconSelected: primaryColor,
    cardBackground: cardLight,
    primary: primaryColor,
    primaryLight: primaryColorLight,
    secondary: 'rgba(29, 201, 98, 0.1)',
    border: '#e5e7eb',
    shadow: 'rgba(0, 0, 0, 0.1)',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#9ca3af',
    background: backgroundDark,
    surface: surfaceDark,
    tint: primaryColor,
    icon: '#9ca3af',
    tabIconDefault: '#6b7280',
    tabIconSelected: primaryColor,
    cardBackground: cardDark,
    primary: primaryColor,
    primaryLight: primaryColorLight,
    secondary: 'rgba(29, 201, 98, 0.2)',
    border: '#374151',
    shadow: 'rgba(0, 0, 0, 0.3)',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
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
