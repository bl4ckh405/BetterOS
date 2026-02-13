import { useTheme } from "@/hooks/use-theme";
import { goalsService } from "@/services/goals";
import React, { useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "./ui/icon-symbol";

const { width, height } = Dimensions.get("window");

interface LongTermGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function LongTermGoalModal({
  visible,
  onClose,
  onComplete,
}: LongTermGoalModalProps) {
  const { colors } = useTheme();
  const [goals, setGoals] = useState<Array<{ goal: string; deadline: string }>>(
    [],
  );
  const [currentGoal, setCurrentGoal] = useState("");
  const [currentDeadline, setCurrentDeadline] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddGoal = () => {
    if (!currentGoal.trim() || !currentDeadline.trim()) return;

    setGoals([...goals, { goal: currentGoal, deadline: currentDeadline }]);
    setCurrentGoal("");
    setCurrentDeadline("");
  };

  const parseDeadlineToISO = (deadline: string): string => {
    try {
      const [monthName, yearStr] = deadline.split(" ");
      const year = parseInt(yearStr, 10);

      // Manually map months to avoid engine-specific parsing bugs
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const monthIndex = monthNames.indexOf(monthName);

      // Fallback: If index is -1 (not found), default to 0 (January)
      const validMonth = monthIndex === -1 ? 0 : monthIndex;

      // Create the date: Year, Month Index, Day 1
      const date = new Date(year, validMonth, 1);

      // Final safety check before calling toISOString
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date generated");
      }

      return date.toISOString();
    } catch (error) {
      console.error("Error parsing date, defaulting to now:", error);
      return new Date().toISOString();
    }
  };

  const handleContinue = async () => {
    if (goals.length === 0 && (!currentGoal.trim() || !currentDeadline.trim()))
      return;

    setSaving(true);
    try {
      if (currentGoal.trim() && currentDeadline.trim()) {
        const deadlineISO = parseDeadlineToISO(currentDeadline);
        await goalsService.createGoal({
          title: currentGoal,
          goal_type: "long_term",
          deadline: deadlineISO,
          deadline_days: 0,
          progress: 0,
          milestones: [],
        });
      }

      for (const item of goals) {
        const deadlineISO = parseDeadlineToISO(item.deadline);
        await goalsService.createGoal({
          title: item.goal,
          goal_type: "long_term",
          deadline: deadlineISO,
          deadline_days: 0,
          progress: 0,
          milestones: [],
        });
      }

      setGoals([]);
      setCurrentGoal("");
      setCurrentDeadline("");
      onComplete();
      onClose();
    } catch (error) {
      console.error("Failed to create goals:", error);
    } finally {
      setSaving(false);
    }
  };

  const generateFutureDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 36; i++) {
      const futureDate = new Date(today);
      futureDate.setMonth(today.getMonth() + i);
      dates.push({
        month: futureDate.toLocaleDateString("en-US", { month: "long" }),
        year: futureDate.getFullYear(),
        value: futureDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }

    return dates;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView
          style={[styles.container, { backgroundColor: colors.background }]}
          edges={["top"]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
          >
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <IconSymbol name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Long-term Goal
              </Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView
              style={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Clarity creates results.
              </Text>

              <Text style={[styles.mainTitle, { color: colors.text }]}>
                <Text style={{ color: colors.accent.creative }}>
                  Define your goal clearly
                </Text>
                , set your deadline, and we'll get you moving.
              </Text>

              {goals.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.savedGoal,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.savedGoalText, { color: colors.text }]}
                    >
                      {item.goal}
                    </Text>
                    <Text
                      style={[
                        styles.savedGoalDeadline,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.deadline}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setGoals(goals.filter((_, i) => i !== index))
                    }
                  >
                    <IconSymbol
                      name="xmark.circle.fill"
                      size={24}
                      color={colors.textTertiary}
                    />
                  </TouchableOpacity>
                </View>
              ))}

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
                value={currentGoal}
                onChangeText={setCurrentGoal}
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
                      color: currentDeadline
                        ? colors.text
                        : colors.textTertiary,
                    },
                  ]}
                >
                  {currentDeadline || "Pick a deadline.."}
                </Text>
              </TouchableOpacity>

              {currentGoal.trim() && currentDeadline.trim() && (
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={handleAddGoal}
                >
                  <IconSymbol
                    name="plus.circle.fill"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.addButtonText, { color: colors.primary }]}
                  >
                    Add Another Goal
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  {
                    backgroundColor: colors.primary,
                    opacity:
                      (goals.length > 0 ||
                        (currentGoal.trim() && currentDeadline.trim())) &&
                      !saving
                        ? 1
                        : 0.5,
                  },
                ]}
                onPress={handleContinue}
                disabled={
                  !(
                    goals.length > 0 ||
                    (currentGoal.trim() && currentDeadline.trim())
                  ) || saving
                }
              >
                <Text style={styles.continueButtonText}>
                  {saving ? "Saving..." : "Continue"}
                </Text>
              </TouchableOpacity>

              <Modal
                visible={showDatePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <View style={styles.datePickerOverlay}>
                  <View
                    style={[
                      styles.datePickerContainer,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <View
                      style={[
                        styles.datePickerHeader,
                        { borderBottomColor: colors.border },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text
                          style={[
                            styles.cancelText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <Text
                        style={[styles.datePickerTitle, { color: colors.text }]}
                      >
                        Pick a deadline
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text
                          style={[styles.doneText, { color: colors.primary }]}
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      style={styles.datePickerScroll}
                      contentContainerStyle={styles.datePickerContent}
                      showsVerticalScrollIndicator={false}
                    >
                      {generateFutureDates().map((date, index) => {
                        const isSelected = currentDeadline === date.value;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.dateOption,
                              {
                                backgroundColor: isSelected
                                  ? colors.surface
                                  : "transparent",
                              },
                            ]}
                            onPress={() => setCurrentDeadline(date.value)}
                          >
                            <View style={styles.dateOptionContent}>
                              <Text
                                style={[
                                  styles.monthText,
                                  {
                                    color: isSelected
                                      ? colors.primary
                                      : colors.text,
                                    fontWeight: isSelected ? "700" : "500",
                                  },
                                ]}
                              >
                                {date.month}
                              </Text>
                              <Text
                                style={[
                                  styles.yearText,
                                  {
                                    color: isSelected
                                      ? colors.primary
                                      : colors.textSecondary,
                                    fontWeight: isSelected ? "600" : "400",
                                  },
                                ]}
                              >
                                {date.year}
                              </Text>
                            </View>
                            {isSelected && (
                              <View
                                style={[
                                  styles.checkmark,
                                  { backgroundColor: colors.primary },
                                ]}
                              >
                                <IconSymbol
                                  name="checkmark"
                                  size={16}
                                  color={colors.background}
                                />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    fontWeight: "400",
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
    justifyContent: "center",
    marginBottom: 24,
  },
  savedGoal: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 80,
  },
  savedGoalText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  savedGoalDeadline: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  continueButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 40,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 16,
  },
  datePickerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  datePickerContainer: {
    height: height * 0.5,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontWeight: "600",
  },
  doneText: {
    fontSize: 16,
    fontWeight: "600",
    width: 60,
    textAlign: "right",
  },
  datePickerScroll: {
    flex: 1,
  },
  datePickerContent: {
    paddingVertical: 8,
  },
  dateOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    alignItems: "center",
    justifyContent: "center",
  },
});
