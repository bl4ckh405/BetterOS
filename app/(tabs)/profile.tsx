import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { RealignmentButton } from '@/components/RealignmentButton';

export default function ProfileScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Profile & Settings</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Manage your account, preferences, and emergency tools
      </Text>
      
      <View style={styles.emergencySection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Tools</Text>
        <RealignmentButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 32,
  },
  emergencySection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
});