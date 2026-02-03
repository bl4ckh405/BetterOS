import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal, Dimensions, Image } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useCoaches } from '@/contexts/CoachContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

const PERSONALITY_TRAITS = [
  'Supportive', 'Direct', 'Analytical', 'Creative', 'Empathetic',
  'Motivational', 'Calm', 'Energetic', 'Wise', 'Playful'
];

const EXPERTISE_AREAS = [
  'Life Coaching', 'Business Strategy', 'Health & Wellness', 'Relationships',
  'Career Development', 'Productivity', 'Mental Health', 'Finance',
  'Creative Arts', 'Leadership', 'Mindfulness', 'Education'
];

const COACH_COLORS = [
  '#FF6B35', '#4A90E2', '#7B68EE', '#34C759',
  '#FF3B30', '#FF9500', '#5856D6', '#32D74B'
];

interface CreateCoachModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateCoachModal({ visible, onClose }: CreateCoachModalProps) {
  const { colors } = useTheme();
  const { refreshCoaches } = useCoaches();
  const [coachData, setCoachData] = useState({
    name: '',
    tagline: '',
    personality: [] as string[],
    expertise: [] as string[],
    background: '',
    conversationStyle: '',
    color: COACH_COLORS[0],
    image: null as string | null,
    youtubeChannelUrl: '',
  });

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoachData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const toggleSelection = (array: string[], item: string, key: string) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    setCoachData(prev => ({ ...prev, [key]: newArray }));
  };

  const handleCreate = async () => {
    if (!coachData.name.trim()) {
      Alert.alert('Missing Information', 'Please enter a coach name.');
      return;
    }

    if (!coachData.youtubeChannelUrl.trim()) {
      Alert.alert('Missing Information', 'Please enter a YouTube channel URL.');
      return;
    }
    
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/coaches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: coachData.name,
          tagline: coachData.tagline,
          personality: coachData.personality,
          expertise: coachData.expertise,
          background: coachData.background,
          conversationStyle: coachData.conversationStyle,
          color: coachData.color,
          image: coachData.image,
          youtubeChannelUrl: coachData.youtubeChannelUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create coach');
      }

      const result = await response.json();
      console.log('✅', result.message);
      
      Alert.alert(
        'Success!', 
        'Coach created! Knowledge base building in background.',
        [{ text: 'OK', onPress: () => {
          resetForm();
          refreshCoaches();
          onClose();
        }}]
      );
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to create coach.');
    }
  };

  const resetForm = () => {
    setCoachData({
      name: '',
      tagline: '',
      personality: [] as string[],
      expertise: [] as string[],
      background: '',
      conversationStyle: '',
      color: COACH_COLORS[0],
      image: null as string | null,
      youtubeChannelUrl: '',
    });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Coach</Text>
          <TouchableOpacity 
            onPress={handleCreate}
            style={[styles.createButton, { backgroundColor: '#007AFF' }]}
          >
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={[styles.imagePreview, { backgroundColor: coachData.color }]}
              onPress={handleImageUpload}
            >
              {coachData.image ? (
                <Image source={{ uri: coachData.image }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <IconSymbol name="photo" size={32} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.uploadText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.previewContent}>
              <Text style={[styles.previewName, { color: colors.text }]}>
                {coachData.name || 'Your AI Coach'}
              </Text>
              <Text style={[styles.previewTagline, { color: colors.textSecondary }]}>
                {coachData.tagline || 'Add a compelling tagline...'}
              </Text>
              {coachData.expertise.length > 0 && (
                <View style={styles.previewTags}>
                  {coachData.expertise.slice(0, 2).map((area) => (
                    <View key={area} style={[styles.previewTag, { backgroundColor: coachData.color + '20' }]}>
                      <Text style={[styles.previewTagText, { color: coachData.color }]}>{area}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.form}>
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>✨ Basic Information</Text>
              
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Coach Name"
                placeholderTextColor={colors.textTertiary}
                value={coachData.name}
                onChangeText={(text) => setCoachData(prev => ({ ...prev, name: text }))}
              />

              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Tagline"
                placeholderTextColor={colors.textTertiary}
                value={coachData.tagline}
                onChangeText={(text) => setCoachData(prev => ({ ...prev, tagline: text }))}
              />

              <Text style={[styles.label, { color: colors.text }]}>Color Theme</Text>
              <View style={styles.colorGrid}>
                {COACH_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      coachData.color === color && styles.selectedColor
                    ]}
                    onPress={() => setCoachData(prev => ({ ...prev, color }))}
                  />
                ))}
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>🎭 Personality</Text>
              <View style={styles.tagGrid}>
                {PERSONALITY_TRAITS.map((trait) => {
                  const isSelected = coachData.personality.includes(trait);
                  return (
                    <TouchableOpacity
                      key={trait}
                      style={[
                        styles.tag,
                        { 
                          backgroundColor: isSelected ? coachData.color : colors.background,
                          borderColor: isSelected ? coachData.color : colors.border,
                        }
                      ]}
                      onPress={() => toggleSelection(coachData.personality, trait, 'personality')}
                    >
                      <Text style={[
                        styles.tagText,
                        { color: isSelected ? colors.background : colors.text }
                      ]}>
                        {trait}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>🎯 Expertise</Text>
              <View style={styles.tagGrid}>
                {EXPERTISE_AREAS.map((area) => {
                  const isSelected = coachData.expertise.includes(area);
                  return (
                    <TouchableOpacity
                      key={area}
                      style={[
                        styles.tag,
                        { 
                          backgroundColor: isSelected ? coachData.color : colors.background,
                          borderColor: isSelected ? coachData.color : colors.border,
                        }
                      ]}
                      onPress={() => toggleSelection(coachData.expertise, area, 'expertise')}
                    >
                      <Text style={[
                        styles.tagText,
                        { color: isSelected ? colors.background : colors.text }
                      ]}>
                        {area}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>⚙️ Advanced Configuration</Text>
              
              <Text style={[styles.label, { color: colors.text }]}>YouTube Channel URL (Required)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="https://www.youtube.com/@channelname"
                placeholderTextColor={colors.textTertiary}
                value={coachData.youtubeChannelUrl}
                onChangeText={(text) => setCoachData(prev => ({ ...prev, youtubeChannelUrl: text }))}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={[styles.helperText, { color: colors.textTertiary }]}>
                Your coach will learn from this channel's content (up to 50 videos)
              </Text>

              <Text style={[styles.label, { color: colors.text }]}>Coach Background & Expertise</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Describe your coach's background, credentials, and unique approach to helping people..."
                placeholderTextColor={colors.textTertiary}
                value={coachData.background}
                onChangeText={(text) => setCoachData(prev => ({ ...prev, background: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={[styles.label, { color: colors.text }]}>Communication Style</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="How should your coach communicate? (e.g., asks thought-provoking questions, provides actionable frameworks, uses real-world examples...)"
                placeholderTextColor={colors.textTertiary}
                value={coachData.conversationStyle}
                onChangeText={(text) => setCoachData(prev => ({ ...prev, conversationStyle: text }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  createButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  createButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  content: { flex: 1 },
  previewCard: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imagePreview: { height: 120, alignItems: 'center', justifyContent: 'center' },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', gap: 8 },
  uploadText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  previewContent: { padding: 16 },
  previewName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  previewTagline: { fontSize: 14, marginBottom: 12 },
  previewTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  previewTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  previewTagText: { fontSize: 12, fontWeight: '500' },
  form: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginBottom: 24, padding: 20, borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 8, marginTop: 8 },
  helperText: { fontSize: 12, marginTop: -8, marginBottom: 12 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorOption: { width: 40, height: 40, borderRadius: 20 },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  tagText: { fontSize: 14, fontWeight: '500' },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 100,
  },
});
