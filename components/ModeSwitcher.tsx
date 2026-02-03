import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AIMode } from '../types';
import { DEFAULT_MODES } from '../constants/modes';
import { useOrbit } from '../contexts/OrbitContext';
import { useTheme } from '../hooks/use-theme';

const { width } = Dimensions.get('window');

export const ModeSwitcher: React.FC = () => {
  const { currentMode, setCurrentMode } = useOrbit();
  const { colors } = useTheme();

  const handleModeSelect = async (mode: AIMode) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentMode(mode);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Choose Your Mode</Text>
      <View style={styles.modeGrid}>
        {DEFAULT_MODES.map((mode) => {
          const isSelected = currentMode.id === mode.id;
          const modeColor = colors.accent[mode.id as keyof typeof colors.accent];
          
          return (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeCard,
                { 
                  borderColor: modeColor,
                  backgroundColor: isSelected ? modeColor : colors.surface
                }
              ]}
              onPress={() => handleModeSelect(mode)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.modeName,
                { color: isSelected ? colors.background : colors.text }
              ]}>
                {mode.name}
              </Text>
              <Text style={[
                styles.modeDescription,
                { color: isSelected ? colors.background : colors.textSecondary }
              ]}>
                {mode.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  modeGrid: {
    gap: 16,
  },
  modeCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  modeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});