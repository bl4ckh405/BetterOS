import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useTheme } from "../hooks/use-theme";
import { APIService } from "../services/api";
import { databaseService } from "../services/database";
import { supabase } from "../services/supabase";
import { IconSymbol } from "./ui/icon-symbol";
import { VoiceCallModal } from "./VoiceCallModal";

// Enable LayoutAnimation for Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
  session_id: string;
}

interface ChatInterfaceProps {
  coachId: string;
  coachName: string;
  coachColor: string;
  sessionId?: string;
  onBack: () => void;
}

interface Coach {
  id: string;
  name: string;
  avatar_url?: string;
  color: string;
  system_prompt?: string;
  elevenlabs_agent_id?: string;
}

// --- Sub-Component: Typing Indicator ---
const TypingIndicator = ({ color }: { color: string }) => {
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

  const dotStyle = {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color,
    marginHorizontal: 3,
  };

  return (
    <View style={styles.typingIndicatorContainer}>
      <Animated.View
        style={[dotStyle, { transform: [{ translateY: dot1 }] }]}
      />
      <Animated.View
        style={[dotStyle, { transform: [{ translateY: dot2 }] }]}
      />
      <Animated.View
        style={[dotStyle, { transform: [{ translateY: dot3 }] }]}
      />
    </View>
  );
};

// --- Sub-Component: Animated Message Bubble ---
const AnimatedMessageBubble = ({
  item,
  coachColor,
  colors,
}: {
  item: Message;
  coachColor: string;
  colors: any;
}) => {
  const isUser = item.role === "user";
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.poly(4)),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.assistantMessage,
        { opacity: fadeAnim, transform: [{ translateY }] },
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isUser ? coachColor : colors.surface,
            // Sophisticated border radius logic for "Chat App" feel
            borderBottomRightRadius: isUser ? 4 : 20,
            borderBottomLeftRadius: isUser ? 20 : 4,
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
                borderLeftColor: coachColor,
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
    </Animated.View>
  );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  coachId,
  coachName,
  coachColor,
  sessionId: existingSessionId,
  onBack,
}) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [coach, setCoach] = useState<Coach | null>(null);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
    return () => {
      supabase.removeAllChannels();
    };
  }, [coachId]);

  const initializeChat = async () => {
    try {
      const coachData = await databaseService.getCoach(coachId);
      console.log('🎯 Coach data loaded:', {
        id: coachData?.id,
        name: coachData?.name,
        avatar_url: coachData?.avatar_url,
        hasAvatar: !!coachData?.avatar_url
      });
      setCoach(coachData);

      const userId = await import("../services/auth").then((m) =>
        m.authService.getUserId(),
      );
      let currentSessionId;

      if (existingSessionId) {
        currentSessionId = existingSessionId;
      } else {
        const { data: existingSessions } = await supabase
          .from("chat_sessions")
          .select("id")
          .eq("coach_id", coachId)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);

        if (existingSessions && existingSessions.length > 0) {
          currentSessionId = existingSessions[0].id;
        } else {
          currentSessionId = await APIService.createChatSession(coachId);
        }
      }

      setSessionId(currentSessionId);

      const { data: existingMessages } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", currentSessionId)
        .order("created_at", { ascending: true });

      if (existingMessages) {
        setMessages(existingMessages);
      }

      const channel = supabase
        .channel(`chat_${currentSessionId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `session_id=eq.${currentSessionId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            // Configure next layout animation
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );

            setMessages((prev) => {
              if (prev.some((msg) => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });

            // If we receive a message from assistant, stop loading animation
            if (newMessage.role === "assistant") {
              setLoading(false);
            }
          },
        )
        .subscribe();
    } catch (error) {
      console.error("Error initializing chat:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading || !sessionId) {
      return;
    }

    const userMessage = inputText.trim();
    setInputText("");
    setLoading(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await databaseService.saveMessage({
        session_id: sessionId,
        content: userMessage,
        role: "user",
      });

      await APIService.sendMessage(coachId, userMessage, sessionId, () => {});
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    return (
      <AnimatedMessageBubble
        item={item}
        coachColor={coachColor}
        colors={colors}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={[styles.avatar, { backgroundColor: coachColor }]}>
            {coach?.avatar_url ? (
              <Image
                source={{ uri: coach.avatar_url }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <IconSymbol name="person" size={20} color="white" />
            )}
          </View>
          <Text style={[styles.coachName, { color: colors.text }]}>
            {coachName}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowVoiceCall(true)}
          style={[styles.callButton, { backgroundColor: coachColor }]}
        >
          <IconSymbol name="phone.fill" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? (
            <Animated.View
              style={[
                styles.messageContainer,
                styles.assistantMessage,
                { marginTop: 4 },
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: colors.surface,
                    borderBottomLeftRadius: 4,
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                  },
                ]}
              >
                <TypingIndicator color={colors.textSecondary} />
              </View>
            </Animated.View>
          ) : null
        }
      />

      {/* Input */}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
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
          placeholder="Type a message..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim() ? coachColor : colors.surface,
              transform: [{ scale: inputText.trim() ? 1 : 0.95 }],
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

      {/* Voice Call Modal */}
      <VoiceCallModal
        visible={showVoiceCall}
        onClose={() => setShowVoiceCall(false)}
        coachName={coachName}
        coachColor={coachColor}
        coachSystemPrompt={coach?.system_prompt || ""}
        coachAgentId={coach?.elevenlabs_agent_id}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
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
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  coachName: {
    fontSize: 18,
    fontWeight: "600",
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
    width: "100%",
  },
  userMessage: {
    alignItems: "flex-end",
    alignSelf: "flex-end",
  },
  assistantMessage: {
    alignItems: "flex-start",
    alignSelf: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    // Android Elevation
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  typingIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 12,
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
});
