import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ChatInterface } from '@/components/ChatInterface';
import { useTheme } from '@/hooks/use-theme';

export default function ChatScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChatInterface />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});