import { IconSymbol } from "@/components/ui/icon-symbol";
import { useOrbit } from "@/contexts/OrbitContext";
import { useTheme } from "@/hooks/use-theme";
import { crewService } from "@/services/crew";
import { goalsService, Goal, Task, Habit } from "@/services/goals";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";

const { width } = Dimensions.get("window");

export default function CrewScreen() {
  const { isOnboarded, userProfile } = useOrbit();
  const { colors } = useTheme();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [activeGoalIndex, setActiveGoalIndex] = useState(0);
  const [crewInsights, setCrewInsights] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [realignmentData, setRealignmentData] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Load crew insights when user data is available
  useEffect(() => {
    if (isOnboarded && userProfile && goals.length > 0) {
      loadCrewInsights();
    }
  }, [isOnboarded, userProfile, goals]);

  const loadAllData = async () => {
    try {
      setIsLoadingData(true);
      const [goalsData, tasksData, habitsData] = await Promise.all([
        goalsService.getGoals(),
        goalsService.getTodaysTasks(),
        goalsService.getHabits(),
      ]);
      
      setGoals(goalsData);
      setTasks(tasksData);
      setHabits(habitsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadCrewInsights = async () => {
    try {
      setIsLoadingInsights(true);
      const userContext = {
        values: userProfile?.coreValues || [],
        five_year_goal: userProfile?.fiveYearGoal || '',
        anxieties: userProfile?.currentAnxieties || [],
        goals: goals.map(g => ({ title: g.title, progress: g.progress })),
        todos: tasks.map(t => t.title)
      };
      
      const [insights, realignment] = await Promise.all([
        crewService.getHomescreenInsights(userContext),
        crewService.getRealignment(userContext)
      ]);
      
      setCrewInsights(insights);
      setRealignmentData(realignment);
    } catch (error) {
      console.error('Failed to load crew insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const completedHabits = habits.filter(h => h.completed_today).length;

  if (isLoadingData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: 16 }]}>
          Loading your data...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Compact Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {new Date().getHours() < 12
              ? "Good morning"
              : new Date().getHours() < 18
              ? "Good afternoon"
              : "Good evening"}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>BetterOS</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.realignButton,
            { backgroundColor: colors.accent.boss },
          ]}
        >
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={16}
            color="white"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Goals Carousel */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Goals</Text>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
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
                style={{ width: width - 40, paddingRight: index < goals.length - 1 ? 12 : 0 }}
              >
                <TouchableOpacity
                  style={[styles.goalCard, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.goalHeader}>
                    <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
                    <Text style={[styles.goalProgress, { color: colors.accent.creative }]}>
                      {goal.progress}%
                    </Text>
                  </View>
                  <Text style={[styles.goalDeadline, { color: colors.textSecondary }]}>
                    {goal.deadline_days} days left
                  </Text>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${goal.progress}%`, backgroundColor: colors.accent.creative },
                      ]}
                    />
                  </View>
                  <View style={styles.milestones}>
                    {goal.milestones.map((milestone, i) => (
                      <View key={i} style={styles.milestone}>
                        <IconSymbol
                          name={milestone.done ? "checkmark.circle.fill" : "circle"}
                          size={14}
                          color={milestone.done ? colors.accent.creative : colors.textTertiary}
                        />
                        <Text style={[styles.milestoneText, { color: colors.textSecondary }]}>
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
                        index === activeGoalIndex ? colors.primary : colors.border,
                      width: index === activeGoalIndex ? 20 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Crew Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Crew Insights
            </Text>
          </View>
          <View style={styles.crewGrid}>
            <TouchableOpacity
              style={[styles.crewCard, { backgroundColor: colors.surface }]}
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
                Boss
              </Text>
              <Text
                style={[styles.crewMessage, { color: colors.textSecondary }]}
              >
                Focus on test drives
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.crewCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[styles.crewIcon, { backgroundColor: "#34C759" + "20" }]}
              >
                <IconSymbol
                  name="dollarsign.circle.fill"
                  size={18}
                  color="#34C759"
                />
              </View>
              <Text style={[styles.crewRole, { color: colors.text }]}>
                Financial
              </Text>
              <Text
                style={[styles.crewMessage, { color: colors.textSecondary }]}
              >
                $200 ahead
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.crewCard, { backgroundColor: colors.surface }]}
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
                Stoic
              </Text>
              <Text
                style={[styles.crewMessage, { color: colors.textSecondary }]}
              >
                Breathe deeply
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.crewCard, { backgroundColor: colors.surface }]}
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
                Creative
              </Text>
              <Text
                style={[styles.crewMessage, { color: colors.textSecondary }]}
              >
                Visualize success
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Week Visualizer */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            This Week
          </Text>
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
        </View>

        {/* Habits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Daily Rituals
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              {completedHabits}/{habits.length}
            </Text>
          </View>
          <View style={styles.habitsGrid}>
            {habits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={[styles.habitCard, { backgroundColor: colors.surface }]}
                onPress={() => goalsService.toggleHabit(habit.id).then(loadAllData)}
              >
                <IconSymbol
                  name={habit.completed_today ? "checkmark.circle.fill" : "circle"}
                  size={20}
                  color={
                    habit.completed_today ? colors.accent.creative : colors.textTertiary
                  }
                />
                <Text
                  style={[
                    styles.habitName,
                    { color: colors.text, opacity: habit.completed_today ? 1 : 0.5 },
                  ]}
                >
                  {habit.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Focus */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Today's Focus
            </Text>
          </View>
          {isLoadingInsights ? (
            <View style={[styles.focusCard, { backgroundColor: colors.surface }]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : realignmentData?.todaysFocus ? (
            <View style={[styles.focusCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.focusTitle, { color: colors.text }]}>
                {realignmentData.todaysFocus}
              </Text>
              {realignmentData.focus[0]?.description && (
                <Text style={[styles.focusDescription, { color: colors.textSecondary }]}>
                  {realignmentData.focus[0].description}
                </Text>
              )}
            </View>
          ) : (
            tasks.slice(0, 3).map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskItem, { backgroundColor: colors.surface }]}
              >
                <IconSymbol 
                  name={task.completed ? "checkmark.circle.fill" : "circle"} 
                  size={18} 
                  color={task.completed ? colors.accent.creative : colors.textTertiary} 
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
          )}
        </View>

        {/* What to Drop */}
        {realignmentData?.drop && realignmentData.drop.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>What to Drop</Text>
            {realignmentData.drop.slice(0, 3).map((item: any, index: number) => (
              <View key={index} style={[styles.dropCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.dropTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.dropDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Daily Standup */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Daily Standup
          </Text>
          <TouchableOpacity
            style={[styles.standupCard, { backgroundColor: colors.surface }]}
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
                  BRIEFING
                </Text>
              </View>
              <Text
                style={[styles.standupTime, { color: colors.textSecondary }]}
              >
                {crewInsights?.timestamp || '8:00 AM'}
              </Text>
            </View>
            {isLoadingInsights ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading insights...
                </Text>
              </View>
            ) : (
              <Text style={[styles.standupText, { color: colors.text }]}>
                {crewInsights?.briefing || 
                  '"Good morning. Yesterday you said you needed to focus on test drives. Is that still the priority?"'}
              </Text>
            )}
            <View style={styles.standupActions}>
              <TouchableOpacity
                style={[
                  styles.standupActionButton,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <Text
                  style={[styles.standupActionText, { color: colors.text }]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.standupActionButton,
                  { backgroundColor: colors.surfaceSecondary },
                ]}
              >
                <Text
                  style={[styles.standupActionText, { color: colors.text }]}
                >
                  No
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.standupActionButtonPrimary,
                  { backgroundColor: colors.primary },
                ]}
                onPress={loadCrewInsights}
              >
                <Text
                  style={[
                    styles.standupActionTextPrimary,
                    { color: colors.background },
                  ]}
                >
                  Refresh
                </Text>
              </TouchableOpacity>
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
  greeting: {
    fontSize: 12,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
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
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: "600",
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
  habitsGrid: {
    gap: 10,
  },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
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
    borderRadius: 12,
    marginBottom: 8,
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
    marginBottom: 16,
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
});
