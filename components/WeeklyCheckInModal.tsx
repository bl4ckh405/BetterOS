import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { goalsService } from '@/services/goals';

interface WeeklyCheckInModalProps {
  visible: boolean;
  onComplete: () => void;
}

export default function WeeklyCheckInModal({ visible, onComplete }: WeeklyCheckInModalProps) {
  const { colors } = useTheme();
  const [goals, setGoals] = useState<Array<{ title: string; milestones: string[] }>>([
    { title: '', milestones: ['', '', ''] }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addGoal = () => setGoals([...goals, { title: '', milestones: ['', '', ''] }]);
  const removeGoal = (index: number) => setGoals(goals.filter((_, i) => i !== index));

  const updateGoalTitle = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index].title = value;
    setGoals(newGoals);
  };

  const updateMilestone = (goalIndex: number, milestoneIndex: number, value: string) => {
    const newGoals = [...goals];
    newGoals[goalIndex].milestones[milestoneIndex] = value;
    setGoals(newGoals);
  };

  const handleSubmit = async () => {
    const validGoals = goals.filter(g => g.title.trim());
    if (validGoals.length === 0) return;

    setIsSubmitting(true);
    try {
      const today = new Date();
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
      endOfWeek.setHours(23, 59, 59);

      await Promise.all(
        validGoals.map(goal => 
          goalsService.createGoal({
            title: goal.title,
            goal_type: 'weekly',
            deadline_days: 7 - today.getDay(),
            progress: 0,
            milestones: goal.milestones
              .filter(m => m.trim())
              .map(name => ({ name, done: false }))
          })
        )
      );
      
      setGoals([{ title: '', milestones: ['', '', ''] }]);
      onComplete();
    } catch (error) {
      console.error('Error saving weekly goals:', error);
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
          <TouchableOpacity onPress={onComplete} style={styles.closeButton}>
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Week of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Weekly Goals</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Set 1-2 meaningful goals with clear milestones for this week
          </Text>

          {goals.map((goal, goalIndex) => (
            <View key={goalIndex} style={[styles.goalCard, { backgroundColor: colors.surface }]}>
              <View style={styles.goalCardHeader}>
                <TextInput
                  style={[styles.goalInput, { color: colors.text, borderBottomColor: colors.border }]}
                  placeholder="Weekly Goal"
                  placeholderTextColor={colors.textTertiary}
                  value={goal.title}
                  onChangeText={(value) => updateGoalTitle(goalIndex, value)}
                  autoFocus={goalIndex === 0}
                />
                {goals.length > 1 && (
                  <TouchableOpacity onPress={() => removeGoal(goalIndex)} style={styles.removeGoalButton}>
                    <IconSymbol name="xmark.circle.fill" size={24} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.milestonesLabel, { color: colors.textSecondary }]}>
                Milestones
              </Text>

              {goal.milestones.map((milestone, milestoneIndex) => (
                <View key={milestoneIndex} style={styles.milestoneRow}>
                  <IconSymbol name="circle" size={16} color={colors.textTertiary} />
                  <TextInput
                    style={[styles.milestoneInput, { color: colors.text }]}
                    placeholder={`Step ${milestoneIndex + 1}`}
                    placeholderTextColor={colors.textTertiary}
                    value={milestone}
                    onChangeText={(value) => updateMilestone(goalIndex, milestoneIndex, value)}
                  />
                </View>
              ))}
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
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || goals.every(g => !g.title.trim())}
            style={[
              styles.submitButton,
              { backgroundColor: colors.primary },
              (isSubmitting || goals.every(g => !g.title.trim())) && { opacity: 0.5 }
            ]}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Saving...' : 'Start My Week'}
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
  greeting: { fontSize: 13, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 20, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  subtitle: { fontSize: 15, marginBottom: 24, lineHeight: 22 },
  goalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  goalInput: {
    fontSize: 18,
    fontWeight: '600',
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  milestonesLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  milestoneInput: {
    flex: 1,
    fontSize: 15,
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
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  goalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeGoalButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: { fontSize: 15, fontWeight: '600' },
});
