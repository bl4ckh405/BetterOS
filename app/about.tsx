import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/hooks/use-theme';
import { Stack, router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const { colors } = useTheme();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About BetterOS</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.logo, { color: colors.primary }]}>BetterOS</Text>
        </View>

        <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.4</Text>

        <Text style={[styles.description, { color: colors.text }]}>
          BetterOS is your personal Life Operating System. We help you build clarity, maintain focus, and achieve your goals through AI-powered coaching and intelligent workflows.
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal</Text>
          
          <TouchableOpacity 
            style={[styles.linkButton, { backgroundColor: colors.surface }]}
            onPress={() => openLink('https://betteros.app/terms')}
          >
            <IconSymbol name="doc.text" size={20} color={colors.primary} />
            <Text style={[styles.linkText, { color: colors.text }]}>Terms of Service</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.linkButton, { backgroundColor: colors.surface }]}
            onPress={() => openLink('https://betteros.app/privacy')}
          >
            <IconSymbol name="lock.shield" size={20} color={colors.primary} />
            <Text style={[styles.linkText, { color: colors.text }]}>Privacy Policy</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Connect</Text>
          
          <TouchableOpacity 
            style={[styles.linkButton, { backgroundColor: colors.surface }]}
            onPress={() => openLink('https://betteros.app')}
          >
            <IconSymbol name="globe" size={20} color={colors.primary} />
            <Text style={[styles.linkText, { color: colors.text }]}>betteros.app</Text>
            <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          Made with ❤️ for productivity enthusiasts
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  placeholder: { width: 32 },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
  },
  version: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 16,
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});
