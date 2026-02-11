import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { databaseService } from '@/services/database';
import { authService } from '@/services/auth';

export default function AICustomizationSettings() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    boss: { tone: 'direct', verbosity: 'concise', challenge_level: 'high' },
    creative: { tone: 'warm', verbosity: 'detailed', encouragement: 'high' },
    stoic: { tone: 'calm', verbosity: 'balanced', depth: 'philosophical' },
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const profile = await databaseService.getUserProfile();
      if (profile?.ai_preferences) {
        setPreferences(profile.ai_preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (coach: string, key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [coach]: { ...prev[coach as keyof typeof prev], [key]: value }
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const userId = await authService.getUserId();
      await databaseService.supabase
        .from('user_profiles')
        .update({ ai_preferences: preferences })
        .eq('user_id', userId);
      
      router.back();
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const coaches = [
    { 
      id: 'boss', 
      name: 'The Boss', 
      icon: 'briefcase.fill', 
      color: colors.accent.boss,
      description: 'Ruthless prioritization and accountability'
    },
    { 
      id: 'creative', 
      name: 'The Creative', 
      icon: 'lightbulb.fill', 
      color: colors.accent.creative,
      description: 'Expansive thinking and encouragement'
    },
    { 
      id: 'stoic', 
      name: 'The Stoic', 
      icon: 'book.fill', 
      color: colors.accent.stoic,
      description: 'Wisdom and emotional processing'
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'AI Customization', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'AI Customization',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={savePreferences} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
              )}
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Customize Your AI Crew
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Fine-tune how each coach interacts with you. Changes apply immediately to all conversations.
          </Text>
        </View>

        {coaches.map((coach) => (
          <View key={coach.id} style={[styles.coachCard, { backgroundColor: colors.surface }]}>
            <View style={styles.coachHeader}>
              <View style={[styles.coachIcon, { backgroundColor: coach.color + '20' }]}>
                <IconSymbol name={coach.icon as any} size={28} color={coach.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.coachName, { color: colors.text }]}>{coach.name}</Text>
                <Text style={[styles.coachDescription, { color: colors.textSecondary }]}>
                  {coach.description}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Communication Tone */}
            <View style={styles.preferenceSection}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                Communication Tone
              </Text>
              <Text style={[styles.preferenceHint, { color: colors.textSecondary }]}>
                How should {coach.name} speak to you?
              </Text>
              <View style={styles.optionRow}>
                {['direct', 'warm', 'calm'].map((tone) => (
                  <TouchableOpacity
                    key={tone}
                    style={[
                      styles.miniOption,
                      { 
                        backgroundColor: preferences[coach.id as keyof typeof preferences].tone === tone 
                          ? coach.color 
                          : colors.background,
                        borderColor: preferences[coach.id as keyof typeof preferences].tone === tone 
                          ? coach.color 
                          : colors.border,
                      }
                    ]}
                    onPress={() => updatePreference(coach.id, 'tone', tone)}
                  >
                    <Text style={[
                      styles.miniOptionText,
                      { color: preferences[coach.id as keyof typeof preferences].tone === tone ? 'white' : colors.text }
                    ]}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Response Length */}
            <View style={styles.preferenceSection}>
              <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                Response Length
              </Text>
              <Text style={[styles.preferenceHint, { color: colors.textSecondary }]}>
                How detailed should responses be?
              </Text>
              <View style={styles.optionRow}>
                {['concise', 'balanced', 'detailed'].map((verbosity) => (
                  <TouchableOpacity
                    key={verbosity}
                    style={[
                      styles.miniOption,
                      { 
                        backgroundColor: preferences[coach.id as keyof typeof preferences].verbosity === verbosity 
                          ? coach.color 
                          : colors.background,
                        borderColor: preferences[coach.id as keyof typeof preferences].verbosity === verbosity 
                          ? coach.color 
                          : colors.border,
                      }
                    ]}
                    onPress={() => updatePreference(coach.id, 'verbosity', verbosity)}
                  >
                    <Text style={[
                      styles.miniOptionText,
                      { color: preferences[coach.id as keyof typeof preferences].verbosity === verbosity ? 'white' : colors.text }
                    ]}>
                      {verbosity.charAt(0).toUpperCase() + verbosity.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Coach-specific settings */}
            {coach.id === 'boss' && (
              <View style={styles.preferenceSection}>
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                  Challenge Level
                </Text>
                <Text style={[styles.preferenceHint, { color: colors.textSecondary }]}>
                  How much should The Boss push you?
                </Text>
                <View style={styles.optionRow}>
                  {['low', 'medium', 'high'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.miniOption,
                        { 
                          backgroundColor: preferences.boss.challenge_level === level 
                            ? coach.color 
                            : colors.background,
                          borderColor: preferences.boss.challenge_level === level 
                            ? coach.color 
                            : colors.border,
                        }
                      ]}
                      onPress={() => updatePreference('boss', 'challenge_level', level)}
                    >
                      <Text style={[
                        styles.miniOptionText,
                        { color: preferences.boss.challenge_level === level ? 'white' : colors.text }
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {coach.id === 'creative' && (
              <View style={styles.preferenceSection}>
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                  Encouragement Level
                </Text>
                <Text style={[styles.preferenceHint, { color: colors.textSecondary }]}>
                  How much positivity do you want?
                </Text>
                <View style={styles.optionRow}>
                  {['low', 'medium', 'high'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.miniOption,
                        { 
                          backgroundColor: preferences.creative.encouragement === level 
                            ? coach.color 
                            : colors.background,
                          borderColor: preferences.creative.encouragement === level 
                            ? coach.color 
                            : colors.border,
                        }
                      ]}
                      onPress={() => updatePreference('creative', 'encouragement', level)}
                    >
                      <Text style={[
                        styles.miniOptionText,
                        { color: preferences.creative.encouragement === level ? 'white' : colors.text }
                      ]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {coach.id === 'stoic' && (
              <View style={styles.preferenceSection}>
                <Text style={[styles.preferenceLabel, { color: colors.text }]}>
                  Philosophical Depth
                </Text>
                <Text style={[styles.preferenceHint, { color: colors.textSecondary }]}>
                  How deep should the wisdom go?
                </Text>
                <View style={styles.optionRow}>
                  {['practical', 'balanced', 'philosophical'].map((depth) => (
                    <TouchableOpacity
                      key={depth}
                      style={[
                        styles.miniOption,
                        { 
                          backgroundColor: preferences.stoic.depth === depth 
                            ? coach.color 
                            : colors.background,
                          borderColor: preferences.stoic.depth === depth 
                            ? coach.color 
                            : colors.border,
                        }
                      ]}
                      onPress={() => updatePreference('stoic', 'depth', depth)}
                    >
                      <Text style={[
                        styles.miniOptionText,
                        { color: preferences.stoic.depth === depth ? 'white' : colors.text }
                      ]}>
                        {depth.charAt(0).toUpperCase() + depth.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        <View style={[styles.tipCard, { backgroundColor: colors.primary + '20' }]}>
          <IconSymbol name="lightbulb.fill" size={20} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.primary }]}>
            Experiment with different settings to find what works best for you. You can change these anytime.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  header: { padding: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  saveButton: { fontSize: 17, fontWeight: '600', marginRight: 16 },
  coachCard: { marginHorizontal: 20, marginBottom: 20, borderRadius: 20, padding: 20 },
  coachHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  coachIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  coachName: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  coachDescription: { fontSize: 14 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: 16 },
  preferenceSection: { marginBottom: 20 },
  preferenceLabel: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  preferenceHint: { fontSize: 13, marginBottom: 12 },
  optionRow: { flexDirection: 'row', gap: 8 },
  miniOption: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  miniOptionText: { fontSize: 14, fontWeight: '600' },
  tipCard: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 16, marginHorizontal: 20, marginBottom: 40 },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
});
