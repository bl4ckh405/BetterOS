import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/hooks/use-theme";
import { settingsService } from "@/services/settings";
import { Stack, router } from "expo-router";
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

export default function VoiceSettingsScreen() {
  const { colors } = useTheme();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [voiceVolume, setVoiceVolume] = useState<number>(0.8);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await settingsService.getSettings();
    setVoiceEnabled(settings.voiceEnabled);
    setVoiceSpeed(settings.voiceSpeed);
    setVoiceVolume(settings.voiceVolume);
  };

  const updateVoiceEnabled = async (value: boolean) => {
    setVoiceEnabled(value);
    await settingsService.updateSettings({ voiceEnabled: value });
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const volumeOptions = [0.2, 0.4, 0.6, 0.8, 1.0];

  const updateVoiceSpeed = async (value: number) => {
    setVoiceSpeed(value);
    await settingsService.updateSettings({ voiceSpeed: value });
  };

  const updateVoiceVolume = async (value: number) => {
    setVoiceVolume(value);
    await settingsService.updateSettings({ voiceVolume: value });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Voice Settings
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            VOICE CALLS
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <IconSymbol name="mic.fill" size={22} color="#4A90E2" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Enable Voice
                  </Text>
                  <Text
                    style={[
                      styles.settingSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Allow voice conversations
                  </Text>
                </View>
              </View>
              <Switch
                value={voiceEnabled}
                onValueChange={updateVoiceEnabled}
                trackColor={{ false: colors.border, true: "#4A90E2" }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            SPEECH SPEED
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {speedOptions.map((speed, index) => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.option,
                  index !== speedOptions.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => updateVoiceSpeed(speed)}
              >
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  {speed}x
                </Text>
                {voiceSpeed === speed && (
                  <IconSymbol name="checkmark" size={20} color="#4A90E2" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            VOLUME
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {volumeOptions.map((volume, index) => (
              <TouchableOpacity
                key={volume}
                style={[
                  styles.option,
                  index !== volumeOptions.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => updateVoiceVolume(volume)}
              >
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  {Math.round(volume * 100)}%
                </Text>
                {voiceVolume === volume && (
                  <IconSymbol name="checkmark" size={20} color="#4A90E2" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  placeholder: { width: 32 },
  content: { flex: 1, paddingTop: 24 },
  section: { marginBottom: 32, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
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
    padding: 16,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  settingSubtitle: { fontSize: 14 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  optionLabel: { fontSize: 16, fontWeight: "600" },
});
