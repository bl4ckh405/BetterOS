import { IconSymbol } from "@/components/ui/icon-symbol";
import { useOrbit } from "@/contexts/OrbitContext";
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

export default function OrbitSettingsScreen() {
  const { colors } = useTheme();
  const { userProfile } = useOrbit();

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
          Your Orbit
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="star.fill" size={20} color="#FFB800" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Core Values
            </Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {userProfile?.coreValues && userProfile.coreValues.length > 0 ? (
              userProfile.coreValues.map((value, index) => (
                <View
                  key={index}
                  style={[
                    styles.valueItem,
                    index < userProfile.coreValues.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.valueText, { color: colors.text }]}>
                    {value}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No values set yet
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="flag.fill" size={20} color="#10B981" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              5-Year Goal
            </Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.goalText, { color: colors.text }]}>
              {userProfile?.fiveYearGoal || "No goal set yet"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={20}
              color="#F59E0B"
            />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Current Anxieties
            </Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {userProfile?.currentAnxieties &&
            userProfile.currentAnxieties.length > 0 ? (
              userProfile.currentAnxieties.map((anxiety, index) => (
                <View
                  key={index}
                  style={[
                    styles.valueItem,
                    index < userProfile.currentAnxieties.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.valueText, { color: colors.text }]}>
                    {anxiety}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No anxieties recorded
              </Text>
            )}
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
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
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
  valueItem: {
    paddingVertical: 12,
  },
  valueText: {
    fontSize: 16,
    lineHeight: 24,
  },
  goalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 15,
    fontStyle: "italic",
  },
});
