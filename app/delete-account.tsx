import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/hooks/use-theme';
import { authService } from '@/services/auth';
import { databaseService } from '@/services/database';
import { Stack, router } from 'expo-router';
import * as Updates from 'expo-updates';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeleteAccountScreen() {
  const { colors } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone. All your data, including:\n\n• Your profile and settings\n• All coaches and conversations\n• Goals, tasks, and habits\n• Chat history\n\nWill be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const userId = await authService.getUserId();
      
      // Delete all user data from Supabase
      await databaseService.supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      await databaseService.supabase
        .from('coaches')
        .delete()
        .eq('user_id', userId);

      await databaseService.supabase
        .from('goals')
        .delete()
        .eq('user_id', userId);

      await databaseService.supabase
        .from('habits')
        .delete()
        .eq('user_id', userId);

      await databaseService.supabase
        .from('tasks')
        .delete()
        .eq('user_id', userId);

      // Sign out the user
      await authService.clearUser();
      
      // Reload the app to restart with fresh state
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Delete Account</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={[styles.warningIcon, { backgroundColor: '#FF3B30' + '20' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#FF3B30" />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Permanently Delete Account
        </Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          This action is irreversible. Once you delete your account, all your data will be permanently removed from our servers.
        </Text>

        <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>What will be deleted:</Text>
          <View style={styles.infoItem}>
            <IconSymbol name="checkmark.circle.fill" size={16} color="#FF3B30" />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Your profile and personal information
            </Text>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="checkmark.circle.fill" size={16} color="#FF3B30" />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              All AI coaches and conversations
            </Text>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="checkmark.circle.fill" size={16} color="#FF3B30" />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Goals, tasks, and habits
            </Text>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="checkmark.circle.fill" size={16} color="#FF3B30" />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Chat history and messages
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, { opacity: isDeleting ? 0.5 : 1 }]}
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete My Account Forever</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
          disabled={isDeleting}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  placeholder: { width: 32 },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  warningIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  infoBox: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    width: '100%',
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
