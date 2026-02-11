import { ChatInterface } from "@/components/ChatInterface";
import CreateCoachModal from "@/components/CreateCoachModal";
import { OnboardingInterview } from "@/components/OnboardingInterview";
import { useSubscriptionGate } from "@/components/SubscriptionGate";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCoaches } from "@/contexts/CoachContext";
import { useOrbit } from "@/contexts/OrbitContext";
import { useTheme } from "@/hooks/use-theme";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CATEGORIES = [
  "For You",
  "Productivity",
  "Wellness",
  "Creative",
  "Business",
  "Health",
  "Finance",
  "Learning",
  "Relationships",
];

export default function HomeScreen() {
  const { isOnboarded, loading } = useOrbit();
  const { coaches, loading: coachesLoading } = useCoaches();
  const { colors } = useTheme();
  const { checkAccess, PaywallComponent, isProUser } = useSubscriptionGate();
  const [selectedCategory, setSelectedCategory] = useState("For You");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<any>(null);
  const [filteredCoaches, setFilteredCoaches] = useState<any[]>([]);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    filterCoaches();
  }, [coaches, selectedCategory]);

  const filterCoaches = () => {
    if (selectedCategory === "For You") {
      setFilteredCoaches(coaches);
    } else {
      const filtered = coaches.filter(
        (coach) =>
          coach.expertise?.includes(selectedCategory) ||
          coach.personality?.includes(selectedCategory) ||
          coach.tagline?.toLowerCase().includes(selectedCategory.toLowerCase()),
      );
      setFilteredCoaches(filtered);
    }
  };

  if (loading || coachesLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={[{ color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  if (!isOnboarded && !loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <OnboardingInterview />
      </View>
    );
  }

  if (selectedCoach) {
    return (
      <>
        <ChatInterface
          coachId={selectedCoach.id}
          coachName={selectedCoach.name}
          coachColor={selectedCoach.color}
          onBack={() => setSelectedCoach(null)}
        />
        <PaywallComponent />
      </>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.logo, { color: colors.text }]}>BetterOS</Text>
          {!isProUser && (
            <TouchableOpacity
              style={[styles.getButton, { backgroundColor: "#007AFF" }]}
              onPress={() => setShowPaywall(true)}
            >
              <Text style={styles.getButtonText}>Get Pro</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: "#007AFF" }]}
            onPress={() => {
              if (checkAccess()) {
                setShowCreateModal(true);
              }
            }}
          >
            <IconSymbol name="plus" size={16} color="white" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <IconSymbol name="gear" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
        contentContainerStyle={styles.categoryTabs}
      >
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                isActive
                  ? [
                      styles.activeTab,
                      {
                        backgroundColor: colors.background,
                        borderColor: "#007AFF",
                      },
                    ]
                  : styles.inactiveTab,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  isActive
                    ? [styles.activeTabText, { color: colors.text }]
                    : [styles.inactiveTabText, { color: colors.textSecondary }],
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Coaches Grid */}
      <ScrollView
        style={styles.coachesContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coachesGrid}>
          {filteredCoaches.map((coach) => (
            <TouchableOpacity
              key={coach.id}
              style={[styles.coachCard, { backgroundColor: colors.surface }]}
              onPress={() => {
                if (checkAccess()) {
                  setSelectedCoach(coach);
                }
              }}
            >
              {/* Profile Image */}
              <View
                style={[styles.profileImage, { backgroundColor: coach.color }]}
              >
                {coach.avatar_url ? (
                  <Image
                    source={{ uri: coach.avatar_url }}
                    style={styles.profileImageActual}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <IconSymbol
                      name="person"
                      size={40}
                      color="rgba(255,255,255,0.8)"
                    />
                  </View>
                )}
              </View>

              {/* Coach Info */}
              <View style={styles.coachInfo}>
                <Text
                  style={[styles.coachName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {coach.name}
                </Text>
                <Text
                  style={[
                    styles.coachDescription,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={2}
                >
                  {coach.tagline}
                </Text>

                <View style={styles.messageStats}>
                  <IconSymbol
                    name="message"
                    size={14}
                    color={colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.messageCount,
                      { color: colors.textTertiary },
                    ]}
                  >
                    Start chat
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <CreateCoachModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <PaywallComponent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: "700",
  },
  getButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  getButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  headerIcon: {
    position: "relative",
    padding: 4,
  },
  categoryScrollView: {
    flexGrow: 0,
  },
  categoryTabs: {
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: "row",
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 80,
  },
  activeTab: {
    borderWidth: 1,
  },
  inactiveTab: {
    // No additional styling needed
  },
  categoryTabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    fontWeight: "600",
  },
  inactiveTabText: {
    fontWeight: "400",
  },
  coachesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  coachesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingBottom: 100,
  },
  coachCard: {
    width: "47%",
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 220,
  },
  profileImage: {
    width: "100%",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  coachInfo: {
    padding: 12,
    flex: 1,
  },
  coachName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  coachDescription: {
    fontSize: 13,
    lineHeight: 16,
    marginBottom: 12,
  },
  messageStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: "auto",
  },
  messageCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  profileImageActual: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
  },
});
