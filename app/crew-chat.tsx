import { IconSymbol } from "@/components/ui/icon-symbol";
import { useOrbit } from "@/contexts/OrbitContext";
import { useTheme } from "@/hooks/use-theme";
import { backendService } from "@/services/backend";
import { goalsService } from "@/services/goals";
import { crewService } from "@/services/crew";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function CrewChatScreen() {
  const { modeId, modeName, modeColor } = useLocalSearchParams<{
    modeId: string;
    modeName: string;
    modeColor: string;
  }>();
  const { colors } = useTheme();
  const { userProfile } = useOrbit();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextLoading, setContextLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadTodaySession();
  }, [userProfile?.id, modeId]);

  const loadTodaySession = async () => {
    try {
      setContextLoading(true);
      
      // Load messages for this crew member from today's session
      const crewMessages = await crewService.getCrewMemberMessages(modeId as 'boss' | 'creative' | 'stoic');
      
      if (crewMessages.length > 0) {
        // Convert to Message format
        const formattedMessages: Message[] = crewMessages.map(msg => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(formattedMessages);
      } else {
        // No messages yet, show greeting
        const context = await crewService.buildCrewContext(modeId as 'boss' | 'creative' | 'stoic');
        const greeting = await getGreeting(context);
        
        const greetingMessage: Message = {
          id: '1',
          content: greeting,
          role: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages([greetingMessage]);
        // Save greeting to shared session
        await crewService.saveMessage(modeId as 'boss' | 'creative' | 'stoic', 'assistant', greeting);
      }
    } catch (error) {
      console.error('Error loading today session:', error);
    } finally {
      setContextLoading(false);
    }
  };

  const getGreeting = async (context: string): Promise<string> => {
    const greetings = {
      boss: `I'm The Boss. Let's cut to the chase.\n\n${context}\n\nWhat needs my attention?`,
      creative: `Hey! I'm The Creative, here to help you think bigger.\n\n${context}\n\nWhat ideas are brewing?`,
      stoic: `Welcome. I'm The Stoic, your companion for reflection.\n\n${context}\n\nWhat's on your mind?`,
    };

    return (
      greetings[modeId as keyof typeof greetings] ||
      "Hello! How can I help you today?"
    );
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

    // Save user message to shared session
    await crewService.saveMessage(modeId as 'boss' | 'creative' | 'stoic', 'user', userMessage.content);

    try {
      // Build context including other crew conversations
      const crewContext = await crewService.buildCrewContext(modeId as 'boss' | 'creative' | 'stoic');

      // Get response from backend with crew context
      const conversationHistory = messages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");
      
      const fullContext = `${crewContext}\n\n# Conversation History:\n${conversationHistory}`;
      
      const response = await backendService.sendCrewMessage(
        modeId,
        userMessage.content,
        { context: fullContext },
        conversationHistory,
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save assistant message to shared session
      await crewService.saveMessage(modeId as 'boss' | 'creative' | 'stoic', 'assistant', response);
      
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
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
                backgroundColor: isUser ? modeColor : colors.surface,
                alignSelf: isUser ? "flex-end" : "flex-start",
              },
            ]}
          >
            {isUser ? (
              <Text style={[styles.messageText, { color: "white" }]}>
                {item.content}
              </Text>
            ) : (
              <Markdown
                style={{
                  body: { color: colors.text, fontSize: 16, lineHeight: 24 },
                  paragraph: { marginTop: 0, marginBottom: 8 },
                  strong: { fontWeight: "700", color: colors.text },
                  em: { fontStyle: "italic" },
                  code_inline: {
                    backgroundColor: colors.surfaceSecondary,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                    fontSize: 14,
                  },
                  code_block: {
                    backgroundColor: colors.surfaceSecondary,
                    padding: 12,
                    borderRadius: 8,
                    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                    fontSize: 14,
                  },
                  bullet_list: { marginBottom: 8 },
                  ordered_list: { marginBottom: 8 },
                  list_item: { marginBottom: 4 },
                  heading1: {
                    fontSize: 24,
                    fontWeight: "700",
                    marginBottom: 12,
                    color: colors.text,
                  },
                  heading2: {
                    fontSize: 20,
                    fontWeight: "700",
                    marginBottom: 10,
                    color: colors.text,
                  },
                  heading3: {
                    fontSize: 18,
                    fontWeight: "600",
                    marginBottom: 8,
                    color: colors.text,
                  },
                  blockquote: {
                    backgroundColor: colors.surfaceSecondary,
                    borderLeftWidth: 4,
                    borderLeftColor: modeColor,
                    paddingLeft: 12,
                    paddingVertical: 8,
                    marginBottom: 8,
                  },
                }}
              >
                {item.content}
              </Markdown>
            )}
          </View>
        </View>
      );
    },
    [colors, modeColor],
  );

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
        <ActivityIndicator size="large" color={modeColor} />
        <Text
          style={[
            styles.loadingText,
            { color: colors.textSecondary, marginTop: 16 },
          ]}
        >
          Loading your context...
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
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <View style={[styles.avatar, { backgroundColor: modeColor }]}>
              <IconSymbol
                name={
                  modeId === "boss"
                    ? "briefcase.fill"
                    : modeId === "creative"
                    ? "lightbulb.fill"
                    : "brain.head.profile"
                }
                size={20}
                color="white"
              />
            </View>
            <Text style={[styles.modeName, { color: colors.text }]}>
              {modeName}
            </Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Message ${modeName}...`}
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim() ? modeColor : colors.surface,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
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
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  assistantMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  textInput: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    marginRight: 8,
    maxHeight: 120,
    fontSize: 16,
    lineHeight: 22,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingText: {
    fontSize: 14,
  },
});
