import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface AvatarProps {
  seed?: string;
  size?: number;
}

export default function Avatar({ seed = 'user', size = 36 }: AvatarProps) {
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer-neutral/png?seed=${seed}&size=${size * 2}`;
  
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  avatar: {
    backgroundColor: 'transparent',
  },
});
