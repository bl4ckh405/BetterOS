import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  morningRitual: boolean;
  dailyGoals: boolean;
  weeklyGoals: boolean;
  taskReminders: boolean;
}

const STORAGE_KEY = '@notification_settings';

class NotificationService {

  async initialize() {
    await this.requestPermissions();
    await this.loadSettings();
    await this.scheduleAllNotifications();
  }

  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#007AFF',
        });
      }

      return true;
    } catch (error) {
      console.log('Error requesting notification permissions:', error);
      return false;
    }
  }

  async loadSettings(): Promise<NotificationSettings> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEY);
      return settings ? JSON.parse(settings) : {
        morningRitual: true,
        dailyGoals: true,
        weeklyGoals: true,
        taskReminders: true,
      };
    } catch {
      return {
        morningRitual: true,
        dailyGoals: true,
        weeklyGoals: true,
        taskReminders: true,
      };
    }
  }

  async saveSettings(settings: NotificationSettings) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    await this.scheduleAllNotifications();
  }

  async scheduleAllNotifications() {
    await this.cancelAllNotifications();
    const settings = await this.loadSettings();

    if (settings.morningRitual) {
      await this.scheduleMorningRitual();
    }

    if (settings.dailyGoals) {
      await this.scheduleDailyGoals();
    }

    if (settings.weeklyGoals) {
      await this.scheduleWeeklyGoals();
    }
  }

  async scheduleMorningRitual() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌅 Good Morning!',
        body: 'Time to start your morning rituals. Let\'s make today great!',
        data: { type: 'morning_ritual' },
        sound: true,
      },
      trigger: Platform.OS === 'android'
        ? ({ type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 5, minute: 0 } as Notifications.DailyTriggerInput)
        : ({ type: Notifications.SchedulableTriggerInputTypes.CALENDAR, hour: 5, minute: 0, repeats: true } as Notifications.CalendarTriggerInput),
    });
  }

  async scheduleDailyGoals() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Set Your Daily Goals',
        body: 'Take a moment to plan your day. What are your top 3 priorities?',
        data: { type: 'daily_goals' },
        sound: true,
      },
      trigger: Platform.OS === 'android'
        ? ({ type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 8, minute: 0 } as Notifications.DailyTriggerInput)
        : ({ type: Notifications.SchedulableTriggerInputTypes.CALENDAR, hour: 8, minute: 0, repeats: true } as Notifications.CalendarTriggerInput),
    });
  }

  async scheduleWeeklyGoals() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Weekly Planning Time',
        body: 'New week, new opportunities! Set your goals for the week ahead.',
        data: { type: 'weekly_goals' },
        sound: true,
      },
      trigger: Platform.OS === 'android'
        ? ({ type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 2, hour: 8, minute: 0 } as Notifications.WeeklyTriggerInput)
        : ({ type: Notifications.SchedulableTriggerInputTypes.CALENDAR, weekday: 2, hour: 8, minute: 0, repeats: true } as Notifications.CalendarTriggerInput),
    });
  }

  async scheduleTaskReminder(title: string, body: string, time: Date) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${title}`,
        body,
        data: { type: 'task_reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: time,
      },
    });
  }

  async scheduleCustomReminder(title: string, body: string, hour: number, minute: number) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: 'custom_reminder' },
        sound: true,
      },
      trigger: Platform.OS === 'android'
        ? ({ type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute } as Notifications.DailyTriggerInput)
        : ({ type: Notifications.SchedulableTriggerInputTypes.CALENDAR, hour, minute, repeats: true } as Notifications.CalendarTriggerInput),
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async cancelNotification(identifier: string) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }



  // Listen for notification responses
  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Listen for notifications received while app is foregrounded
  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }
}

export const notificationService = new NotificationService();
