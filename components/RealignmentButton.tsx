import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useOrbit } from '../contexts/OrbitContext';
import { useTheme } from '../hooks/use-theme';

export const RealignmentButton: React.FC = () => {
  const { userProfile } = useOrbit();
  const { colors } = useTheme();
  const [isActive, setIsActive] = useState(false);
  const [currentTasks, setCurrentTasks] = useState('');

  const handleRealignment = async () => {
    if (!userProfile) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (!isActive) {
      setIsActive(true);
      return;
    }

    if (!currentTasks.trim()) {
      Alert.alert('Input Required', 'Please describe what you\'re currently working on.');
      return;
    }

    // Generate realignment advice based on user's core values
    const advice = generateRealignmentAdvice(currentTasks, userProfile.coreValues, userProfile.fiveYearGoal);
    
    Alert.alert(
      'Realignment Advice',
      advice,
      [
        { text: 'Got it', onPress: () => setIsActive(false) },
        { text: 'Reset', onPress: () => { setCurrentTasks(''); setIsActive(false); } }
      ]
    );
  };

  const generateRealignmentAdvice = (tasks: string, values: string[], goal: string): string => {
    return `Based on your core values (${values.join(', ')}) and your 5-year goal: "${goal}"\n\nFocus on what truly matters. Ask yourself:\n• Does this align with my values?\n• Does this move me toward my 5-year goal?\n• What can I say "No" to right now?\n\nRemember: You can't do everything. Choose what matters most.`;
  };

  if (!userProfile) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.panicButton,
          {
            backgroundColor: isActive ? colors.primary : '#FF4444'
          }
        ]}
        onPress={handleRealignment}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          {isActive ? 'Get Realigned' : 'I\'m Drowning'}
        </Text>
      </TouchableOpacity>

      {isActive && (
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            What are you currently working on?
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.text
              }
            ]}
            value={currentTasks}
            onChangeText={setCurrentTasks}
            placeholder="List your current tasks, projects, or commitments..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  panicButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
});