import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AIMode } from '../types';
import { DEFAULT_MODES } from '../constants/modes';
import { useOrbit } from '../contexts/OrbitContext';
import { useTheme } from '../hooks/use-theme';

const DIAL_SIZE = 120;
const KNOB_SIZE = 40;
const MODES_RADIUS = 35;

export const ModeDial: React.FC = () => {
  const { currentMode, setCurrentMode } = useOrbit();
  const { colors } = useTheme();

  const getModePosition = (index: number) => {
    const angle = (index * 120) - 90; // 120 degrees apart, starting from top
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * MODES_RADIUS,
      y: Math.sin(radian) * MODES_RADIUS,
    };
  };

  const selectMode = async (mode: AIMode) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentMode(mode);
  };

  const currentModeIndex = DEFAULT_MODES.findIndex(mode => mode.id === currentMode.id);
  const knobPosition = getModePosition(currentModeIndex);

  return (
    <View style={styles.container}>
      <View style={[styles.dial, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Mode Labels & Touch Areas */}
        {DEFAULT_MODES.map((mode, index) => {
          const pos = getModePosition(index);
          const isSelected = currentMode.id === mode.id;
          const modeColor = colors.accent[mode.id as keyof typeof colors.accent];
          
          return (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.modeTouch,
                {
                  left: DIAL_SIZE / 2 + pos.x - 25,
                  top: DIAL_SIZE / 2 + pos.y - 25,
                }
              ]}
              onPress={() => selectMode(mode)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.modeLabelText,
                { 
                  color: isSelected ? modeColor : colors.textSecondary,
                  fontWeight: isSelected ? '600' : '400'
                }
              ]}>
                {mode.name.split(' ')[1]}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Joystick Knob */}
        <View
          style={[
            styles.knob,
            {
              backgroundColor: colors.accent[currentMode.id as keyof typeof colors.accent],
              left: DIAL_SIZE / 2 + knobPosition.x - KNOB_SIZE / 2,
              top: DIAL_SIZE / 2 + knobPosition.y - KNOB_SIZE / 2,
            },
          ]}
        >
          <Text style={[styles.knobText, { color: colors.background }]}>
            {currentMode.name.charAt(0)}
          </Text>
        </View>

        {/* Center Dot */}
        <View style={[styles.centerDot, { backgroundColor: colors.border }]} />
      </View>
      
      <Text style={[styles.selectedModeText, { color: colors.text }]}>
        {currentMode.name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  dial: {
    width: DIAL_SIZE,
    height: DIAL_SIZE,
    borderRadius: DIAL_SIZE / 2,
    borderWidth: 2,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTouch: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabelText: {
    fontSize: 12,
    textAlign: 'center',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  knobText: {
    fontSize: 16,
    fontWeight: '600',
  },
  centerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
  selectedModeText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
});