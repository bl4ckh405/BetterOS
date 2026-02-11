import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { OrbitProvider } from '@/contexts/OrbitContext';
import { CoachProvider } from '@/contexts/CoachContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';
import { TextSizeProvider } from '@/contexts/TextSizeContext';
import { notificationService } from '@/services/notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Handle notification responses only
    const responseSubscription = notificationService.addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
    });

    // Check for updates on mount
    async function checkForUpdates() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.log('Error checking for updates:', error);
      }
    }

    if (!__DEV__) {
      checkForUpdates();
    }

    return () => {
      responseSubscription.remove();
    };
  }, []);

  return (
    <CustomThemeProvider>
      <TextSizeProvider>
        <SubscriptionProvider>
          <OrbitProvider>
            <CoachProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </CoachProvider>
          </OrbitProvider>
        </SubscriptionProvider>
      </TextSizeProvider>
    </CustomThemeProvider>
  );
}
