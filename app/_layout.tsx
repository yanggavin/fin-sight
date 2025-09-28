import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { databaseService } from '@/services/database';
import { locationService } from '@/services/location';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function initialize() {
      try {
        // Initialize database
        await databaseService.initialize();
        
        // Check location permissions
        await locationService.checkLocationPermission();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    }

    initialize();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="new-trip" options={{ presentation: 'modal', title: 'New Fishing Trip' }} />
        <Stack.Screen name="trip/[id]" options={{ title: 'Trip Details' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
