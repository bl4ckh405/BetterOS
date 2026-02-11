import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/hooks/use-theme";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useTextSize } from "@/contexts/TextSizeContext";
import { Stack, router } from "expo-router";
import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppearanceSettingsScreen() {
  const { colors } = useTheme();
  const { theme, setTheme } = useThemeContext();
  const { textSize, setTextSize, getFontSize } = useTextSize();

  const updateTheme = async (newTheme: "light" | "dark" | "auto") => {
    await setTheme(newTheme);
  };

  const updateTextSize = async (size: "small" | "medium" | "large") => {
    await setTextSize(size);
  };

  const themes = [
    { id: "light" as const, name: "Light", icon: "sun.max.fill" as any },
    { id: "dark" as const, name: "Dark", icon: "moon.fill" as any },
    { id: "auto" as const, name: "Auto", icon: "circle.lefthalf.filled" as any },
  ];

  const textSizes = [
    { id: "small" as const, name: "Small", size: 14 },
    { id: "medium" as const, name: "Medium", size: 16 },
    { id: "large" as const, name: "Large", size: 18 },
  ];

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
          Appearance
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            THEME
          </Text>
          <View style={styles.themeGrid}>
            {themes.map((themeOption) => (
              <TouchableOpacity
                key={themeOption.id}
                style={[
                  styles.themeCard,
                  { backgroundColor: colors.surface },
                  theme === themeOption.id && {
                    borderWidth: 2,
                    borderColor: "#4A90E2",
                  },
                ]}
                onPress={() => updateTheme(themeOption.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.themeIcon,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <IconSymbol name={themeOption.icon as any} size={28} color={colors.text} />
                </View>
                <Text style={[styles.themeName, { color: colors.text }]}>
                  {themeOption.name}
                </Text>
                {theme === themeOption.id && (
                  <View style={styles.checkmark}>
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={20}
                      color="#4A90E2"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Text Size */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            TEXT SIZE
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {textSizes.map((size, index) => (
              <TouchableOpacity
                key={size.id}
                style={[
                  styles.textSizeOption,
                  index !== textSizes.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => updateTextSize(size.id)}
              >
                <Text
                  style={[
                    styles.textSizeLabel,
                    { color: colors.text, fontSize: size.size },
                  ]}
                >
                  {size.name}
                </Text>
                {textSize === size.id && (
                  <IconSymbol name="checkmark" size={20} color="#4A90E2" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            PREVIEW
          </Text>
          <View
            style={[styles.previewCard, { backgroundColor: colors.surface }]}
          >
            <View
              style={[styles.previewBubble, { backgroundColor: "#4A90E2" }]}
            >
              <Text
                style={[
                  styles.previewText,
                  {
                    fontSize: getFontSize(16),
                  },
                ]}
              >
                Hello! How can I help you today?
              </Text>
            </View>
            <View
              style={[
                styles.previewBubble,
                {
                  backgroundColor: colors.surfaceSecondary,
                  alignSelf: "flex-end",
                },
              ]}
            >
              <Text
                style={[
                  styles.previewText,
                  {
                    color: colors.text,
                    fontSize: getFontSize(16),
                  },
                ]}
              >
                This is how messages will look
              </Text>
            </View>
          </View>
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
  themeGrid: {
    flexDirection: "row",
    gap: 12,
  },
  themeCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: "relative",
  },
  themeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  themeName: {
    fontSize: 15,
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
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
  textSizeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  textSizeLabel: {
    fontWeight: "600",
  },
  previewCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  previewBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
  },
  previewText: {
    color: "white",
  },
});
