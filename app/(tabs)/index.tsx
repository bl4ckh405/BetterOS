import Avatar from "@/components/Avatar";
import DailyRitualsModal from "@/components/DailyRitualsModal";
import LongTermGoalModal from "@/components/LongTermGoalModal";
import { OnboardingInterview } from "@/components/OnboardingInterview";
import TodaysGoalsModal from "@/components/TodaysGoalsModal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import WeeklyGoalsModal from "@/components/WeeklyGoalsModal";
import { useOrbit } from "@/contexts/OrbitContext";
import { useTheme } from "@/hooks/use-theme";
import { Goal, goalsService, Habit, Task } from "@/services/goals";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function CrewScreen() {
  const { isOnboarded, userProfile, loadUserProfile, loading } = useOrbit();
  const { colors } = useTheme();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [activeGoalIndex, setActiveGoalIndex] = useState(0);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showWeeklyGoals, setShowWeeklyGoals] = useState(false);
  const [showLongTermGoal, setShowLongTermGoal] = useState(false);
  const [showDailyRituals, setShowDailyRituals] = useState(false);
  const [showTodaysGoals, setShowTodaysGoals] = useState(false);
  const [maxGoalCardHeight, setMaxGoalCardHeight] = useState(0);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  useEffect(() => {
    if (!loading && isOnboarded) {
      loadAllData();
    } else if (!loading && !isOnboarded) {
      setIsLoadingData(false);
    }
  }, [loading, isOnboarded]);

  const loadAllData = async () => {
    try {
      setIsLoadingData(true);
      const [longTermGoals, weeklyGoals, tasksData, habitsData] =
        await Promise.all([
          goalsService.getGoals("long_term"),
          goalsService.getGoals("weekly"),
          goalsService.getTodaysTasks(),
          goalsService.getHabits(),
        ]);

      // Calculate deadline_days and progress dynamically
      const enrichedGoals = longTermGoals.map((goal) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate days left
        const deadline = new Date(goal.deadline || today);
        deadline.setHours(0, 0, 0, 0);
        const diffTime = deadline.getTime() - today.getTime();
        const deadline_days = Math.max(
          0,
          Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
        );

        // Calculate progress based on time elapsed
        const createdAt = new Date(goal.created_at);
        createdAt.setHours(0, 0, 0, 0);
        const totalDays = Math.ceil(
          (deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        const elapsedDays = Math.ceil(
          (today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        const timeProgress =
          totalDays > 0
            ? Math.min(100, Math.round((elapsedDays / totalDays) * 100))
            : 0;

        return {
          ...goal,
          deadline_days,
          progress: timeProgress,
        };
      });

      setGoals(enrichedGoals);
      setWeeklyGoals(weeklyGoals);
      setTasks(tasksData);
      setHabits(habitsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const completedHabits = habits.filter((h) => h.completed_today).length;

  // DEBUG: Log the actual state
  console.log("🔍 DEBUG STATE:", {
    loading,
    isOnboarded,
    userProfile,
    hasGoals: goals.length,
    hasWeeklyGoals: weeklyGoals.length,
    hasTasks: tasks.length,
    hasHabits: habits.length,
  });

  // Show onboarding first, before any loading states
  if (!isOnboarded && !loading) {
    console.log("✅ Showing OnboardingInterview");
    return <OnboardingInterview />;
  }

  // Show loading only after onboarding check
  if (loading || isLoadingData) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: colors.textSecondary, marginTop: 16 },
          ]}
        >
          Loading your data...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TodaysGoalsModal
        visible={showTodaysGoals}
        onClose={() => setShowTodaysGoals(false)}
        onComplete={async () => {
          setShowTodaysGoals(false);
          const tasksData = await goalsService.getTodaysTasks();
          setTasks(tasksData);
        }}
      />
      <WeeklyGoalsModal
        visible={showWeeklyGoals}
        onClose={() => setShowWeeklyGoals(false)}
        onComplete={async () => {
          const weeklyGoalsData = await goalsService.getGoals("weekly");
          setWeeklyGoals(weeklyGoalsData);
        }}
      />
      <LongTermGoalModal
        visible={showLongTermGoal}
        onClose={() => setShowLongTermGoal(false)}
        onComplete={async () => {
          const longTermGoals = await goalsService.getGoals("long_term");
          setGoals(longTermGoals);
        }}
      />
      <DailyRitualsModal
        visible={showDailyRituals}
        onClose={() => setShowDailyRituals(false)}
        onComplete={async () => {
          const habitsData = await goalsService.getHabits();
          setHabits(habitsData);
        }}
      />

      {/* Compact Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {new Date().getHours() < 12
              ? "Good morning"
              : new Date().getHours() < 18
              ? "Good afternoon"
              : "Good evening"}
            {userProfile?.name ? `, ${userProfile.name}` : ""}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>BetterOS</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.realignButton,
            { backgroundColor: colors.accent.boss },
          ]}
        >
          <Avatar seed={userProfile?.id || "default"} size={40} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Goals Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Long-term Goals
            </Text>
            <TouchableOpacity
              onPress={() => setShowLongTermGoal(true)}
              style={styles.addIconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol
                name="plus.circle.fill"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          {goals.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x / (width - 40),
                  );
                  setActiveGoalIndex(index);
                }}
                decelerationRate="fast"
                snapToInterval={width - 40}
                snapToAlignment="start"
                style={styles.goalsScroll}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {goals.map((goal, index) => (
                  <View
                    key={goal.id}
                    style={{
                      width: width - 40,
                      paddingRight: index < goals.length - 1 ? 12 : 0,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.goalCard,
                        { backgroundColor: colors.surface },
                        maxGoalCardHeight > 0 && { height: maxGoalCardHeight },
                      ]}
                      activeOpacity={1}
                      onLayout={(e) => {
                        const { height } = e.nativeEvent.layout;
                        if (height > maxGoalCardHeight) {
                          setMaxGoalCardHeight(height);
                        }
                      }}
                    >
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Optimistic update
                          setGoals((prev) =>
                            prev.filter((g) => g.id !== goal.id),
                          );
                          await goalsService.deleteGoal(goal.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <IconSymbol
                          name="xmark.circle.fill"
                          size={20}
                          color="#FF3B30"
                        />
                      </TouchableOpacity>
                      <View style={styles.goalHeader}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[styles.goalTitle, { color: colors.text }]}
                          >
                            {goal.title}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.goalProgress,
                            { color: colors.accent.creative },
                          ]}
                        >
                          {goal.progress}%
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.goalDeadline,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {goal.deadline_days} days left
                      </Text>
                      <View
                        style={[
                          styles.progressBar,
                          { backgroundColor: colors.border },
                        ]}
                      >
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${goal.progress}%`,
                              backgroundColor: colors.accent.creative,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.milestones}>
                        {goal.milestones.map((milestone, i) => (
                          <View key={i} style={styles.milestone}>
                            <IconSymbol
                              name={
                                milestone.done
                                  ? "checkmark.circle.fill"
                                  : "circle"
                              }
                              size={14}
                              color={
                                milestone.done
                                  ? colors.accent.creative
                                  : colors.textTertiary
                              }
                            />
                            <Text
                              style={[
                                styles.milestoneText,
                                { color: colors.textSecondary },
                              ]}
                            >
                              {milestone.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              {goals.length > 1 && (
                <View style={styles.carouselDots}>
                  {goals.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            index === activeGoalIndex
                              ? colors.primary
                              : colors.border,
                          width: index === activeGoalIndex ? 20 : 6,
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: colors.surface, marginTop: 12 },
              ]}
            >
              <IconSymbol name="folder" size={32} color={colors.textTertiary} />
              <Text
                style={[
                  styles.emptyStateText,
                  { color: colors.textSecondary, marginTop: 8 },
                ]}
              >
                No long-term goals yet
              </Text>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: colors.primary, marginTop: 12 },
                ]}
                onPress={() => setShowLongTermGoal(true)}
              >
                <Text
                  style={{
                    color: colors.background,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Add Goals
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Crew Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Crew
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              Tap to chat
            </Text>
          </View>
          <View style={styles.crewGrid}>
            <TouchableOpacity
              style={[styles.crewCard, { backgroundColor: colors.surface }]}
              onPress={() =>
                router.push({
                  pathname: "/crew-chat",
                  params: {
                    modeId: "boss",
                    modeName: "The Boss",
                    modeColor: colors.accent.boss,
                  },
                })
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.crewIcon,
                  { backgroundColor: colors.accent.boss + "20" },
                ]}
              >
                <IconSymbol
                  name="briefcase.fill"
                  size={18}
                  color={colors.accent.boss}
                />
              </View>
              <Text style={[styles.crewRole, { color: colors.text }]}>
                The Boss
              </Text>
              <Text
                style={[styles.crewMessage, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                Ruthless prioritization. Keep things on track.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.crewCard, { backgroundColor: colors.surface }]}
              onPress={() =>
                router.push({
                  pathname: "/crew-chat",
                  params: {
                    modeId: "creative",
                    modeName: "The Creative",
                    modeColor: colors.accent.creative,
                  },
                })
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.crewIcon,
                  { backgroundColor: colors.accent.creative + "20" },
                ]}
              >
                <IconSymbol
                  name="lightbulb.fill"
                  size={18}
                  color={colors.accent.creative}
                />
              </View>
              <Text style={[styles.crewRole, { color: colors.text }]}>
                The Creative
              </Text>
              <Text
                style={[styles.crewMessage, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                Warm, expansive thinking. "Yes, and..."
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.crewCard, { backgroundColor: colors.surface }]}
              onPress={() =>
                router.push({
                  pathname: "/crew-chat",
                  params: {
                    modeId: "stoic",
                    modeName: "The Stoic",
                    modeColor: colors.accent.stoic,
                  },
                })
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.crewIcon,
                  { backgroundColor: colors.accent.stoic + "20" },
                ]}
              >
                <IconSymbol
                  name="brain.head.profile"
                  size={18}
                  color={colors.accent.stoic}
                />
              </View>
              <Text style={[styles.crewRole, { color: colors.text }]}>
                The Stoic
              </Text>
              <Text
                style={[styles.crewMessage, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                Process emotions with Stoic wisdom.
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Week Visualizer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              This Week
            </Text>
            <TouchableOpacity
              onPress={() => setShowWeeklyGoals(true)}
              style={styles.addIconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol
                name="plus.circle.fill"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.weekScroll}
          >
            {weekDays.map((day, index) => {
              const isToday = index === today.getDay();
              const isSelected = index === selectedDay;
              const dayDate = new Date(
                today.getTime() + (index - today.getDay()) * 86400000,
              );
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCard,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surface,
                    },
                  ]}
                  onPress={() => setSelectedDay(index)}
                >
                  <Text
                    style={[
                      styles.dayName,
                      {
                        color: isSelected
                          ? colors.background
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {day}
                  </Text>
                  <Text
                    style={[
                      styles.dayNumber,
                      { color: isSelected ? colors.background : colors.text },
                    ]}
                  >
                    {dayDate.getDate()}
                  </Text>
                  {isToday && !isSelected && (
                    <View
                      style={[
                        styles.todayDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Weekly Goals List */}
          <View style={styles.weeklyGoalsContainer}>
            {weeklyGoals.length > 0 ? (
              weeklyGoals.map((goal) => (
                <View
                  key={goal.id}
                  style={[
                    styles.weeklyGoalItem,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.deleteButtonWeekly}
                    onPress={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Optimistic update
                      setWeeklyGoals((prev) =>
                        prev.filter((g) => g.id !== goal.id),
                      );
                      await goalsService.deleteGoal(goal.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      name="xmark.circle.fill"
                      size={20}
                      color="#FF3B30"
                    />
                  </TouchableOpacity>
                  <View style={styles.weeklyGoalContent}>
                    <View style={styles.weeklyGoalHeader}>
                      <Text
                        style={[styles.weeklyGoalTitle, { color: colors.text }]}
                      >
                        {goal.title}
                      </Text>
                      <Text
                        style={[
                          styles.weeklyGoalProgress,
                          { color: colors.accent.creative },
                        ]}
                      >
                        {goal.progress}%
                      </Text>
                    </View>
                    <View style={styles.weeklyGoalMilestones}>
                      {goal.milestones.map((milestone, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.weeklyMilestone}
                          onPress={async () => {
                            // Optimistic update
                            setWeeklyGoals((prev) =>
                              prev.map((g) => {
                                if (g.id === goal.id) {
                                  const newMilestones = [...g.milestones];
                                  newMilestones[i] = {
                                    ...newMilestones[i],
                                    done: !newMilestones[i].done,
                                  };
                                  const completedCount = newMilestones.filter(
                                    (m) => m.done,
                                  ).length;
                                  const progress = Math.round(
                                    (completedCount / newMilestones.length) *
                                      100,
                                  );
                                  return {
                                    ...g,
                                    milestones: newMilestones,
                                    progress,
                                  };
                                }
                                return g;
                              }),
                            );
                            await goalsService.toggleMilestone(goal.id, i);
                          }}
                          activeOpacity={0.6}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              {
                                borderColor: milestone.done
                                  ? colors.accent.creative
                                  : colors.border,
                              },
                              milestone.done && {
                                backgroundColor: colors.accent.creative,
                              },
                            ]}
                          >
                            {milestone.done && (
                              <IconSymbol
                                name="checkmark"
                                size={14}
                                color={colors.background}
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.weeklyMilestoneText,
                              {
                                color: colors.text,
                                textDecorationLine: milestone.done
                                  ? "line-through"
                                  : "none",
                                opacity: milestone.done ? 0.6 : 1,
                              },
                            ]}
                          >
                            {milestone.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View
                style={[styles.emptyState, { backgroundColor: colors.surface }]}
              >
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: colors.textSecondary },
                  ]}
                >
                  No weekly goals set
                </Text>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    { backgroundColor: colors.primary, marginTop: 12 },
                  ]}
                  onPress={() => setShowWeeklyGoals(true)}
                >
                  <Text
                    style={{
                      color: colors.background,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    Add Weekly Goals
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Habits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Daily Rituals
            </Text>
            <TouchableOpacity
              onPress={() => setShowDailyRituals(true)}
              style={styles.addIconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol
                name="plus.circle.fill"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.sectionHeader}>
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              {completedHabits}/{habits.length}
            </Text>
          </View>
          <View style={styles.habitsGrid}>
            {habits.length > 0 ? (
              habits.map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={[
                    styles.habitCard,
                    { backgroundColor: colors.surface },
                  ]}
                  onPress={async () => {
                    // Optimistic update
                    setHabits((prev) =>
                      prev.map((h) =>
                        h.id === habit.id
                          ? {
                              ...h,
                              completed_today: !h.completed_today,
                              streak: h.completed_today
                                ? h.streak - 1
                                : h.streak + 1,
                            }
                          : h,
                      ),
                    );
                    await goalsService.toggleHabit(habit.id);
                  }}
                >
                  <TouchableOpacity
                    style={styles.deleteButtonHabit}
                    onPress={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Optimistic update
                      setHabits((prev) =>
                        prev.filter((h) => h.id !== habit.id),
                      );
                      await goalsService.deleteHabit(habit.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      name="xmark.circle.fill"
                      size={18}
                      color="#FF3B30"
                    />
                  </TouchableOpacity>
                  <IconSymbol
                    name={
                      habit.completed_today ? "checkmark.circle.fill" : "circle"
                    }
                    size={20}
                    color={
                      habit.completed_today
                        ? colors.accent.creative
                        : colors.textTertiary
                    }
                  />
                  <Text
                    style={[
                      styles.habitName,
                      {
                        color: colors.text,
                        opacity: habit.completed_today ? 0.5 : 1,
                        textDecorationLine: habit.completed_today
                          ? "line-through"
                          : "none",
                      },
                    ]}
                  >
                    {habit.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View
                style={[styles.emptyState, { backgroundColor: colors.surface }]}
              >
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={32}
                  color={colors.textTertiary}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: colors.textSecondary, marginTop: 8 },
                  ]}
                >
                  No daily rituals yet
                </Text>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    { backgroundColor: colors.primary, marginTop: 12 },
                  ]}
                  onPress={() => setShowDailyRituals(true)}
                >
                  <Text
                    style={{
                      color: colors.background,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    Add Rituals
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Today's Focus */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Today's Focus
            </Text>
            <TouchableOpacity
              onPress={() => setShowTodaysGoals(true)}
              style={styles.addIconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol
                name="plus.circle.fill"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
          {isLoadingInsights ? (
            <View
              style={[styles.focusCard, { backgroundColor: colors.surface }]}
            >
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : tasks.length > 0 ? (
            tasks.slice(0, 3).map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskItem, { backgroundColor: colors.surface }]}
                onPress={async () => {
                  // Optimistic update
                  setTasks((prev) =>
                    prev.map((t) =>
                      t.id === task.id ? { ...t, completed: !t.completed } : t,
                    ),
                  );
                  await goalsService.toggleTask(task.id);
                }}
              >
                <TouchableOpacity
                  style={styles.deleteButtonTask}
                  onPress={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Optimistic update
                    setTasks((prev) => prev.filter((t) => t.id !== task.id));
                    await goalsService.deleteTask(task.id);
                  }}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    name="xmark.circle.fill"
                    size={18}
                    color="#FF3B30"
                  />
                </TouchableOpacity>
                <IconSymbol
                  name={task.completed ? "checkmark.circle.fill" : "circle"}
                  size={18}
                  color={
                    task.completed
                      ? colors.accent.creative
                      : colors.textTertiary
                  }
                />
                <View style={styles.taskContent}>
                  <Text style={[styles.taskText, { color: colors.text }]}>
                    {task.title}
                  </Text>
                  {task.time && (
                    <Text
                      style={[styles.taskTime, { color: colors.textSecondary }]}
                    >
                      {task.time}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: colors.surface, marginTop: 12 },
              ]}
            >
              <IconSymbol
                name="checkmark.circle.fill"
                size={32}
                color={colors.textTertiary}
              />
              <Text
                style={[
                  styles.emptyStateText,
                  { color: colors.textSecondary, marginTop: 8 },
                ]}
              >
                No tasks for today
              </Text>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: colors.primary, marginTop: 12 },
                ]}
                onPress={() => setShowTodaysGoals(true)}
              >
                <Text
                  style={{
                    color: colors.background,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Add Tasks
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Daily Standup */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Daily Standup
          </Text>
          <TouchableOpacity
            style={[styles.standupCard, { backgroundColor: colors.surface }]}
            onPress={() => router.push("/daily-standup")}
            activeOpacity={0.7}
          >
            <View style={styles.standupHeader}>
              <View
                style={[
                  styles.standupBadge,
                  { backgroundColor: colors.accent.creative + "20" },
                ]}
              >
                <IconSymbol
                  name="bell.fill"
                  size={12}
                  color={colors.accent.creative}
                />
                <Text
                  style={[
                    styles.standupBadgeText,
                    { color: colors.accent.creative },
                  ]}
                >
                  CHECK-IN
                </Text>
              </View>
              <Text
                style={[styles.standupTime, { color: colors.textSecondary }]}
              >
                5:00 PM
              </Text>
            </View>
            <Text style={[styles.standupText, { color: colors.text }]}>
              Time for your daily accountability check-in. Tap to review your
              progress with your PM.
            </Text>
            <View style={styles.standupFooter}>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    justifyContent: "center",
  },
  greeting: {
    fontSize: 11,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  realignButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  goalsScroll: {
    marginTop: 12,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  goalCard: {
    borderRadius: 16,
    padding: 16,
    position: "relative",
    overflow: "visible",
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingRight: 48,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 2,
  },
  goalProgress: {
    fontSize: 18,
    fontWeight: "600",
  },
  goalDeadline: {
    fontSize: 13,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  milestones: {
    flexDirection: "row",
    gap: 16,
  },
  milestone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  milestoneText: {
    fontSize: 13,
  },
  carouselDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  crewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  crewCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    padding: 14,
  },
  crewIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  crewRole: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  crewMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
  weekScroll: {
    marginTop: 12,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  dayCard: {
    width: 60,
    height: 70,
    borderRadius: 16,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dayName: {
    fontSize: 11,
    marginBottom: 4,
    fontWeight: "500",
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: "600",
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  weeklyGoalsContainer: {
    marginTop: 16,
    gap: 10,
  },
  weeklyGoalItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    position: "relative",
    overflow: "visible",
  },
  weeklyGoalContent: {
    flex: 1,
  },
  weeklyGoalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingRight: 48,
  },
  weeklyGoalTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  weeklyGoalMilestones: {
    gap: 10,
  },
  weeklyMilestone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  weeklyMilestoneText: {
    fontSize: 14,
    flex: 1,
  },
  weeklyGoalProgress: {
    fontSize: 15,
    fontWeight: "600",
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
  },
  habitsGrid: {
    gap: 10,
  },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    paddingRight: 42,
    borderRadius: 12,
    position: "relative",
    overflow: "visible",
  },
  habitName: {
    fontSize: 14,
    fontWeight: "500",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    paddingRight: 42,
    borderRadius: 12,
    marginBottom: 8,
    position: "relative",
    overflow: "visible",
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  taskTime: {
    fontSize: 12,
  },
  standupCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  standupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  standupBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  standupBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  standupTime: {
    fontSize: 12,
  },
  standupText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  standupFooter: {
    alignItems: "flex-end",
  },
  standupActions: {
    flexDirection: "row",
    gap: 10,
  },
  standupActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  standupActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  standupActionButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  standupActionTextPrimary: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  focusCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  focusTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  focusDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  dropCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  dropTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  dropDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  deleteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 999,
    padding: 6,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonWeekly: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 999,
    padding: 6,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonHabit: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 999,
    padding: 6,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonTask: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 999,
    padding: 6,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addIconButton: {
    padding: 4,
    zIndex: 1000,
  },
});
