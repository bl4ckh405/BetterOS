import { IconSymbol } from "@/components/ui/icon-symbol";
import { useOrbit } from "@/contexts/OrbitContext";
import { useTheme } from "@/hooks/use-theme";
import { backendService } from "@/services/backend";
import { goalsService } from "@/services/goals";
import { authService } from "@/services/auth";
import { router, Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const TypingIndicator = ({ color, backgroundColor }: { color: string; backgroundColor: string }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: -6,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.ease,
            delay: delay,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.ease,
          }),
        ]),
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={[styles.messageContainer, styles.assistantMessage]}>
      <View style={[styles.messageBubble, { backgroundColor }]}>
        <View style={styles.typingIndicator}>
          <Animated.View style={[styles.typingDot, { backgroundColor: color, transform: [{ translateY: dot1 }] }]} />
          <Animated.View style={[styles.typingDot, { backgroundColor: color, transform: [{ translateY: dot2 }] }]} />
          <Animated.View style={[styles.typingDot, { backgroundColor: color, transform: [{ translateY: dot3 }] }]} />
        </View>
      </View>
    </View>
  );
};

export default function DailyStandupScreen() {
  const { colors } = useTheme();
  const { userProfile } = useOrbit();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [contextLoading, setContextLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadInitialStandup();
  }, []);

  const loadInitialStandup = async () => {
    try {
      setContextLoading(true);
      const userId = await authService.getUserId();
      const existingMessages = await backendService.getTodayStandupMessages(userId);
      
      if (existingMessages.length > 0) {
        setMessages(existingMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.created_at),
        })));
      } else {
        const [longTermGoals, weeklyGoals, todaysTasks, habits] =
          await Promise.all([
            goalsService.getGoals("long_term"),
            goalsService.getGoals("weekly"),
            goalsService.getTodaysTasks(),
            goalsService.getHabits(),
          ]);

        const userContext = {
          values: userProfile?.coreValues || [],
          five_year_goal: userProfile?.fiveYearGoal || "",
          long_term_goals: longTermGoals.map((g) => ({
            title: g.title,
            progress: g.progress,
          })),
          weekly_goals: weeklyGoals.map((g) => ({
            title: g.title,
            progress: g.progress,
          })),
          todays_tasks: todaysTasks.map((t) => ({
            title: t.title,
            completed: t.completed,
          })),
          habits: habits.map((h) => ({
            name: h.name,
            completed: h.completed_today,
          })),
        };

        const { messages: newMessages } = await backendService.sendStandupMessage(userId, '', userContext);
        setMessages(newMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.created_at),
        })));
      }
    } catch (error) {
      console.error("Error loading standup:", error);
    } finally {
      setContextLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);
    setIsTyping(true);

    try {
      const userId = await authService.getUserId();
      const [longTermGoals, weeklyGoals, todaysTasks, habits] =
        await Promise.all([
          goalsService.getGoals("long_term"),
          goalsService.getGoals("weekly"),
          goalsService.getTodaysTasks(),
          goalsService.getHabits(),
        ]);

      const userContext = {
        values: userProfile?.coreValues || [],
        five_year_goal: userProfile?.fiveYearGoal || "",
        long_term_goals: longTermGoals.map((g) => ({
          title: g.title,
          progress: g.progress,
        })),
        weekly_goals: weeklyGoals.map((g) => ({
          title: g.title,
          progress: g.progress,
        })),
        todays_tasks: todaysTasks.map((t) => ({
          title: t.title,
          completed: t.completed,
        })),
        habits: habits.map((h) => ({
          name: h.name,
          completed: h.completed_today,
        })),
      };

      const { response, messages: updatedMessages } = await backendService.sendStandupMessage(
        userId,
        userMessage.content,
        userContext,
      );

      setIsTyping(false);
      setMessages(updatedMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: new Date(msg.created_at),
      })));
      
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser ? colors.accent.creative : colors.surface,
              alignSelf: isUser ? "flex-end" : "flex-start",
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? "white" : colors.text },
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  if (contextLoading) {
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
        <ActivityIndicator size="large" color={colors.accent.creative} />
        <Text
          style={[
            styles.loadingText,
            { color: colors.textSecondary, marginTop: 16 },
          ]}
        >
          Preparing your standup...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.accent.creative },
              ]}
            >
              <IconSymbol name="person.2.fill" size={20} color="white" />
            </View>
            <View>
              <Text style={[styles.modeName, { color: colors.text }]}>
                Daily Standup
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                5:00 PM Check-in
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListFooterComponent={
            isTyping ? (
              <TypingIndicator color={colors.textTertiary} backgroundColor={colors.surface} />
            ) : null
          }
        />

        <View
          style={[styles.inputContainer, { borderTopColor: colors.border }]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Share your progress..."
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim()
                  ? colors.accent.creative
                  : colors.surface,
                opacity: loading ? 0.5 : 1,
              },
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <IconSymbol
              name="arrow.up"
              size={20}
              color={inputText.trim() ? "white" : colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modeName: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 18,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 12,
    gap: 3,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
});
