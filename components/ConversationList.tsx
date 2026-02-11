import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useTheme } from "../hooks/use-theme";
import { useCoaches } from "../contexts/CoachContext";
import { databaseService } from "../services/database";
import { ChatInterface } from "./ChatInterface";
import { IconSymbol } from "./ui/icon-symbol";

interface Conversation {
  id: string;
  coach_id: string;
  created_at: string;
  coach?: {
    name: string;
    color: string;
    avatar_url?: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
}

export const ConversationList: React.FC = () => {
  const { colors } = useTheme();
  const { coaches } = useCoaches();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  useEffect(() => {
    loadConversations();
    
    // Subscribe to realtime conversation changes
    const conversationSubscription = databaseService.supabase
      .channel('conversations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    // Subscribe to realtime message changes to update last messages
    const messageSubscription = databaseService.supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      conversationSubscription.unsubscribe();
      messageSubscription.unsubscribe();
    };
  }, []);

  const loadConversations = async () => {
    try {
      const userId = await import('../services/auth').then(m => m.authService.getUserId());
      const { data: sessions } = await databaseService.supabase
        .from("chat_sessions")
        .select(
          `
          id,
          coach_id,
          created_at,
          coaches!inner(
            name,
            color,
            avatar_url
          )
        `,
        )
        .eq('user_id', userId)
        .order("created_at", { ascending: false });

      if (sessions) {
        const conversationsWithMessages = await Promise.all(
          sessions.map(async (session) => {
            const { data: messages } = await databaseService.supabase
              .from("messages")
              .select("content, created_at")
              .eq("session_id", session.id)
              .order("created_at", { ascending: false })
              .limit(1);

            return {
              ...session,
              coach: Array.isArray(session.coaches)
                ? session.coaches[0]
                : session.coaches,
              lastMessage: messages?.[0],
            };
          }),
        );
        setConversations(conversationsWithMessages);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { backgroundColor: colors.surface }]}
      onPress={() => setSelectedConversation(item)}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: item.coach?.color || colors.primary },
        ]}
      >
        {item.coach?.avatar_url ? (
          <Image 
            source={{ uri: item.coach.avatar_url }} 
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <IconSymbol name="person" size={20} color="white" />
        )}
      </View>
      <View style={styles.conversationInfo}>
        <Text style={[styles.coachName, { color: colors.text }]}>
          {item.coach?.name || "Unknown Coach"}
        </Text>
        <Text
          style={[styles.lastMessage, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.lastMessage?.content || "No messages yet"}
        </Text>
      </View>
      <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (selectedConversation) {
    return (
      <View style={styles.fullScreen}>
        <ChatInterface
          coachId={selectedConversation.coach_id}
          coachName={selectedConversation.coach?.name || "Coach"}
          coachColor={selectedConversation.coach?.color || colors.primary}
          sessionId={selectedConversation.id}
          onBack={() => setSelectedConversation(null)}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[{ color: colors.text }]}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          style={styles.conversationList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <View
              style={[styles.iconBackground, { backgroundColor: colors.text }]}
            >
              <IconSymbol name="plus" size={24} color={colors.background} />
            </View>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No conversations yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Start a conversation with a coach from the home screen
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  conversationList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  conversationInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyIcon: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});
