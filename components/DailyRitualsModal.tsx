import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { goalsService } from '@/services/goals';

interface DailyRitualsModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function DailyRitualsModal({ visible, onClose, onComplete }: DailyRitualsModalProps) {
  const { colors } = useTheme();
  const [habits, setHabits] = useState<string[]>(['', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateHabit = (index: number, value: string) => {
    const newHabits = [...habits];
    newHabits[index] = value;
    setHabits(newHabits);
  };

  const addHabit = () => setHabits([...habits, '']);
  const removeHabit = (index: number) => setHabits(habits.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const validHabits = habits.filter(h => h.trim());
    if (validHabits.length === 0) return;

    setIsSubmitting(true);
    try {
      await Promise.all(
        validHabits.map(name => goalsService.createHabit({ name, icon: '⭐', completed_today: false, streak: 0 }))
      );
      
      setHabits(['', '', '']);
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving habits:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Daily Rituals
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Small actions, repeated daily.
            </Text>
            
            <Text style={[styles.mainTitle, { color: colors.text }]}>
              <Text style={{ color: colors.accent.creative }}>Build momentum</Text> with simple habits that compound over time.
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>
              My daily rituals
            </Text>

            {habits.map((habit, index) => (
              <View key={index} style={styles.habitRow}>
                <View style={[styles.habitDot, { backgroundColor: colors.accent.creative }]} />
                <TextInput
                  style={[
                    styles.habitInput,
                    {
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={`Ritual ${index + 1}`}
                  placeholderTextColor={colors.textTertiary}
                  value={habit}
                  onChangeText={(value) => updateHabit(index, value)}
                  autoFocus={index === 0}
                />
                {habits.length > 1 && (
                  <TouchableOpacity onPress={() => removeHabit(index)} style={styles.removeButton}>
                    <IconSymbol name="xmark.circle.fill" size={24} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {habits.length < 7 && (
              <TouchableOpacity 
                onPress={addHabit}
                style={[styles.addButton, { backgroundColor: colors.surface }]}
              >
                <IconSymbol name="plus.circle.fill" size={20} color={colors.primary} />
                <Text style={[styles.addButtonText, { color: colors.primary }]}>Add another ritual</Text>
              </TouchableOpacity>
            )}

            <View style={styles.tipCard}>
              <IconSymbol name="lightbulb.fill" size={20} color={colors.accent.creative} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Start small. 3-5 rituals is perfect. You can always add more later.
              </Text>
            </View>
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || habits.every(h => !h.trim())}
              style={[
                styles.submitButton,
                { backgroundColor: colors.accent.creative },
                (isSubmitting || habits.every(h => !h.trim())) && { opacity: 0.5 }
              ]}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Saving...' : 'Start My Rituals'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '400',
    lineHeight: 36,
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    marginBottom: 16,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  habitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  habitInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    marginBottom: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
