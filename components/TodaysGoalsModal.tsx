import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { goalsService } from '@/services/goals';

interface TodaysGoalsModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function TodaysGoalsModal({ visible, onClose, onComplete }: TodaysGoalsModalProps) {
  const { colors } = useTheme();
  const [tasks, setTasks] = useState<Array<{ title: string; time: string }>>(
    [{ title: '', time: '' }, { title: '', time: '' }, { title: '', time: '' }]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateTask = (index: number, field: 'title' | 'time', value: string) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const addTask = () => setTasks([...tasks, { title: '', time: '' }]);
  const removeTask = (index: number) => setTasks(tasks.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const validTasks = tasks.filter(t => t.title.trim());
    if (validTasks.length === 0) return;

    setIsSubmitting(true);
    try {
      await Promise.all(
        validTasks.map(task => 
          goalsService.createTask({
            title: task.title,
            time: task.time || undefined,
            completed: false,
          })
        )
      );
      
      setTasks([{ title: '', time: '' }, { title: '', time: '' }, { title: '', time: '' }]);
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving tasks:', error);
    } finally {
      setIsSubmitting(false);
    }
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
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  Today's Focus
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
              Win the day.
            </Text>
            
            <Text style={[styles.mainTitle, { color: colors.text }]}>
              <Text style={{ color: colors.primary }}>Focus on what matters</Text> most. 3-5 tasks is the sweet spot.
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>
              Today's priorities
            </Text>

            {tasks.map((task, index) => (
              <View key={index} style={[styles.taskCard, { backgroundColor: colors.surface }]}>
                <View style={styles.taskHeader}>
                  <View style={[styles.taskNumber, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.taskNumberText, { color: colors.primary }]}>
                      {index + 1}
                    </Text>
                  </View>
                  {tasks.length > 1 && (
                    <TouchableOpacity onPress={() => removeTask(index)} style={styles.removeButton}>
                      <IconSymbol name="xmark.circle.fill" size={24} color={colors.textTertiary} />
                    </TouchableOpacity>
                  )}
                </View>
                
                <TextInput
                  style={[styles.taskInput, { color: colors.text }]}
                  placeholder="What needs to be done?"
                  placeholderTextColor={colors.textTertiary}
                  value={task.title}
                  onChangeText={(value) => updateTask(index, 'title', value)}
                  autoFocus={index === 0}
                  multiline
                />

                <View style={styles.timeRow}>
                  <IconSymbol name="clock" size={16} color={colors.textTertiary} />
                  <TextInput
                    style={[styles.timeInput, { color: colors.text }]}
                    placeholder="Time (optional)"
                    placeholderTextColor={colors.textTertiary}
                    value={task.time}
                    onChangeText={(value) => updateTask(index, 'time', value)}
                  />
                </View>
              </View>
            ))}

            {tasks.length < 8 && (
              <TouchableOpacity 
                onPress={addTask}
                style={[styles.addButton, { backgroundColor: colors.surface }]}
              >
                <IconSymbol name="plus.circle.fill" size={20} color={colors.primary} />
                <Text style={[styles.addButtonText, { color: colors.primary }]}>Add another task</Text>
              </TouchableOpacity>
            )}

            <View style={styles.tipCard}>
              <IconSymbol name="star.fill" size={20} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Pro tip: Start with your most important task. Eat that frog first.
              </Text>
            </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting || tasks.every(t => !t.title.trim())}
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  (isSubmitting || tasks.every(t => !t.title.trim())) && { opacity: 0.5 }
                ]}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Saving...' : 'Lock It In'}
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
  greeting: {
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
  taskCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskNumberText: {
    fontSize: 16,
    fontWeight: '700',
  },
  removeButton: {
    padding: 4,
  },
  taskInput: {
    fontSize: 16,
    marginBottom: 12,
    minHeight: 44,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeInput: {
    flex: 1,
    fontSize: 14,
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
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
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
