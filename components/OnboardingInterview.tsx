import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, TextInput } from 'react-native';
import { UserProfile } from '../types';
import { useOrbit } from '../contexts/OrbitContext';
import { useTheme } from '../hooks/use-theme';

const { width, height } = Dimensions.get('window');

const CORE_VALUES = [
  'Authenticity', 'Growth', 'Connection', 'Freedom', 'Creativity',
  'Excellence', 'Balance', 'Impact', 'Adventure', 'Peace'
];

const ANXIETY_SOURCES = [
  'Work pressure', 'Financial stress', 'Relationships', 'Health concerns',
  'Future uncertainty', 'Social expectations', 'Time management', 'Decision making'
];

const INTERVIEW_STEPS = [
  {
    id: 'values',
    title: 'What are your core values?',
    subtitle: 'Pick three or more',
    type: 'multi-select',
    options: CORE_VALUES,
    minSelections: 3
  },
  {
    id: 'goal',
    title: 'What is your 5-year vision?',
    subtitle: 'Describe your ideal future',
    type: 'text',
    placeholder: 'Where do you see yourself in 5 years?'
  },
  {
    id: 'anxieties',
    title: 'What brings you anxiety?',
    subtitle: 'Select what resonates with you',
    type: 'multi-select',
    options: ANXIETY_SOURCES,
    minSelections: 1
  }
];

export const OnboardingInterview: React.FC = () => {
  const { setUserProfile } = useOrbit();
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});

  const currentQuestion = INTERVIEW_STEPS[currentStep];
  const isLastStep = currentStep === INTERVIEW_STEPS.length - 1;

  const handleSelection = (stepId: string, value: string) => {
    if (currentQuestion.type === 'multi-select') {
      setSelections(prev => {
        const current = prev[stepId] || [];
        const isSelected = current.includes(value);
        return {
          ...prev,
          [stepId]: isSelected 
            ? current.filter(item => item !== value)
            : [...current, value]
        };
      });
    }
  };

  const canProceed = () => {
    if (currentQuestion.type === 'multi-select') {
      const selected = selections[currentQuestion.id] || [];
      return selected.length >= currentQuestion.minSelections;
    }
    return textInputs[currentQuestion.id]?.trim().length > 0;
  };

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const completeOnboarding = () => {
    const profile: UserProfile = {
      id: Date.now().toString(),
      coreValues: selections.values || [],
      fiveYearGoal: textInputs.goal || '',
      currentAnxieties: selections.anxieties || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setUserProfile(profile);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
          <View 
            style={[
              styles.progress, 
              { 
                width: `${((currentStep + 1) / INTERVIEW_STEPS.length) * 100}%`,
                backgroundColor: colors.primary
              }
            ]} 
          />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.questionSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            {currentQuestion.title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {currentQuestion.subtitle}
          </Text>
        </View>

        {currentQuestion.type === 'multi-select' ? (
          <View style={styles.optionsGrid}>
            {currentQuestion.options?.map((option, index) => {
              const isSelected = (selections[currentQuestion.id] || []).includes(option);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => handleSelection(currentQuestion.id, option)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    { color: isSelected ? colors.background : colors.text }
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.textInputContainer}>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.text
                }
              ]}
              placeholder={currentQuestion.placeholder}
              placeholderTextColor={colors.textTertiary}
              value={textInputs[currentQuestion.id] || ''}
              onChangeText={(text) => setTextInputs(prev => ({ ...prev, [currentQuestion.id]: text }))}
              multiline
              textAlignVertical="top"
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: canProceed() ? colors.primary : colors.surface,
              opacity: canProceed() ? 1 : 0.5
            }
          ]}
          onPress={handleNext}
          disabled={!canProceed()}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.nextButtonText,
            {
              color: canProceed() ? colors.background : colors.textSecondary
            }
          ]}>
            {isLastStep ? 'Complete Setup' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  questionSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionPill: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  textInputContainer: {
    marginTop: 20,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  nextButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});