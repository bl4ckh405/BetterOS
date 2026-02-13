import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { OrbitProvider, useOrbit } from '@/contexts/OrbitContext';
import { CoachProvider } from '@/contexts/CoachContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { ThemeProvider as CustomThemeProvider } from '@/contexts/ThemeContext';
import { TextSizeProvider } from '@/contexts/TextSizeContext';
import { notificationService } from '@/services/notifications';
import { databaseService } from '@/services/database';
import { goalsService } from '@/services/goals';
import TodaysGoalsModal from '@/components/TodaysGoalsModal';
import WeeklyCheckInModal from '@/components/WeeklyCheckInModal';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const colorScheme = useColorScheme();
  const { userProfile, isOnboarded, loadUserProfile } = useOrbit();
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [showWeeklyCheckIn, setShowWeeklyCheckIn] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && isOnboarded) {
        checkForCheckIns();
      }
    });

    if (isOnboarded) {
      checkForCheckIns();
    }

    return () => {
      subscription.remove();
    };
  }, [isOnboarded, userProfile]);

  const checkForCheckIns = async () => {
    if (!userProfile || !isOnboarded) return;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const lastWeekly = userProfile.lastWeeklyCheckIn;
    const hasCompletedWeeklyThisWeek = lastWeekly && lastWeekly.split('T')[0] >= weekStartStr;
    const weeklyGoals = await goalsService.getGoals('weekly');

    if (!hasCompletedWeeklyThisWeek && weeklyGoals.length === 0) {
      setShowWeeklyCheckIn(true);
      return;
    }

    const todayStr = now.toISOString().split('T')[0];
    const lastDaily = userProfile.lastDailyCheckIn;
    const hasCompletedDailyToday = lastDaily && lastDaily.split('T')[0] === todayStr;
    const tasks = await goalsService.getTodaysTasks();

    if (!hasCompletedDailyToday && tasks.length === 0) {
      setShowDailyCheckIn(true);
    }
  };

  const handleDailyCheckInComplete = async () => {
    await databaseService.updateCheckInTimestamp('daily');
    await loadUserProfile();
    setShowDailyCheckIn(false);
  };

  const handleWeeklyCheckInComplete = async () => {
    await databaseService.updateCheckInTimestamp('weekly');
    await loadUserProfile();
    setShowWeeklyCheckIn(false);
    checkForCheckIns();
  };

  return (
    <>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
      <WeeklyCheckInModal
        visible={showWeeklyCheckIn}
        onComplete={handleWeeklyCheckInComplete}
      />
      <TodaysGoalsModal
        visible={showDailyCheckIn}
        onClose={() => setShowDailyCheckIn(false)}
        onComplete={handleDailyCheckInComplete}
      />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const responseSubscription = notificationService.addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
    });

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
              <AppContent />
            </CoachProvider>
          </OrbitProvider>
        </SubscriptionProvider>
      </TextSizeProvider>
    </CustomThemeProvider>
  );
}
