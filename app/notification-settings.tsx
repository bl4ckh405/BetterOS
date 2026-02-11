import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/hooks/use-theme";
import {
  notificationService,
  NotificationSettings,
} from "@/services/notifications";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<NotificationSettings>({
    morningRitual: true,
    dailyGoals: true,
    weeklyGoals: true,
    taskReminders: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await notificationService.loadSettings();
    setSettings(saved);
  };

  const updateSetting = async (
    key: keyof NotificationSettings,
    value: boolean,
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await notificationService.saveSettings(newSettings);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Notifications
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Morning Ritual */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            MORNING RITUAL
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <IconSymbol name="sunrise.fill" size={22} color="#FFB800" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Morning Wake Up
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    5:00 AM daily
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.morningRitual}
                onValueChange={(value) => updateSetting("morningRitual", value)}
                trackColor={{ false: colors.border, true: "#4A90E2" }}
              />
            </View>
          </View>
        </View>

        {/* Daily Standup */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            DAILY PLANNING
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <IconSymbol name="target" size={22} color="#10B981" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Set Daily Goals
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    8:00 AM daily
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.dailyGoals}
                onValueChange={(value) => updateSetting("dailyGoals", value)}
                trackColor={{ false: colors.border, true: "#4A90E2" }}
              />
            </View>
          </View>
        </View>

        {/* Weekly Review */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            WEEKLY PLANNING
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <IconSymbol name="calendar" size={22} color="#7B68EE" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Weekly Goals
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Monday 8:00 AM
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.weeklyGoals}
                onValueChange={(value) => updateSetting("weeklyGoals", value)}
                trackColor={{ false: colors.border, true: "#4A90E2" }}
              />
            </View>
          </View>
        </View>

        {/* Task Reminders */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            REMINDERS
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <IconSymbol name="bell.fill" size={22} color="#F59E0B" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Task Reminders
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Custom times
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.taskReminders}
                onValueChange={(value) => updateSetting("taskReminders", value)}
                trackColor={{ false: colors.border, true: "#4A90E2" }}
              />
            </View>
          </View>
        </View>

        {/* Info */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <IconSymbol
            name="info.circle.fill"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Notifications help you stay consistent with your goals and maintain
            daily rituals for peak performance.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
