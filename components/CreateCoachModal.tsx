import { IconSymbol } from '@/components/ui/icon-symbol';
import { useCoaches } from '@/contexts/CoachContext';
import { useTheme } from '@/hooks/use-theme';
import { authService } from '@/services/auth';
import { supabase } from '@/services/supabase';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const PERSONALITY_TRAITS = [
  { label: 'Supportive', icon: '🤝' },
  { label: 'Direct', icon: '🎯' },
  { label: 'Analytical', icon: '🔬' },
  { label: 'Creative', icon: '🎨' },
  { label: 'Empathetic', icon: '💛' },
  { label: 'Motivational', icon: '🔥' },
  { label: 'Calm', icon: '🧘' },
  { label: 'Energetic', icon: '⚡' },
  { label: 'Wise', icon: '🦉' },
  { label: 'Playful', icon: '🎮' },
];

const EXPERTISE_AREAS = [
  { label: 'Life Coaching', icon: '🌟' },
  { label: 'Business Strategy', icon: '📊' },
  { label: 'Health & Wellness', icon: '💪' },
  { label: 'Relationships', icon: '💕' },
  { label: 'Career Development', icon: '🚀' },
  { label: 'Productivity', icon: '⏰' },
  { label: 'Mental Health', icon: '🧠' },
  { label: 'Finance', icon: '💰' },
  { label: 'Creative Arts', icon: '🎭' },
  { label: 'Leadership', icon: '👑' },
  { label: 'Mindfulness', icon: '🙏' },
  { label: 'Education', icon: '📚' },
];

const COACH_COLORS = [
  { color: '#FF6B35', name: 'Ember' },
  { color: '#4A90E2', name: 'Ocean' },
  { color: '#7B68EE', name: 'Violet' },
  { color: '#34C759', name: 'Mint' },
  { color: '#FF3B30', name: 'Flame' },
  { color: '#FF9500', name: 'Amber' },
  { color: '#5856D6', name: 'Indigo' },
  { color: '#32D74B', name: 'Emerald' },
];

const STEPS = [
  { title: 'Identity', subtitle: 'Name & appearance' },
  { title: 'Personality', subtitle: 'Traits & expertise' },
  { title: 'Knowledge', subtitle: 'Sources & content' },
  { title: 'Publish', subtitle: 'Visibility & launch' },
];

interface PDFFile {
  uri: string;
  name: string;
  size?: number;
}

interface CreateCoachModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateCoachModal({ visible, onClose }: CreateCoachModalProps) {
  const { colors } = useTheme();
  const { refreshCoaches } = useCoaches();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const [coachData, setCoachData] = useState({
    name: '',
    tagline: '',
    personality: [] as string[],
    expertise: [] as string[],
    background: '',
    conversationStyle: '',
    color: COACH_COLORS[0].color,
    image: null as string | null,
    youtubeChannelUrl: '',
    isPublic: false,
    pdfFiles: [] as PDFFile[],
  });

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoachData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const handlePDFPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newPDFs: PDFFile[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
        }));
        setCoachData(prev => ({
          ...prev,
          pdfFiles: [...prev.pdfFiles, ...newPDFs],
        }));
      }
    } catch (error) {
      console.error('Error picking PDF:', error);
      Alert.alert('Error', 'Failed to select PDF file.');
    }
  };

  const removePDF = (index: number) => {
    setCoachData(prev => ({
      ...prev,
      pdfFiles: prev.pdfFiles.filter((_, i) => i !== index),
    }));
  };

  const toggleSelection = (array: string[], item: string, key: string) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    setCoachData(prev => ({ ...prev, [key]: newArray }));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return coachData.name.trim().length > 0;
      case 1: return coachData.personality.length > 0 || coachData.expertise.length > 0;
      case 2: return coachData.youtubeChannelUrl.trim().length > 0 || coachData.pdfFiles.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const userId = authService.getUserId();
      let avatarUrl = coachData.image;

      // Upload avatar image to Supabase Storage
      if (coachData.image && coachData.image.startsWith('file://')) {
        console.log('💾 Uploading avatar...');
        const response = await fetch(coachData.image);
        const arrayBuffer = await response.arrayBuffer();
        const fileExt = coachData.image.split('.').pop() || 'jpg';
        const fileName = `${userId}/${coachData.name.replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('coach-avatars')
          .upload(fileName, arrayBuffer, {
            contentType: `image/${fileExt}`,
            upsert: true,
          });

        if (uploadError) {
          console.error('❌ Avatar upload error:', uploadError);
          throw new Error('Failed to upload avatar');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('coach-avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      // Upload PDFs to Supabase Storage and collect URLs
      const pdfUrls: { url: string; filename: string }[] = [];
      for (const pdf of coachData.pdfFiles) {
        console.log(`📄 Uploading PDF: ${pdf.name}`);
        const response = await fetch(pdf.uri);
        const arrayBuffer = await response.arrayBuffer();
        const fileName = `${userId}/${coachData.name.replace(/\s+/g, '-')}/${Date.now()}-${pdf.name}`;

        const { error: pdfError } = await supabase.storage
          .from('coach-pdfs')
          .upload(fileName, arrayBuffer, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (pdfError) {
          console.error(`❌ PDF upload error for ${pdf.name}:`, pdfError);
          continue; // Skip this PDF but continue with others
        }

        const { data: { publicUrl } } = supabase.storage
          .from('coach-pdfs')
          .getPublicUrl(fileName);

        pdfUrls.push({ url: publicUrl, filename: pdf.name });
      }

      // Create coach via backend
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
          image: avatarUrl,
          youtubeChannelUrl: coachData.youtubeChannelUrl || undefined,
          pdfUrls: pdfUrls.length > 0 ? pdfUrls : undefined,
          isPublic: coachData.isPublic,
          userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create coach');
      }

      Alert.alert(
        '🎉 Coach Created!',
        `${coachData.name} is being set up. Knowledge base is building in the background.`,
        [{
          text: 'Awesome',
          onPress: () => {
            resetForm();
            refreshCoaches();
            onClose();
          },
        }],
      );
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'Failed to create coach.');
    } finally {
      setIsCreating(false);
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
      color: COACH_COLORS[0].color,
      image: null as string | null,
      youtubeChannelUrl: '',
      isPublic: false,
      pdfFiles: [],
    });
    setCurrentStep(0);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // ─── Step Progress Bar ───────────────────────────────────

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <TouchableOpacity
            key={index}
            style={styles.progressStep}
            onPress={() => index <= currentStep && goToStep(index)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.progressDot,
              isCompleted && { backgroundColor: '#34C759' },
              isActive && { backgroundColor: '#007AFF', transform: [{ scale: 1.2 }] },
              !isActive && !isCompleted && { backgroundColor: colors.border },
            ]}>
              {isCompleted ? (
                <Text style={styles.progressCheckmark}>✓</Text>
              ) : (
                <Text style={[styles.progressNumber, isActive && { color: '#fff' }]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[
              styles.progressLabel,
              { color: isActive ? colors.text : colors.textTertiary },
              isActive && { fontWeight: '600' },
            ]}>
              {step.title}
            </Text>
            {index < STEPS.length - 1 && (
              <View style={[
                styles.progressLine,
                { backgroundColor: isCompleted ? '#34C759' : colors.border },
              ]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ─── Step 1: Identity ─────────────────────────────────────

  const renderIdentityStep = () => (
    <View style={styles.stepContent}>
      {/* Live Preview Card */}
      <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.avatarContainer, { backgroundColor: coachData.color }]}
          onPress={handleImageUpload}
          activeOpacity={0.8}
        >
          {coachData.image ? (
            <Image source={{ uri: coachData.image }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <IconSymbol name="camera" size={28} color="rgba(255,255,255,0.9)" />
              <Text style={styles.avatarHint}>Tap to add photo</Text>
            </View>
          )}
          <View style={styles.avatarBadge}>
            <IconSymbol name="pencil" size={12} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.previewInfo}>
          <Text style={[styles.previewName, { color: colors.text }]}>
            {coachData.name || 'Your AI Coach'}
          </Text>
          <Text style={[styles.previewTagline, { color: colors.textSecondary }]}>
            {coachData.tagline || 'Give your coach a compelling tagline...'}
          </Text>
        </View>
      </View>

      {/* Name Input */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Coach Name</Text>
        <TextInput
          style={[styles.premiumInput, {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: coachData.name ? coachData.color : colors.border,
          }]}
          placeholder="e.g. The Strategist"
          placeholderTextColor={colors.textTertiary}
          value={coachData.name}
          onChangeText={(text) => setCoachData(prev => ({ ...prev, name: text }))}
        />
      </View>

      {/* Tagline Input */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Tagline</Text>
        <TextInput
          style={[styles.premiumInput, {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: coachData.tagline ? coachData.color : colors.border,
          }]}
          placeholder="e.g. Ruthless clarity for your biggest decisions"
          placeholderTextColor={colors.textTertiary}
          value={coachData.tagline}
          onChangeText={(text) => setCoachData(prev => ({ ...prev, tagline: text }))}
        />
      </View>

      {/* Color Theme */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Color Theme</Text>
        <View style={styles.colorRow}>
          {COACH_COLORS.map((c) => (
            <TouchableOpacity
              key={c.color}
              style={[
                styles.colorCircle,
                { backgroundColor: c.color },
                coachData.color === c.color && styles.colorCircleSelected,
              ]}
              onPress={() => setCoachData(prev => ({ ...prev, color: c.color }))}
              activeOpacity={0.7}
            >
              {coachData.color === c.color && (
                <IconSymbol name="checkmark" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // ─── Step 2: Personality ──────────────────────────────────

  const renderPersonalityStep = () => (
    <View style={styles.stepContent}>
      {/* Personality Traits */}
      <View style={styles.chipSection}>
        <Text style={[styles.chipSectionTitle, { color: colors.text }]}>
          🎭  Personality Traits
        </Text>
        <Text style={[styles.chipSectionHint, { color: colors.textTertiary }]}>
          Select traits that define your coach's character
        </Text>
        <View style={styles.chipGrid}>
          {PERSONALITY_TRAITS.map(({ label, icon }) => {
            const isSelected = coachData.personality.includes(label);
            return (
              <TouchableOpacity
                key={label}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? coachData.color : colors.surface,
                    borderColor: isSelected ? coachData.color : colors.border,
                  },
                ]}
                onPress={() => toggleSelection(coachData.personality, label, 'personality')}
                activeOpacity={0.7}
              >
                <Text style={styles.chipIcon}>{icon}</Text>
                <Text style={[
                  styles.chipLabel,
                  { color: isSelected ? '#fff' : colors.text },
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Expertise Areas */}
      <View style={[styles.chipSection, { marginTop: 28 }]}>
        <Text style={[styles.chipSectionTitle, { color: colors.text }]}>
          🎯  Areas of Expertise
        </Text>
        <Text style={[styles.chipSectionHint, { color: colors.textTertiary }]}>
          What does your coach specialize in?
        </Text>
        <View style={styles.chipGrid}>
          {EXPERTISE_AREAS.map(({ label, icon }) => {
            const isSelected = coachData.expertise.includes(label);
            return (
              <TouchableOpacity
                key={label}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? coachData.color : colors.surface,
                    borderColor: isSelected ? coachData.color : colors.border,
                  },
                ]}
                onPress={() => toggleSelection(coachData.expertise, label, 'expertise')}
                activeOpacity={0.7}
              >
                <Text style={styles.chipIcon}>{icon}</Text>
                <Text style={[
                  styles.chipLabel,
                  { color: isSelected ? '#fff' : colors.text },
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Advanced Text Inputs */}
      <View style={[styles.inputGroup, { marginTop: 28 }]}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Coach Background</Text>
        <Text style={[styles.inputHint, { color: colors.textTertiary }]}>
          Describe credentials, experience, and approach
        </Text>
        <TextInput
          style={[styles.premiumTextArea, {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border,
          }]}
          placeholder="e.g. 20+ years helping CEOs make strategic decisions..."
          placeholderTextColor={colors.textTertiary}
          value={coachData.background}
          onChangeText={(text) => setCoachData(prev => ({ ...prev, background: text }))}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Communication Style</Text>
        <TextInput
          style={[styles.premiumTextArea, {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border,
          }]}
          placeholder="e.g. Asks tough questions, provides frameworks..."
          placeholderTextColor={colors.textTertiary}
          value={coachData.conversationStyle}
          onChangeText={(text) => setCoachData(prev => ({ ...prev, conversationStyle: text }))}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  // ─── Step 3: Knowledge Sources ────────────────────────────

  const renderKnowledgeStep = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        📚  Knowledge Sources
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textTertiary }]}>
        Feed your coach with knowledge. Add YouTube channels, PDFs, or both.
      </Text>

      {/* YouTube Source Card */}
      <View style={[styles.sourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sourceCardHeader}>
          <View style={[styles.sourceIconBg, { backgroundColor: '#FF000015' }]}>
            <Text style={styles.sourceIcon}>▶️</Text>
          </View>
          <View style={styles.sourceHeaderText}>
            <Text style={[styles.sourceTitle, { color: colors.text }]}>YouTube Channel</Text>
            <Text style={[styles.sourceHint, { color: colors.textTertiary }]}>
              Learn from up to 50 long-form videos
            </Text>
          </View>
        </View>

        <TextInput
          style={[styles.sourceInput, {
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: coachData.youtubeChannelUrl ? coachData.color : colors.border,
          }]}
          placeholder="https://www.youtube.com/@channelname"
          placeholderTextColor={colors.textTertiary}
          value={coachData.youtubeChannelUrl}
          onChangeText={(text) => setCoachData(prev => ({ ...prev, youtubeChannelUrl: text }))}
          autoCapitalize="none"
          keyboardType="url"
        />
      </View>

      {/* PDF Source Card */}
      <View style={[styles.sourceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sourceCardHeader}>
          <View style={[styles.sourceIconBg, { backgroundColor: '#007AFF15' }]}>
            <Text style={styles.sourceIcon}>📄</Text>
          </View>
          <View style={styles.sourceHeaderText}>
            <Text style={[styles.sourceTitle, { color: colors.text }]}>PDF Documents</Text>
            <Text style={[styles.sourceHint, { color: colors.textTertiary }]}>
              Upload books, guides, notes, or any PDF
            </Text>
          </View>
        </View>

        {/* Uploaded PDFs List */}
        {coachData.pdfFiles.length > 0 && (
          <View style={styles.pdfList}>
            {coachData.pdfFiles.map((pdf, index) => (
              <View key={index} style={[styles.pdfItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={[styles.pdfIconContainer, { backgroundColor: coachData.color + '15' }]}>
                  <Text style={{ fontSize: 18 }}>📄</Text>
                </View>
                <View style={styles.pdfInfo}>
                  <Text style={[styles.pdfName, { color: colors.text }]} numberOfLines={1}>
                    {pdf.name}
                  </Text>
                  {pdf.size && (
                    <Text style={[styles.pdfSize, { color: colors.textTertiary }]}>
                      {formatFileSize(pdf.size)}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.pdfRemove, { backgroundColor: '#FF3B3015' }]}
                  onPress={() => removePDF(index)}
                >
                  <IconSymbol name="xmark" size={14} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadButton, { borderColor: coachData.color, backgroundColor: coachData.color + '08' }]}
          onPress={handlePDFPick}
          activeOpacity={0.7}
        >
          <IconSymbol name="plus" size={18} color={coachData.color} />
          <Text style={[styles.uploadButtonText, { color: coachData.color }]}>
            {coachData.pdfFiles.length > 0 ? 'Add More PDFs' : 'Select PDF Files'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Knowledge requirement hint */}
      {!coachData.youtubeChannelUrl && coachData.pdfFiles.length === 0 && (
        <View style={[styles.hintBanner, { backgroundColor: '#FF950015' }]}>
          <Text style={{ fontSize: 16 }}>💡</Text>
          <Text style={[styles.hintText, { color: '#FF9500' }]}>
            Add at least one knowledge source — YouTube or PDF
          </Text>
        </View>
      )}
    </View>
  );

  // ─── Step 4: Publish ──────────────────────────────────────

  const renderPublishStep = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        🚀  Ready to Launch
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textTertiary }]}>
        Review your coach and choose visibility settings
      </Text>

      {/* Final Preview */}
      <View style={[styles.finalPreviewCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.finalPreviewBanner, { backgroundColor: coachData.color }]}>
          {coachData.image ? (
            <Image source={{ uri: coachData.image }} style={styles.finalAvatar} />
          ) : (
            <View style={styles.finalAvatarPlaceholder}>
              <Text style={{ fontSize: 36 }}>
                {coachData.name ? coachData.name[0].toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.finalPreviewBody}>
          <Text style={[styles.finalName, { color: colors.text }]}>
            {coachData.name || 'Your Coach'}
          </Text>
          <Text style={[styles.finalTagline, { color: colors.textSecondary }]}>
            {coachData.tagline || 'No tagline set'}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statBadge, { backgroundColor: coachData.color + '15' }]}>
              <Text style={[styles.statText, { color: coachData.color }]}>
                {coachData.personality.length} traits
              </Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: coachData.color + '15' }]}>
              <Text style={[styles.statText, { color: coachData.color }]}>
                {coachData.expertise.length} areas
              </Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: coachData.color + '15' }]}>
              <Text style={[styles.statText, { color: coachData.color }]}>
                {(coachData.youtubeChannelUrl ? 1 : 0) + coachData.pdfFiles.length} sources
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Visibility Toggle */}
      <View style={[styles.visibilityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.visibilityHeader}>
          <View style={[styles.visibilityIconBg, {
            backgroundColor: coachData.isPublic ? '#34C75915' : '#8E8E9315',
          }]}>
            <Text style={{ fontSize: 20 }}>
              {coachData.isPublic ? '🌍' : '🔒'}
            </Text>
          </View>
          <View style={styles.visibilityText}>
            <Text style={[styles.visibilityTitle, { color: colors.text }]}>
              {coachData.isPublic ? 'Public Coach' : 'Private Coach'}
            </Text>
            <Text style={[styles.visibilityHint, { color: colors.textTertiary }]}>
              {coachData.isPublic
                ? 'Everyone can find and use this coach in the marketplace'
                : 'Only you can see and use this coach'}
            </Text>
          </View>
        </View>
        <Switch
          value={coachData.isPublic}
          onValueChange={(val) => setCoachData(prev => ({ ...prev, isPublic: val }))}
          trackColor={{ false: colors.border, true: coachData.color + '80' }}
          thumbColor={coachData.isPublic ? coachData.color : '#f4f3f4'}
        />
      </View>
    </View>
  );

  // ─── Main Render ──────────────────────────────────────────

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderIdentityStep();
      case 1: return renderPersonalityStep();
      case 2: return renderKnowledgeStep();
      case 3: return renderPublishStep();
      default: return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.surface }]}>
              <IconSymbol name="xmark" size={18} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {currentStep === 3 ? 'Review & Launch' : 'Create Coach'}
            </Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Step Content */}
          <ScrollView
            ref={scrollRef}
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
          >
            {renderCurrentStep()}
          </ScrollView>

          {/* Bottom Navigation */}
          <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            {currentStep > 0 ? (
              <TouchableOpacity
                style={[styles.backButton, { borderColor: colors.border }]}
                onPress={() => goToStep(currentStep - 1)}
              >
                <IconSymbol name="chevron.left" size={16} color={colors.text} />
                <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 100 }} />
            )}

            {currentStep < STEPS.length - 1 ? (
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: canProceed() ? coachData.color : colors.border,
                    opacity: canProceed() ? 1 : 0.5,
                  },
                ]}
                onPress={() => canProceed() && goToStep(currentStep + 1)}
                disabled={!canProceed()}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <IconSymbol name="chevron.right" size={16} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.createFinalButton, { backgroundColor: coachData.color }]}
                onPress={handleCreate}
                disabled={isCreating}
                activeOpacity={0.8}
              >
                {isCreating ? (
                  <Text style={styles.createFinalText}>Creating...</Text>
                ) : (
                  <>
                    <Text style={styles.createFinalText}>Launch Coach</Text>
                    <Text style={{ fontSize: 18 }}>🚀</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  scrollContent: {
    flex: 1,
  },

  // ─── Progress ──────────────────────────────────────────────
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 0,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  progressCheckmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  progressNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  progressLine: {
    position: 'absolute',
    top: 14,
    left: '60%',
    right: '-60%',
    height: 2,
    borderRadius: 1,
  },

  // ─── Step Content ──────────────────────────────────────────
  stepContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 24,
  },

  // ─── Preview Card ──────────────────────────────────────────
  previewCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  avatarContainer: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  avatarHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    padding: 20,
  },
  previewName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  previewTagline: {
    fontSize: 15,
    lineHeight: 20,
  },

  // ─── Input Groups ──────────────────────────────────────────
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  inputHint: {
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  premiumInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  premiumTextArea: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    letterSpacing: -0.2,
    minHeight: 100,
  },

  // ─── Colors ────────────────────────────────────────────────
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  // ─── Chips ─────────────────────────────────────────────────
  chipSection: {
    marginBottom: 0,
  },
  chipSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  chipSectionHint: {
    fontSize: 13,
    marginBottom: 14,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
  },

  // ─── Source Cards ──────────────────────────────────────────
  sourceCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  sourceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  sourceIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceIcon: {
    fontSize: 22,
  },
  sourceHeaderText: {
    flex: 1,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sourceHint: {
    fontSize: 13,
  },
  sourceInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },

  // ─── PDF List ──────────────────────────────────────────────
  pdfList: {
    gap: 8,
    marginBottom: 14,
  },
  pdfItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  pdfIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfInfo: {
    flex: 1,
  },
  pdfName: {
    fontSize: 14,
    fontWeight: '500',
  },
  pdfSize: {
    fontSize: 12,
    marginTop: 2,
  },
  pdfRemove: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Upload Button ─────────────────────────────────────────
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // ─── Hint Banner ───────────────────────────────────────────
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },

  // ─── Final Preview ─────────────────────────────────────────
  finalPreviewCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  finalPreviewBanner: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  finalAvatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  finalPreviewBody: {
    padding: 20,
    alignItems: 'center',
  },
  finalName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  finalTagline: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ─── Visibility ────────────────────────────────────────────
  visibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  visibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  visibilityIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visibilityText: {
    flex: 1,
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  visibilityHint: {
    fontSize: 13,
    lineHeight: 18,
  },

  // ─── Bottom Bar ────────────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  createFinalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  createFinalText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
