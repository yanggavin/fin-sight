/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const primaryColor = '#1dc962';
const backgroundLight = '#f6f8f7';
const backgroundDark = '#112117';

export const Colors = {
  light: {
    text: '#1f2937',
    background: backgroundLight,
    tint: primaryColor,
    icon: '#6b7280',
    tabIconDefault: '#9ca3af',
    tabIconSelected: primaryColor,
    cardBackground: 'rgba(0, 0, 0, 0.05)',
    surface: 'rgba(0, 0, 0, 0.02)',
    primary: primaryColor,
    secondary: 'rgba(29, 201, 98, 0.1)',
    border: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    text: '#f9fafb',
    background: backgroundDark,
    tint: primaryColor,
    icon: '#9ca3af',
    tabIconDefault: '#6b7280',
    tabIconSelected: primaryColor,
    cardBackground: 'rgba(255, 255, 255, 0.05)',
    surface: 'rgba(255, 255, 255, 0.02)',
    primary: primaryColor,
    secondary: 'rgba(29, 201, 98, 0.2)',
    border: 'rgba(255, 255, 255, 0.1)',
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
