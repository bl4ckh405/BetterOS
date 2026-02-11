import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { IconSymbol } from './ui/icon-symbol';
import { revenueCatService } from '@/services/revenuecat';
import { Platform } from 'react-native';

export default function CustomerCenter() {
  const { colors } = useTheme();
  const { isProUser, customerInfo, refreshSubscription } = useSubscription();

  const handleManageSubscription = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('https://apps.apple.com/account/subscriptions');
      } else {
        await Linking.openURL('https://play.google.com/store/account/subscriptions');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open subscription management');
    }
  };

  const handleRestorePurchases = async () => {
    try {
      await revenueCatService.restorePurchases();
      await refreshSubscription();
      Alert.alert('Success', 'Purchases restored successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases');
    }
  };

  const getSubscriptionStatus = () => {
    if (!customerInfo) return 'Loading...';
    if (isProUser) {
      const entitlement = customerInfo.entitlements.active['BetterOS Pro'];
      if (entitlement) {
        const expirationDate = entitlement.expirationDate;
        if (expirationDate) {
          return `Active until ${new Date(expirationDate).toLocaleDateString()}`;
        }
        return 'Active';
      }
    }
    return 'Free Plan';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Subscription</Text>
        
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.statusRow}>
            <View>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                Current Plan
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {isProUser ? 'BetterOS Pro' : 'Free'}
              </Text>
            </View>
            {isProUser && (
              <View style={[styles.badge, { backgroundColor: '#007AFF' }]}>
                <IconSymbol name="checkmark" size={16} color="white" />
              </View>
            )}
          </View>
          
          <Text style={[styles.statusSubtext, { color: colors.textSecondary }]}>
            {getSubscriptionStatus()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Manage</Text>
        
        {isProUser && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={handleManageSubscription}
          >
            <IconSymbol name="gear" size={20} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Manage Subscription
            </Text>
            <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={handleRestorePurchases}
        >
          <IconSymbol name="arrow.clockwise" size={20} color={colors.text} />
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            Restore Purchases
          </Text>
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {isProUser && customerInfo && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
          
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Customer ID
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
                {customerInfo.originalAppUserId}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Linking.openURL('https://www.revenuecat.com/terms')}
        >
          <Text style={[styles.linkText, { color: colors.textSecondary }]}>
            Terms of Service
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Linking.openURL('https://www.revenuecat.com/privacy')}
        >
          <Text style={[styles.linkText, { color: colors.textSecondary }]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    padding: 20,
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '600',
  },
  statusSubtext: {
    fontSize: 14,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
  },
  linkButton: {
    padding: 12,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
  },
});
