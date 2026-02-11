import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { IconSymbol } from './ui/icon-symbol';
import { goalsService } from '@/services/goals';

const { width, height } = Dimensions.get('window');

interface LongTermGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function LongTermGoalModal({ visible, onClose, onComplete }: LongTermGoalModalProps) {
  const { colors } = useTheme();
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  
  const expandAnim = useRef(new Animated.Value(0)).current;
  const pressStartTime = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (!goal.trim() || !deadline.trim()) return;
        
        pressStartTime.current = Date.now();
        setIsCommitting(true);
        
        Animated.timing(expandAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) {
            handleCommit();
          }
        });
      },
      onPanResponderRelease: () => {
        const pressDuration = Date.now() - pressStartTime.current;
        
        if (pressDuration < 2000) {
          setIsCommitting(false);
          Animated.timing(expandAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleCommit = async () => {
    try {
      await goalsService.createGoal({
        title: goal,
        type: 'long_term',
        deadline: deadline,
        milestones: [],
      });
      
      setGoal('');
      setDeadline('');
      setShowDatePicker(false);
      setIsCommitting(false);
      expandAnim.setValue(0);
      onComplete();
      onClose();
    } catch (error) {
      console.error('Failed to create goal:', error);
      setIsCommitting(false);
      expandAnim.setValue(0);
    }
  };

  const generateFutureDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 36; i++) {
      const futureDate = new Date(today);
      futureDate.setMonth(today.getMonth() + i);
      dates.push({
        month: futureDate.toLocaleDateString('en-US', { month: 'long' }),
        year: futureDate.getFullYear(),
        value: futureDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      });
    }
    
    return dates;
  };

  const scale = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 50],
  });

  const overlayOpacity = expandAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        {isCommitting && (
          <Animated.View
            style={[
              styles.expandingOverlay,
              {
                backgroundColor: colors.accent.creative,
                opacity: overlayOpacity,
                transform: [{ scale }],
              },
            ]}
          />
        )}

        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Long-term Goal
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Clarity creates results.
          </Text>
          
          <Text style={[styles.mainTitle, { color: colors.text }]}>
            <Text style={{ color: colors.accent.creative }}>Define your goal clearly</Text>, set your deadline, and we'll get you moving.
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>
            My biggest goal is to..
          </Text>
          
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Write it here.."
            placeholderTextColor={colors.textTertiary}
            value={goal}
            onChangeText={setGoal}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={[styles.label, { color: colors.text }]}>
            I plan to achieve it by..
          </Text>
          
          <TouchableOpacity
            style={[
              styles.dateInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={[
                styles.dateText,
                {
                  color: deadline ? colors.text : colors.textTertiary,
                },
              ]}
            >
              {deadline || 'Pick a deadline..'}
            </Text>
          </TouchableOpacity>

          <View style={styles.commitContainer}>
            <View {...panResponder.panHandlers}>
              <Animated.View
                style={[
                  styles.thumbprint,
                  {
                    backgroundColor: colors.surface,
                    opacity: goal.trim() && deadline.trim() ? 1 : 0.3,
                  },
                ]}
              >
                <IconSymbol
                  name="hand.raised.fill"
                  size={56}
                  color={colors.textTertiary}
                />
              </Animated.View>
            </View>
            
            <Text style={[styles.commitLabel, { color: colors.text }]}>
              {isCommitting ? 'Hold to commit...' : 'Tap to seal the promise to yourself'}
            </Text>

            {isCommitting && (
              <View style={styles.progressContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: colors.accent.creative,
                      width: expandAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            )}
          </View>

          <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerOverlay}>
              <View
                style={[styles.datePickerContainer, { backgroundColor: colors.background }]}
              >
                <View style={[styles.datePickerHeader, { borderBottomColor: colors.border }]}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={[styles.datePickerTitle, { color: colors.text }]}>
                    Pick a deadline
                  </Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={[styles.doneText, { color: colors.primary }]}>Done</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  style={styles.datePickerScroll}
                  contentContainerStyle={styles.datePickerContent}
                  showsVerticalScrollIndicator={false}
                >
                  {generateFutureDates().map((date, index) => {
                    const isSelected = deadline === date.value;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dateOption,
                          {
                            backgroundColor: isSelected ? colors.surface : 'transparent',
                          },
                        ]}
                        onPress={() => setDeadline(date.value)}
                      >
                        <View style={styles.dateOptionContent}>
                          <Text
                            style={[
                              styles.monthText,
                              {
                                color: isSelected ? colors.primary : colors.text,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {date.month}
                          </Text>
                          <Text
                            style={[
                              styles.yearText,
                              {
                                color: isSelected ? colors.primary : colors.textSecondary,
                                fontWeight: isSelected ? '600' : '400',
                              },
                            ]}
                          >
                            {date.year}
                          </Text>
                        </View>
                        {isSelected && (
                          <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                            <IconSymbol name="checkmark" size={16} color={colors.background} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  expandingOverlay: {
    position: 'absolute',
    top: height / 2,
    left: width / 2,
    width: 100,
    height: 100,
    borderRadius: 50,
    marginLeft: -50,
    marginTop: -50,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 24,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    minHeight: 60,
    justifyContent: 'center',
    marginBottom: 60,
  },
  dateText: {
    fontSize: 16,
  },
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    height: height * 0.5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    width: 60,
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    width: 60,
    textAlign: 'right',
  },
  datePickerScroll: {
    flex: 1,
  },
  datePickerContent: {
    paddingVertical: 8,
  },
  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 2,
    borderRadius: 12,
  },
  dateOptionContent: {
    flex: 1,
  },
  monthText: {
    fontSize: 18,
    marginBottom: 2,
  },
  yearText: {
    fontSize: 14,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commitContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commitLabel: {
    fontSize: 15,
    marginTop: 20,
    textAlign: 'center',
  },
  thumbprint: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  progressContainer: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
