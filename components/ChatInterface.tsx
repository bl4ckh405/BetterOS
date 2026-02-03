import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../hooks/use-theme';
import { IconSymbol } from './ui/icon-symbol';
import { supabase } from '../services/supabase';
import { APIService } from '../services/api';
import { databaseService } from '../services/database';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
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
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ coachId, coachName, coachColor, sessionId: existingSessionId, onBack }) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [coach, setCoach] = useState<Coach | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
    return () => {
      // Cleanup subscription
      supabase.removeAllChannels();
    };
  }, [coachId]);

  const initializeChat = async () => {
    try {
      // Load coach data
      const coachData = await databaseService.getCoach(coachId);
      setCoach(coachData);
      
      let currentSessionId;
      
      if (existingSessionId) {
        // Use existing session
        currentSessionId = existingSessionId;
      } else {
        // Check for existing session or create new one
        const { data: existingSessions } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('coach_id', coachId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (existingSessions && existingSessions.length > 0) {
          currentSessionId = existingSessions[0].id;
        } else {
          currentSessionId = await APIService.createChatSession(coachId);
        }
      }
      
      setSessionId(currentSessionId);

      // Load existing messages
      const { data: existingMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', currentSessionId)
        .order('created_at', { ascending: true });

      if (existingMessages) {
        setMessages(existingMessages);
      }

      // Subscribe to realtime messages
      const channel = supabase
        .channel(`chat_${currentSessionId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `session_id=eq.${currentSessionId}`
          }, 
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages(prev => {
              // Prevent duplicates by checking if message already exists
              if (prev.some(msg => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading || !sessionId) {
      return;
    }

    const userMessage = inputText.trim();
    setInputText('');
    setLoading(true);

    try {
      await databaseService.saveMessage({
        session_id: sessionId,
        content: userMessage,
        role: 'user'
      });

      // Show typing animation
      let typingText = '';
      const response = await APIService.sendMessage(coachId, userMessage, sessionId, (text) => {
        typingText = text;
        setTypingMessage(text);
      });
      
      // Clear typing animation - realtime will show the saved message
      setTypingMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setTypingMessage('');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.assistantMessage
      ]}>
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isUser ? coachColor : colors.surface,
            alignSelf: isUser ? 'flex-end' : 'flex-start',
          }
        ]}>
          {isUser ? (
            <Text style={[styles.messageText, { color: 'white' }]}>
              {item.content}
            </Text>
          ) : (
            <Markdown
              style={{
                body: { color: colors.text, fontSize: 16, lineHeight: 20 },
                paragraph: { marginTop: 0, marginBottom: 8 },
                strong: { fontWeight: '600' },
                em: { fontStyle: 'italic' },
                code_inline: { 
                  backgroundColor: colors.surfaceSecondary, 
                  paddingHorizontal: 4,
                  borderRadius: 3,
                  fontFamily: 'monospace'
                },
                code_block: { 
                  backgroundColor: colors.surfaceSecondary, 
                  padding: 8,
                  borderRadius: 6,
                  fontFamily: 'monospace'
                },
                bullet_list: { marginBottom: 8 },
                ordered_list: { marginBottom: 8 },
              }}
            >
              {item.content}
            </Markdown>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
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
          <Text style={[styles.coachName, { color: colors.text }]}>{coachName}</Text>
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
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Typing animation */}
      {typingMessage && (
        <View style={styles.messagesContent}>
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={[styles.messageBubble, { backgroundColor: colors.surface }]}>
              <Markdown
                style={{
                  body: { color: colors.text, fontSize: 16, lineHeight: 20 },
                  paragraph: { marginTop: 0, marginBottom: 8 },
                }}
              >
                {typingMessage}
              </Markdown>
            </View>
          </View>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.textInput, { 
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border
          }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, { 
            backgroundColor: inputText.trim() ? coachColor : colors.surface,
            opacity: loading ? 0.5 : 1
          }]}
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
        >
          <IconSymbol 
            name="arrow.up" 
            size={20} 
            color={inputText.trim() ? 'white' : colors.textTertiary} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  coachName: {
    fontSize: 18,
    fontWeight: '600',
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
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});