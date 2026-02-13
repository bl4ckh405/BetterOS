import { IconSymbol } from "@/components/ui/icon-symbol";
import { useOrbit } from "@/contexts/OrbitContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useTheme } from "@/hooks/use-theme";
import { Stack, router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingItemProps {
  icon: any;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  badge?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  badge,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.surfaceSecondary },
        ]}
      >
        <IconSymbol name={icon} size={22} color={colors.text} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.settingSubtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {badge && (
        <View
          style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}
        >
          <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
            {badge}
          </Text>
        </View>
      )}
      {showChevron && (
        <IconSymbol
          name="chevron.right"
          size={20}
          color={colors.textTertiary}
        />
      )}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { userProfile } = useOrbit();
  const { isProUser } = useSubscription();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Settings
          </Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Profile
          </Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="person.circle.fill"
              title="Your Orbit"
              subtitle="Core values, goals & anxieties"
              onPress={() => router.push("/orbit-settings")}
            />
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Subscription
          </Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="crown.fill"
              title={isProUser ? "Pro Plan" : "Upgrade to Pro"}
              subtitle={
                isProUser ? "Manage subscription" : "Unlock all features"
              }
              onPress={() => router.push("/subscription-settings")}
              badge={isProUser ? "Active" : undefined}
            />
          </View>
        </View>

        {/* Coaches Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Coaches
          </Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="person.2.fill"
              title="My Coaches"
              subtitle="Manage your AI coaches"
              onPress={() => router.push("/(tabs)/coaches")}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            App Settings
          </Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="bell.fill"
              title="Notifications"
              subtitle="Daily standup & reminders"
              onPress={() => router.push("/notification-settings")}
            />
            <SettingItem
              icon="paintbrush.fill"
              title="Appearance"
              subtitle="Theme & display"
              onPress={() => router.push("/appearance-settings")}
            />
            <SettingItem
              icon="mic.fill"
              title="Voice Settings"
              subtitle="Voice call preferences"
              onPress={() => router.push("/voice-settings")}
            />
          </View>
        </View>

        {/* Emergency Tools */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Emergency Tools
          </Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="arrow.triangle.2.circlepath"
              title="Realignment"
              subtitle="Reset priorities based on values"
              onPress={() => router.push("/realignment")}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Support
          </Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="questionmark.circle.fill"
              title="Help & Support"
              subtitle="Get help with BetterOS"
              onPress={() => router.push("/support")}
            />
            <SettingItem
              icon="exclamationmark.triangle.fill"
              title="Report an Issue"
              subtitle="Let us know about problems"
              onPress={() => router.push("/report-issue")}
            />
            <SettingItem
              icon="info.circle.fill"
              title="About BetterOS"
              subtitle="Version & legal info"
              onPress={() => router.push("/about")}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>
            Danger Zone
          </Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="trash.fill"
              title="Delete Account"
              subtitle="Permanently delete your account and data"
              onPress={() => router.push("/delete-account")}
              showChevron={false}
            />
            <TouchableOpacity
              style={[styles.dangerButton, { backgroundColor: colors.surface }]}
              activeOpacity={0.7}
            >
              <IconSymbol
                name="arrow.right.square.fill"
                size={22}
                color="#EF4444"
              />
              <Text style={[styles.dangerButtonText, { color: "#EF4444" }]}>
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            BetterOS v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 32,
  },
  lastSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 13,
  },
});
