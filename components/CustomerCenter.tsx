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
  const { isProUser, customerInfo, refreshSubscription, showPaywall } = useSubscription();

  const handleManageSubscription = async () => {
    try {
      await revenueCatService.showManageSubscriptions();
    } catch (error) {
      Alert.alert('Error', 'Could not open subscription management');
    }
  };

  const handleRestorePurchases = async () => {
    try {
      await revenueCatService.restorePurchases();
      await refreshSubscription();
      
      // Re-fetch pro status to be sure
      const isPro = await revenueCatService.isProUser();
      if (isPro) {
        Alert.alert('Success', 'Purchases restored successfully');
      } else {
        Alert.alert('Restore Finished', 'No active subscriptions were found for this account.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases. Please try again later.');
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
                {isProUser ? 'BetterOS Pro' : 'Free Plan'}
              </Text>
            </View>
            {isProUser ? (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <IconSymbol name="checkmark" size={16} color="white" />
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: colors.textSecondary + '20' }]}>
                <IconSymbol name="lock.fill" size={16} color={colors.textSecondary} />
              </View>
            )}
          </View>
          
          <Text style={[styles.statusSubtext, { color: colors.textSecondary }]}>
            {getSubscriptionStatus()}
          </Text>

          {!isProUser && (
            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
              onPress={showPaywall}
            >
              <IconSymbol name="sparkles" size={18} color="white" />
              <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Manage</Text>
        
        {isProUser && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
            onPress={handleManageSubscription}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <IconSymbol name="gear" size={20} color={colors.primary} />
            </View>
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
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <IconSymbol name="arrow.clockwise" size={20} color={colors.primary} />
          </View>
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
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
