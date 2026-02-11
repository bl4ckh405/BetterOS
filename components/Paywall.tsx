import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSubscription } from "@/contexts/SubscriptionContext";
import { revenueCatService } from "@/services/revenuecat";
import { IconSymbol } from "./ui/icon-symbol";
import { useTheme } from "@/hooks/use-theme";

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function Paywall({ visible, onClose, onSuccess }: PaywallProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { refreshSubscription } = useSubscription();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);

  // Calculate the trial end date (3 days from now)
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 3);
  const formattedTrialDate = trialEndDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Check if package has trial
  const hasFreeTrial = (pkg: PurchasesPackage): boolean => {
    return pkg.product.introPrice !== null && pkg.product.introPrice !== undefined;
  };

  const getTrialDays = (pkg: PurchasesPackage): number => {
    // Check if there's an intro price with trial period
    if (pkg.product.introPrice) {
      // RevenueCat typically provides trial info in the product
      // Default to 3 days if we can't determine
      return 3;
    }
    return 0;
  };

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const currentOffering = await revenueCatService.getOfferings();
      setOffering(currentOffering);

      // Default to Yearly if available (High ROI option), otherwise first available
      if (currentOffering?.availablePackages.length) {
        const yearly = currentOffering.availablePackages.find(
          (pkg) =>
            pkg.identifier.toLowerCase().includes("year") ||
            pkg.identifier.toLowerCase().includes("annual"),
        );
        setSelectedPackage(yearly || currentOffering.availablePackages[0]);
      }
    } catch (error) {
      console.error("Failed to load offerings:", error);
      Alert.alert("Error", "Failed to load subscription options");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      setPurchasing(true);
      const customerInfo = await revenueCatService.purchasePackage(
        selectedPackage.identifier,
      );

      if (customerInfo) {
        await refreshSubscription();
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert("Purchase Failed", error.message || "Something went wrong");
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);
      await revenueCatService.restorePurchases();
      await refreshSubscription();
      Alert.alert("Success", "Purchases restored successfully");
      onClose();
    } catch (error) {
      Alert.alert("Restore Failed", "No purchases found to restore");
    } finally {
      setPurchasing(false);
    }
  };

  const getPackageType = (pkg: PurchasesPackage): 'lifetime' | 'annual' | 'monthly' => {
    const id = pkg.identifier.toLowerCase();
    const type = pkg.packageType;
    
    if (id.includes('lifetime') || type === 'LIFETIME') {
      return 'lifetime';
    }
    if (id.includes('year') || id.includes('annual') || type === 'ANNUAL') {
      return 'annual';
    }
    return 'monthly';
  };

  const getPackageName = (pkg: PurchasesPackage): string => {
    const type = getPackageType(pkg);
    switch (type) {
      case 'lifetime':
        return 'Lifetime Plan';
      case 'annual':
        return 'Annual Plan';
      case 'monthly':
      default:
        return 'Monthly Plan';
    }
  };

  const getPackagePeriod = (pkg: PurchasesPackage): string => {
    const type = getPackageType(pkg);
    switch (type) {
      case 'lifetime':
        return 'one-time';
      case 'annual':
        return 'year';
      case 'monthly':
      default:
        return 'month';
    }
  };

  // Colors based on the screenshot
  const paywallColors = {
    background: colors.background,
    cardBg: colors.surface,
    surface: colors.surface,
    primary: colors.primary,
    text: colors.text,
    textSecondary: colors.textSecondary,
    border: colors.border,
    timelineLine: colors.border,
    highlightBadge: colors.primary,
    highlightBadgeText: colors.background,
    accent: {
      creative: colors.primary,
    },
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
    >
      <View style={[styles.container, { backgroundColor: paywallColors.background }]}>
        {/* Header / Close Button */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={20} color={paywallColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Title */}
          <Text style={[styles.title, { color: paywallColors.text }]}>
            Upgrade Your Life{"\n"}Operating System
          </Text>

          {/* Timeline Visual */}
          <View style={styles.timelineContainer}>
            {/* Vertical Line */}
            <View
              style={[
                styles.timelineLine,
                { backgroundColor: paywallColors.timelineLine },
              ]}
            />

            {/* Timeline Gradient Overlay (Optional visual trick to look like the image gradient) */}
            <View
              style={[
                styles.timelineLineActive,
                { backgroundColor: paywallColors.primary },
              ]}
            />

            {/* Step 1: Today */}
            <View style={styles.timelineItem}>
              <View
                style={[styles.iconBubble, { backgroundColor: paywallColors.primary + '30' }]}
              >
                <IconSymbol name="lock.fill" size={16} color={paywallColors.primary} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: paywallColors.text }]}>
                  Today
                </Text>
                <Text
                  style={[styles.timelineDesc, { color: paywallColors.textSecondary }]}
                >
                  Unlock your AI crew: The Boss, The Creative, and The Stoic. Start building your personalized Life OS.
                </Text>
              </View>
            </View>

            {/* Step 2: Day 2 */}
            <View style={styles.timelineItem}>
              <View
                style={[styles.iconBubble, { backgroundColor: paywallColors.primary + '30' }]}
              >
                <IconSymbol name="bell.fill" size={16} color={paywallColors.primary} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: paywallColors.text }]}>
                  Day 2
                </Text>
                <Text
                  style={[styles.timelineDesc, { color: paywallColors.textSecondary }]}
                >
                  We'll send a friendly reminder that your trial is ending soon.
                </Text>
              </View>
            </View>

            {/* Step 3: Day 3 */}
            <View style={styles.timelineItem}>
              <View
                style={[styles.iconBubble, { backgroundColor: paywallColors.primary + '30' }]}
              >
                <IconSymbol name="star.fill" size={16} color={paywallColors.primary} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: paywallColors.text }]}>
                  Day 3
                </Text>
                <Text
                  style={[styles.timelineDesc, { color: paywallColors.textSecondary }]}
                >
                  You'll be charged on {formattedTrialDate}. Cancel anytime
                  before.
                </Text>
              </View>
            </View>
          </View>

          {/* Pricing Options */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color={paywallColors.primary}
              style={{ marginTop: 40 }}
            />
          ) : (
            <View style={styles.packagesContainer}>
              {offering?.availablePackages.map((pkg) => {
                const isSelected =
                  selectedPackage?.identifier === pkg.identifier;
                const isBestValue = getPackageType(pkg) === 'annual';

                return (
                  <TouchableOpacity
                    key={pkg.identifier}
                    activeOpacity={0.9}
                    onPress={() => setSelectedPackage(pkg)}
                    style={[
                      styles.packageCard,
                      {
                        backgroundColor: paywallColors.surface,
                        borderColor: isSelected ? paywallColors.primary : paywallColors.border,
                        borderWidth: isSelected ? 2 : 1,
                        shadowColor: isSelected
                          ? paywallColors.primary
                          : "transparent",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: isSelected ? 0.4 : 0,
                        shadowRadius: 10,
                        elevation: isSelected ? 5 : 0,
                      },
                    ]}
                  >
                    {isBestValue && (
                      <View style={[styles.bestValueBadge, { backgroundColor: paywallColors.accent.creative }]}>
                        <Text style={[styles.bestValueText, { color: paywallColors.background }]}>
                          BEST VALUE
                        </Text>
                      </View>
                    )}

                    <View style={styles.packageContent}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.packageName, { color: colors.text }]}
                        >
                          {getPackageName(pkg)}
                        </Text>
                        <Text
                          style={[
                            styles.packageDetails,
                            { color: paywallColors.textSecondary },
                          ]}
                        >
                          {getPackageType(pkg) === 'lifetime' 
                            ? `${pkg.product.priceString} one-time payment`
                            : hasFreeTrial(pkg)
                              ? `Free for ${getTrialDays(pkg)} days, then ${pkg.product.priceString}/${getPackagePeriod(pkg)}`
                              : `${pkg.product.priceString}/${getPackagePeriod(pkg)}`
                          }
                        </Text>
                      </View>

                      {/* Radio Button Visual */}
                      <View
                        style={[
                          styles.radioButton,
                          {
                            borderColor: isSelected
                              ? paywallColors.primary
                              : paywallColors.textSecondary,
                          },
                        ]}
                      >
                        {isSelected && (
                          <View
                            style={[
                              styles.radioButtonInner,
                              { backgroundColor: paywallColors.primary },
                            ]}
                          />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Footer / CTA Fixed at Bottom */}
        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom + 10,
              backgroundColor: paywallColors.background,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.ctaButton,
              {
                backgroundColor: paywallColors.primary,
                opacity: purchasing ? 0.7 : 1,
              },
            ]}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.ctaText}>
                {selectedPackage && hasFreeTrial(selectedPackage)
                  ? `Start My ${getTrialDays(selectedPackage)}-Day Free Trial`
                  : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRestore}
            style={styles.restoreButton}
          >
            <Text style={[styles.restoreText, { color: paywallColors.textSecondary }]}>
              Restore Purchases
            </Text>
          </TouchableOpacity>

          <Text style={[styles.cancelText, { color: paywallColors.textSecondary }]}>
            Cancel anytime. No risk.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    alignItems: "flex-end",
    marginBottom: 10,
  },
  closeButton: {
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 200, // Increased space for footer
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 34,
  },
  // Timeline Styles
  timelineContainer: {
    marginBottom: 40,
    position: "relative",
    paddingLeft: 10,
  },
  timelineLine: {
    position: "absolute",
    left: 24, // Center of the icon bubble (14 + 10 padding)
    top: 20,
    bottom: 40,
    width: 2,
    borderRadius: 1,
  },
  timelineLineActive: {
    position: "absolute",
    left: 24,
    top: 20,
    height: "40%", // Simulates the gradient fade from top to bottom
    width: 2,
    borderRadius: 1,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 30,
    alignItems: "flex-start",
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    zIndex: 1, // Sit on top of line
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  timelineDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Package Styles
  packagesContainer: {
    gap: 16,
    marginBottom: 20,
  },
  packageCard: {
    padding: 16,
    borderRadius: 16,
    position: "relative",
    marginTop: 10, // Space for badge
  },
  bestValueBadge: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  packageContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  packageName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  packageDetails: {
    fontSize: 13,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // Footer Styles
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "transparent",
  },
  ctaButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 30, // Pill shape like in screenshot
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  restoreButton: {
    alignItems: "center",
    marginBottom: 8,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: "500",
  },
  cancelText: {
    fontSize: 12,
    textAlign: "center",
    opacity: 0.6,
  },
});
