import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RealignmentButton } from '@/components/RealignmentButton';

export default function RealignmentScreen() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Realignment</Text>
          <View style={styles.placeholder} />
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <IconSymbol name="arrow.triangle.2.circlepath" size={32} color="#F59E0B" />
            <Text style={[styles.infoTitle, { color: colors.text }]}>Emergency Realignment</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Feeling overwhelmed? Use this tool to ruthlessly filter your to-do list based on your core values and 5-year goal.
            </Text>
          </View>
          <RealignmentButton />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  placeholder: { width: 32 },
  content: { flex: 1 },
  contentContainer: { padding: 16 },
  infoCard: { padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  infoTitle: { fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  infoText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
