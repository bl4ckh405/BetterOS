import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { goalsService } from '@/services/goals';

interface DailyCheckInModalProps {
  visible: boolean;
  onComplete: () => void;
}

export default function DailyCheckInModal({ visible, onComplete }: DailyCheckInModalProps) {
  const { colors } = useTheme();
  const [step, setStep] = useState<'goals' | 'rituals'>('goals');
  const [goals, setGoals] = useState<Array<{ title: string; steps: string[]; deadline?: string; reminder?: string }>>([{ title: '', steps: ['', ''] }]);
  const [rituals, setRituals] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addGoal = () => setGoals([...goals, { title: '', steps: ['', ''] }]);
  const updateGoal = (index: number, field: 'title' | 'deadline' | 'reminder', value: string) => {
    const newGoals = [...goals];
    newGoals[index][field] = value;
    setGoals(newGoals);
  };
  const updateStep = (goalIndex: number, stepIndex: number, value: string) => {
    const newGoals = [...goals];
    newGoals[goalIndex].steps[stepIndex] = value;
    setGoals(newGoals);
  };
  const removeGoal = (index: number) => setGoals(goals.filter((_, i) => i !== index));

  const addRitual = () => setRituals([...rituals, '']);
  const updateRitual = (index: number, value: string) => {
    const newRituals = [...rituals];
    newRituals[index] = value;
    setRituals(newRituals);
  };
  const removeRitual = (index: number) => setRituals(rituals.filter((_, i) => i !== index));

  const handleNext = () => {
    if (step === 'goals') {
      setStep('rituals');
    }
  };

  const handleSubmit = async () => {
    const validGoals = goals.filter(g => g.title.trim());
    const validRituals = rituals.filter(r => r.trim());
    if (validGoals.length === 0 && validRituals.length === 0) return;

    setIsSubmitting(true);
    try {
      await Promise.all([
        ...validGoals.map(goal => 
          goalsService.createTask({
            title: goal.title,
            time: goal.deadline,
            reminder_time: goal.reminder,
            completed: false
          })
        ),
        ...validRituals.map(name => 
          goalsService.createHabit({ name, icon: 'circle', completed_today: false, streak: 0 })
        )
      ]);
      
      setGoals([{ title: '', steps: ['', ''] }]);
      setRituals(['']);
      setStep('goals');
      onComplete();
    } catch (error) {
      console.error('Error saving daily data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => {}}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.container, { backgroundColor: colors.background }]}
        >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {step === 'goals' ? "Today's Goals" : 'Daily Rituals'}
            </Text>
          </View>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.stepDot, { backgroundColor: step === 'rituals' ? colors.primary : colors.border }]} />
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 'goals' ? (
            <>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                What are your 1-3 key goals for today?
              </Text>

              {goals.map((goal, index) => (
                <View key={index} style={styles.goalContainer}>
                  <View style={styles.taskRow}>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder={`Goal ${index + 1}`}
                      placeholderTextColor={colors.textTertiary}
                      value={goal.title}
                      onChangeText={(value) => updateGoal(index, 'title', value)}
                      autoFocus={index === 0}
                    />
                    {goals.length > 1 && (
                      <TouchableOpacity onPress={() => removeGoal(index)} style={styles.removeButton}>
                        <IconSymbol name="xmark.circle.fill" size={24} color={colors.textTertiary} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={[styles.stepsLabel, { color: colors.textSecondary }]}>Steps</Text>
                  {goal.steps.map((stepText, stepIndex) => (
                    <View key={stepIndex} style={styles.stepRow}>
                      <IconSymbol name="circle" size={14} color={colors.textTertiary} />
                      <TextInput
                        style={[styles.stepInput, { color: colors.text }]}
                        placeholder={`Step ${stepIndex + 1}`}
                        placeholderTextColor={colors.textTertiary}
                        value={stepText}
                        onChangeText={(value) => updateStep(index, stepIndex, value)}
                      />
                    </View>
                  ))}

                  <View style={styles.timeRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { color: colors.textSecondary }]}>⏰ Deadline</Text>
                      <TextInput
                        style={[styles.timeInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g., 5:00 PM"
                        placeholderTextColor={colors.textTertiary}
                        value={goal.deadline}
                        onChangeText={(value) => updateGoal(index, 'deadline', value)}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { color: colors.textSecondary }]}>🔔 Reminder</Text>
                      <TextInput
                        style={[styles.timeInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                        placeholder="e.g., 4:00 PM"
                        placeholderTextColor={colors.textTertiary}
                        value={goal.reminder}
                        onChangeText={(value) => updateGoal(index, 'reminder', value)}
                      />
                    </View>
                  </View>
                </View>
              ))}

              {goals.length < 3 && (
                <TouchableOpacity 
                  onPress={addGoal}
                  style={[styles.addButton, { backgroundColor: colors.surface }]}
                >
                  <IconSymbol name="plus.circle.fill" size={20} color={colors.primary} />
                  <Text style={[styles.addButtonText, { color: colors.primary }]}>Add another goal</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Non-negotiable habits you do every day
              </Text>

              {rituals.map((ritual, index) => (
                <View key={index} style={styles.taskRow}>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder={`Ritual ${index + 1} (e.g., Morning Pages)`}
                    placeholderTextColor={colors.textTertiary}
                    value={ritual}
                    onChangeText={(value) => updateRitual(index, value)}
                    autoFocus={index === 0}
                  />
                  {rituals.length > 1 && (
                    <TouchableOpacity onPress={() => removeRitual(index)} style={styles.removeButton}>
                      <IconSymbol name="xmark.circle.fill" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {rituals.length < 8 && (
                <TouchableOpacity 
                  onPress={addRitual}
                  style={[styles.addButton, { backgroundColor: colors.surface }]}
                >
                  <IconSymbol name="plus.circle.fill" size={20} color={colors.primary} />
                  <Text style={[styles.addButtonText, { color: colors.primary }]}>Add another ritual</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          {step === 'rituals' && (
            <TouchableOpacity onPress={() => setStep('goals')} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={20} color={colors.text} />
              <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={step === 'goals' ? handleNext : handleSubmit}
            disabled={isSubmitting || (step === 'goals' ? goals.every(g => !g.title.trim()) : rituals.every(r => !r.trim()))}
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary },
              (isSubmitting || (step === 'goals' ? goals.every(g => !g.title.trim()) : rituals.every(r => !r.trim()))) && { opacity: 0.5 }
            ]}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Saving...' : step === 'goals' ? 'Next' : 'Start My Day'}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 13, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: '700' },
  stepIndicator: { flexDirection: 'row', gap: 6 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  subtitle: { fontSize: 15, marginBottom: 20, lineHeight: 22 },
  goalContainer: { marginBottom: 20 },
  taskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  timeRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  label: { fontSize: 12, marginBottom: 6, fontWeight: '500' },
  timeInput: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14 },
  removeButton: { padding: 4 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: { fontSize: 15, fontWeight: '600' },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  stepsLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  stepInput: {
    flex: 1,
    fontSize: 14,
  },
});
