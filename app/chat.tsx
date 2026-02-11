import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ChatInterface } from '@/components/ChatInterface';
import { useTheme } from '@/hooks/use-theme';

export default function ChatScreen() {
  const { colors } = useTheme();
  const { coachId, coachName, coachColor } = useLocalSearchParams<{
    coachId: string;
    coachName: string;
    coachColor: string;
  }>();

  if (!coachId || !coachName || !coachColor) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Invalid coach data</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ChatInterface
          coachId={coachId}
          coachName={coachName}
          coachColor={coachColor}
          onBack={() => router.back()}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});