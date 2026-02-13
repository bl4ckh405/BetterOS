import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { goalsService } from '@/services/goals';

interface WeeklyGoalsModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function WeeklyGoalsModal({ visible, onClose, onComplete }: WeeklyGoalsModalProps) {
  const { colors } = useTheme();
  const [goals, setGoals] = useState<Array<{ title: string; milestones: string[] }>>([
    { title: '', milestones: ['', '', ''] }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const addMilestone = (goalIndex: number) => {
    const newGoals = [...goals];
    newGoals[goalIndex].milestones.push('');
    setGoals(newGoals);
  };

  const removeMilestone = (goalIndex: number, milestoneIndex: number) => {
    const newGoals = [...goals];
    newGoals[goalIndex].milestones = newGoals[goalIndex].milestones.filter((_, i) => i !== milestoneIndex);
    setGoals(newGoals);
  };

  const addGoal = () => setGoals([...goals, { title: '', milestones: ['', '', ''] }]);
  
  const removeGoal = (index: number) => setGoals(goals.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const validGoals = goals.filter(g => g.title.trim() && g.milestones.some(m => m.trim()));
    if (validGoals.length === 0) return;

    setIsSubmitting(true);
    try {
      await Promise.all(
        validGoals.map(goal => 
          goalsService.createGoal({
            title: goal.title,
            goal_type: 'weekly',
            deadline_days: 7,
            progress: 0,
            milestones: goal.milestones
              .filter(m => m.trim())
              .map(name => ({ name, done: false })),
          })
        )
      );
      
      setGoals([{ title: '', milestones: ['', '', ''] }]);
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving weekly goals:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWeekRange = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
          >
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <IconSymbol name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.weekRange, { color: colors.textSecondary }]}>
                  {getWeekRange()}
                </Text>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Weekly Goals
                </Text>
              </View>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Seven days to make progress.
            </Text>
            
            <Text style={[styles.mainTitle, { color: colors.text }]}>
              <Text style={{ color: colors.accent.stoic }}>Break down big goals</Text> into weekly wins with clear milestones.
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>
              This week's focus
            </Text>

            {goals.map((goal, goalIndex) => (
              <View key={goalIndex} style={[styles.goalCard, { backgroundColor: colors.surface }]}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalBadge, { backgroundColor: colors.accent.stoic + '20' }]}>
                    <IconSymbol name="target" size={20} color={colors.accent.stoic} />
                  </View>
                  {goals.length > 1 && (
                    <TouchableOpacity onPress={() => removeGoal(goalIndex)} style={styles.removeButton}>
                      <IconSymbol name="xmark.circle.fill" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </View>
                
                <TextInput
                  style={[styles.goalInput, { color: colors.text }]}
                  placeholder="What do you want to achieve this week?"
                  placeholderTextColor={colors.textTertiary}
                  value={goal.title}
                  onChangeText={(value) => updateGoalTitle(goalIndex, value)}
                  autoFocus={goalIndex === 0}
                  multiline
                />

                <Text style={[styles.milestonesLabel, { color: colors.textSecondary }]}>
                  Milestones
                </Text>

                {goal.milestones.map((milestone, milestoneIndex) => (
                  <View key={milestoneIndex} style={styles.milestoneRow}>
                    <View style={[styles.checkbox, { borderColor: colors.border }]} />
                    <TextInput
                      style={[styles.milestoneInput, { color: colors.text }]}
                      placeholder={`Step ${milestoneIndex + 1}`}
                      placeholderTextColor={colors.textTertiary}
                      value={milestone}
                      onChangeText={(value) => updateMilestone(goalIndex, milestoneIndex, value)}
                    />
                    {goal.milestones.length > 1 && (
                      <TouchableOpacity 
                        onPress={() => removeMilestone(goalIndex, milestoneIndex)} 
                        style={styles.removeIconButton}
                      >
                        <IconSymbol name="xmark.circle.fill" size={20} color={colors.textTertiary} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {goal.milestones.length < 5 && (
                  <TouchableOpacity 
                    onPress={() => addMilestone(goalIndex)}
                    style={styles.addMilestoneButton}
                  >
                    <IconSymbol name="plus.circle" size={18} color={colors.primary} />
                    <Text style={[styles.addMilestoneText, { color: colors.primary }]}>
                      Add milestone
                    </Text>
                  </TouchableOpacity>
                )}
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

            <View style={styles.tipCard}>
              <IconSymbol name="calendar" size={20} color={colors.accent.stoic} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Focus on 1-2 meaningful goals per week. Quality over quantity.
              </Text>
            </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting || goals.every(g => !g.title.trim())}
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.accent.stoic },
                  (isSubmitting || goals.every(g => !g.title.trim())) && { opacity: 0.5 }
                ]}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Saving...' : 'Set Weekly Goals'}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
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
  weekRange: {
    fontSize: 13,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  goalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    padding: 4,
  },
  goalInput: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    minHeight: 50,
  },
  milestonesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
  },
  milestoneInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  removeIconButton: {
    padding: 4,
  },
  addMilestoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 4,
  },
  addMilestoneText: {
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
