import { useTheme } from "@/hooks/use-theme";
import { databaseService } from "@/services/database";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOrbit } from "../contexts/OrbitContext";
import { useSubscriptionGate } from "./SubscriptionGate";
import { IconSymbol } from "./ui/icon-symbol";
import TodaysGoalsModal from "./TodaysGoalsModal";
import WeeklyGoalsModal from "./WeeklyGoalsModal";
import LongTermGoalModal from "./LongTermGoalModal";
import DailyRitualsModal from "./DailyRitualsModal";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");

type StepType =
  | "info"
  | "multi-select"
  | "single-select"
  | "text"
  | "processing";

interface OnboardingStep {
  id: string;
  type: StepType;
  title?: string;
  subtitle?: string;
  options?: string[];
  minSelections?: number;
  placeholder?: string;
  tip?: string;
}

const INTERVIEW_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    type: "info",
    title: "Welcome to BetterOS",
    subtitle: "Your personal Life Operating System starts here.",
    tip: "Takes 2 minutes to build your custom AI crew.",
  },
  {
    id: "user_name",
    type: "text",
    title: "What should we call you?",
    subtitle: "Your name helps personalize your experience.",
    placeholder: "Enter your name...",
  },
  {
    id: "core_values",
    type: "multi-select",
    title: "What are your core values?",
    subtitle: "These will guide every decision your AI crew makes.",
    options: [
      "Excellence & Mastery",
      "Growth & Learning",
      "Health & Vitality",
      "Relationships & Connection",
      "Creativity & Expression",
      "Financial Freedom",
      "Impact & Contribution",
      "Balance & Peace",
      "Innovation & Risk",
      "Mindfulness & Presence",
    ],
    minSelections: 3,
  },
  {
    id: "life_season",
    type: "single-select",
    title: "What season of life are you in?",
    subtitle: "This shapes how we prioritize your time.",
    options: [
      "Building Foundation (Early career or student)",
      "Scaling Up (Growing in your career)",
      "Peak Performance (Established professional)",
      "Transition (Changing careers or life phase)",
      "Wisdom Phase (Mentoring and legacy building)",
    ],
  },
  {
    id: "processing_profile",
    type: "processing",
    title: "Building your profile...",
    subtitle: "Analyzing your values and life context.",
  },
  {
    id: "biggest_challenge",
    type: "single-select",
    title: "What's your biggest challenge right now?",
    subtitle: "We'll prioritize helping you with this first.",
    options: [
      "Overwhelm",
      "Lack of Clarity",
      "Time Management",
      "Burnout",
      "Procrastination",
      "Distraction",
      "Decision Fatigue",
      "Consistency",
    ],
  },
  {
    id: "work_style",
    type: "single-select",
    title: "How do you work best?",
    subtitle: "Your AI crew will match your natural rhythm.",
    options: [
      "Deep Focus (Long uninterrupted blocks)",
      "Sprint Mode (Short intense bursts)",
      "Structured (Scheduled and planned)",
      "Flow State (Flexible and spontaneous)",
      "Pomodoro (Timed work/break cycles)",
    ],
  },
  {
    id: "energy_pattern",
    type: "single-select",
    title: "When is your peak energy?",
    subtitle: "We'll schedule important tasks during your best hours.",
    options: [
      "Early Bird (5am-9am)",
      "Morning Person (9am-12pm)",
      "Afternoon Peak (12pm-5pm)",
      "Night Owl (5pm-12am)",
      "Late Night (12am-5am)",
      "Varies Daily",
    ],
  },
  {
    id: "motivation_type",
    type: "single-select",
    title: "What drives you forward?",
    subtitle: "We'll use this to keep you motivated.",
    options: [
      "Achievement",
      "Mastery",
      "Impact",
      "Creation",
      "Connection",
      "Freedom",
      "Recognition",
    ],
  },
  {
    id: "communication_style",
    type: "single-select",
    title: "How should your AI crew talk to you?",
    subtitle: "Set the default tone for all coaches.",
    options: [
      "Direct & No-Nonsense",
      "Warm & Encouraging",
      "Calm & Philosophical",
      "Energetic & Motivating",
      "Analytical & Detailed",
      "Casual & Friendly",
    ],
  },
  {
    id: "notifications",
    type: "info",
    title: "Stay on track with reminders",
    subtitle: "Get notified for daily check-ins, goals, and accountability.",
    tip: "You can change this anytime in settings.",
  },
];

const ProcessingScreen = ({ colors }: { colors: any }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.processingContainer}>
      <Animated.View
        style={[
          styles.spinner,
          { borderColor: colors.primary, transform: [{ rotate: spin }] },
        ]}
      />
      <Text style={[styles.processingText, { color: colors.text }]}>
        Analyzing your profile...
      </Text>
    </View>
  );
};


export const OnboardingInterview: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { setUserProfile, loadUserProfile } = useOrbit();
  const { PaywallComponent } = useSubscriptionGate();
  const { colors } = useTheme();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [singleSelections, setSingleSelections] = useState<
    Record<string, string>
  >({});
  const [textInputs, setTextInputs] = useState<Record<string, string>>({});
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDailyGoals, setShowDailyGoals] = useState(false);
  const [showWeeklyGoals, setShowWeeklyGoals] = useState(false);
  const [showLongTermGoal, setShowLongTermGoal] = useState(false);
  const [showDailyRituals, setShowDailyRituals] = useState(false);
  const [requestingNotifications, setRequestingNotifications] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const currentStep = INTERVIEW_STEPS[currentStepIndex] || INTERVIEW_STEPS[0];
  const isLastStep = currentStepIndex === INTERVIEW_STEPS.length - 1;

  // Load saved progress on mount
  useEffect(() => {
    loadOnboardingProgress();
  }, []);

  const loadOnboardingProgress = async () => {
    console.log('🔍 Loading onboarding progress');
    try {
      const userId = await import("../services/auth").then((m) =>
        m.authService.getUserId(),
      );
      const { data } = await databaseService.supabase
        .from("user_profiles")
        .select("onboarding_step, onboarding_data, metadata")
        .eq("user_id", userId)
        .single();

      const isCompleted = data?.metadata?.onboarding_completed === true;

      console.log('📊 Onboarding data from DB:', {
        step: data?.onboarding_step,
        completed: isCompleted,
        hasData: !!data?.onboarding_data
      });

      // Don't load progress if onboarding is already completed
      if (isCompleted) {
        console.log('✅ Onboarding already completed, skipping progress load');
        return;
      }

      if (data?.onboarding_step) {
        console.log('📍 Resuming from step:', data.onboarding_step);
        setCurrentStepIndex(data.onboarding_step);
      }
      if (data?.onboarding_data) {
        const saved = data.onboarding_data;
        if (saved.selections) setSelections(saved.selections);
        if (saved.singleSelections) setSingleSelections(saved.singleSelections);
        if (saved.textInputs) setTextInputs(saved.textInputs);
        console.log('💾 Restored saved selections');
      }
    } catch (error) {
      console.error("❌ Error loading onboarding progress:", error);
    }
  };

  const saveOnboardingProgress = async () => {
    try {
      const userId = await import("../services/auth").then((m) =>
        m.authService.getUserId(),
      );
      await databaseService.supabase
        .from("user_profiles")
        .update({
          onboarding_step: currentStepIndex,
          onboarding_data: {
            selections,
            singleSelections,
            textInputs,
          },
        })
        .eq("user_id", userId);
    } catch (error) {
      console.error("Error saving onboarding progress:", error);
    }
  };

  useEffect(() => {
    if (currentStep.type === "processing") {
      const timer = setTimeout(() => handleNext(), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex]);

  const animateTransition = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleSelection = (stepId: string, value: string) => {
    if (currentStep.type === "multi-select") {
      setSelections((prev) => {
        const current = prev[stepId] || [];
        const isSelected = current.includes(value);
        return {
          ...prev,
          [stepId]: isSelected
            ? current.filter((item) => item !== value)
            : [...current, value],
        };
      });
    } else if (currentStep.type === "single-select") {
      setSingleSelections((prev) => ({ ...prev, [stepId]: value }));
    }
  };

  const canProceed = () => {
    switch (currentStep.type) {
      case "info":
      case "processing":
        return true;
      case "multi-select":
        return (
          (selections[currentStep.id]?.length || 0) >=
          (currentStep.minSelections || 1)
        );
      case "single-select":
        return !!singleSelections[currentStep.id];
      case "text":
        return (textInputs[currentStep.id]?.trim().length || 0) > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    saveOnboardingProgress();
    if (currentStep.id === "notifications") {
      handleNotificationPermission();
    } else if (isLastStep) {
      completeOnboarding();
    } else {
      animateTransition(() => setCurrentStepIndex((prev) => prev + 1));
    }
  };

  const handleNotificationPermission = async () => {
    setRequestingNotifications(true);
    try {
      const hasPermission = await import("../services/notifications").then((m) =>
        m.notificationService.requestPermissions(),
      );
      
      if (hasPermission) {
        await import("../services/notifications").then((m) =>
          m.notificationService.scheduleAllNotifications(),
        );
      }
    } catch (error) {
      console.error("Error requesting notifications:", error);
    } finally {
      setRequestingNotifications(false);
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      animateTransition(() => setCurrentStepIndex((prev) => prev - 1));
    }
  };

  const completeOnboarding = async () => {
    console.log('🎯 Starting onboarding completion');
    console.log('📊 Collected data:', { selections, singleSelections, textInputs });
    
    try {
      const userId = await import("../services/auth").then((m) =>
        m.authService.getUserId(),
      );

      console.log('💾 Saving complete user profile with all onboarding data');
      
      // Prepare metadata object with all onboarding selections
      const metadata = {
        life_season: singleSelections.life_season,
        biggest_challenge: singleSelections.biggest_challenge,
        energy_pattern: singleSelections.energy_pattern,
        communication_style: singleSelections.communication_style,
      };

      await databaseService.supabase
        .from("user_profiles")
        .upsert({
          user_id: userId,
          core_values: selections.core_values || [],
          current_anxieties: [],
          five_year_goal: "",
          one_year_goal: "",
          ten_year_goal: "",
          name: textInputs.user_name || "",
          work_style: singleSelections.work_style,
          motivation_type: singleSelections.motivation_type,
          metadata: metadata,
          onboarding_step: null,
          onboarding_data: null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      setUserProfile({
        coreValues: selections.core_values || [],
        currentAnxieties: [],
        fiveYearGoal: "",
        oneYearGoal: "",
        tenYearGoal: "",
      } as any);

      console.log('🎯 Showing daily rituals modal');
      setShowDailyRituals(true);
    } catch (error) {
      console.error("❌ Error completing onboarding:", error);
    }
  };

  const handleDailyRitualsComplete = () => {
    setShowDailyRituals(false);
    setShowDailyGoals(true);
  };

  const handleDailyGoalsComplete = () => {
    setShowDailyGoals(false);
    // Show weekly goals modal
    setShowWeeklyGoals(true);
  };

  const handleWeeklyGoalsComplete = () => {
    console.log('📋 Weekly goals completed, showing paywall');
    setShowWeeklyGoals(false);
    setShowPaywall(true);
  };

  const handlePaywallClose = async () => {
    console.log('💳 Paywall closed, starting completion process');
    setShowPaywall(false);
    try {
      const userId = await import("../services/auth").then((m) =>
        m.authService.getUserId(),
      );
      
      console.log('👤 User ID:', userId);
      console.log('💾 Marking onboarding as complete');
      
      const { data: currentProfile } = await databaseService.supabase
        .from("user_profiles")
        .select("metadata")
        .eq("user_id", userId)
        .single();

      const updatedMetadata = {
        ...(currentProfile?.metadata || {}),
        onboarding_completed: true
      };

      const { error } = await databaseService.supabase
        .from("user_profiles")
        .update({ 
          metadata: updatedMetadata
        })
        .eq("user_id", userId);
      
      if (error) {
        console.error('❌ Database update error:', error);
      } else {
        console.log('✅ Onboarding marked complete');
      }
      
      console.log('🔄 Reloading user profile');
      await loadUserProfile();
      console.log('✅ Onboarding completion process finished');
    } catch (error) {
      console.error("❌ Error completing onboarding:", error);
    }
  };

  const renderContent = () => {
    switch (currentStep.type) {
      case "processing":
        return <ProcessingScreen colors={colors} />;

      case "multi-select":
      case "single-select":
        return (
          <View style={styles.optionsContainer}>
            {currentStep.options?.map((option, index) => {
              const isSelected =
                currentStep.type === "multi-select"
                  ? (selections[currentStep.id] || []).includes(option)
                  : singleSelections[currentStep.id] === option;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surface,
                      borderColor: isSelected
                        ? colors.primary
                        : colors.border || colors.textSecondary + "40",
                    },
                  ]}
                  onPress={() => handleSelection(currentStep.id, option)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? colors.background : colors.text },
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case "text":
        return (
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: colors.surface, color: colors.text },
            ]}
            placeholder={currentStep.placeholder}
            placeholderTextColor={colors.textSecondary}
            value={textInputs[currentStep.id] || ""}
            onChangeText={(text) =>
              setTextInputs((prev) => ({ ...prev, [currentStep.id]: text }))
            }
            multiline
            textAlignVertical="top"
          />
        );

      case "info":
      default:
        if (currentStep.id === "notifications") {
          return (
            <>
              <View style={styles.notificationContainer}>
                <View
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <IconSymbol
                    name="bell.badge.fill"
                    size={48}
                    color={colors.primary}
                  />
                </View>
              </View>
              {currentStep.tip && (
                <View
                  style={[
                    styles.tipBox,
                    { backgroundColor: colors.primary + "20" },
                  ]}
                >
                  <IconSymbol
                    name="info.circle.fill"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={[styles.tipText, { color: colors.primary }]}>
                    {currentStep.tip}
                  </Text>
                </View>
              )}
            </>
          );
        }
        return currentStep.tip ? (
          <View
            style={[styles.tipBox, { backgroundColor: colors.primary + "20" }]}
          >
            <IconSymbol
              name="info.circle.fill"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.tipText, { color: colors.primary }]}>
              {currentStep.tip}
            </Text>
          </View>
        ) : null;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {currentStepIndex > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <IconSymbol
                name="chevron.left"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
          <Text style={[styles.stepIndicator, { color: colors.textSecondary }]}>
            Step {currentStepIndex + 1} of {INTERVIEW_STEPS.length}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View
          style={[styles.progressBarBg, { backgroundColor: colors.surface }]}
        >
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: colors.primary,
                width: `${
                  ((currentStepIndex + 1) / INTERVIEW_STEPS.length) * 100
                }%`,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {currentStep.title}
          </Text>
          {currentStep.subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {currentStep.subtitle}
            </Text>
          )}
          {renderContent()}
        </Animated.View>
      </ScrollView>

      {currentStep.type !== "processing" && (
        <View style={[styles.footer, { paddingBottom: 20 }]}>
          {currentStep.id === "welcome" && (
            <TouchableOpacity
              onPress={() => Linking.openURL('https://betteros.app/terms')}
              style={styles.disclaimerContainer}
            >
              <Text style={[styles.disclaimer, { color: colors.textTertiary }]}>
                By continuing, you agree to our{' '}
                <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: colors.primary },
              (!canProceed() || requestingNotifications) && {
                backgroundColor: colors.surface,
                shadowOpacity: 0,
                opacity: 0.4,
              },
            ]}
            onPress={handleNext}
            disabled={!canProceed() || requestingNotifications}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.nextButtonText,
                {
                  color:
                    canProceed() && !requestingNotifications
                      ? colors.background
                      : colors.textSecondary,
                },
              ]}
            >
              {requestingNotifications
                ? "Requesting..."
                : currentStep.id === "notifications"
                ? "Enable Notifications"
                : isLastStep
                ? "Complete Profile"
                : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showDailyRituals && (
        <DailyRitualsModal
          visible={showDailyRituals}
          onClose={() => setShowDailyRituals(false)}
          onComplete={handleDailyRitualsComplete}
        />
      )}
      {showDailyGoals && (
        <TodaysGoalsModal
          visible={showDailyGoals}
          onClose={() => setShowDailyGoals(false)}
          onComplete={handleDailyGoalsComplete}
        />
      )}
      {showWeeklyGoals && (
        <WeeklyGoalsModal
          visible={showWeeklyGoals}
          onClose={() => setShowWeeklyGoals(false)}
          onComplete={handleWeeklyGoalsComplete}
        />
      )}
      <PaywallComponent
        visible={showPaywall}
        onClose={handlePaywallClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    height: 40,
  },
  stepIndicator: { fontSize: 14, fontWeight: "600" },
  backButton: { padding: 4 },
  progressBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  title: { fontSize: 32, fontWeight: "800", marginBottom: 12, lineHeight: 38 },
  subtitle: { fontSize: 18, marginBottom: 32, lineHeight: 26 },
  optionsContainer: { gap: 12 },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  optionText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },
  textInput: {
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: "top",
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  tipText: { fontSize: 15, fontWeight: "600", flex: 1 },
  processingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderTopColor: "transparent",
    marginBottom: 20,
  },
  processingText: { fontSize: 18, fontWeight: "600" },
  footer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: { fontSize: 18, fontWeight: "700" },
  notificationContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  notificationIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  disclaimerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
