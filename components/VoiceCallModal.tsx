import { ElevenLabsProvider, useConversation } from "@elevenlabs/react-native";
import Constants from "expo-constants";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../hooks/use-theme";
import { IconSymbol } from "./ui/icon-symbol";

const { width } = Dimensions.get("window");

interface VoiceCallModalProps {
  visible: boolean;
  onClose: () => void;
  coachName: string;
  coachColor: string;
  coachSystemPrompt: string;
  coachAgentId?: string;
}

// --- Animated Pulse Ring Component ---
const PulseRing = ({
  color,
  isActive,
  delay,
  size,
}: {
  color: string;
  isActive: boolean;
  delay: number;
  size: number;
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Loop the ripple animation
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: 2500,
          delay: delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ).start();
    } else {
      // Stop and reset if not active
      anim.stopAnimation();
      anim.setValue(0);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          backgroundColor: color,
          opacity: anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0.3, 0.1, 0],
          }),
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 2.5],
              }),
            },
          ],
        },
      ]}
    />
  );
};

// --- Listening Animation (Breathing Effect) ---
const ListeningAnimation = ({ color }: { color: string }) => {
  const breatheAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.15,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.listeningRing,
        {
          borderColor: color,
          transform: [{ scale: breatheAnim }],
        },
      ]}
    />
  );
};

// --- Fake Audio Visualizer Bar ---
const AudioBar = ({
  color,
  isSpeaking,
  index,
}: {
  color: string;
  isSpeaking: boolean;
  index: number;
}) => {
  const heightAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    let isMounted = true;
    if (isSpeaking) {
      const animate = () => {
        if (!isMounted) return;
        Animated.sequence([
          Animated.timing(heightAnim, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 150 + Math.random() * 100,
            useNativeDriver: false, // height/scaleY requires false for layout props
            easing: Easing.linear,
          }),
          Animated.timing(heightAnim, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 150 + Math.random() * 100,
            useNativeDriver: false,
            easing: Easing.linear,
          }),
        ]).start(({ finished }) => {
          if (finished && isSpeaking && isMounted) animate();
        });
      };
      animate();
    } else {
      Animated.timing(heightAnim, {
        toValue: 0.2,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    return () => {
      isMounted = false;
    };
  }, [isSpeaking]);

  return (
    <Animated.View
      style={[
        styles.audioBar,
        {
          backgroundColor: color,
          height: 40,
          transform: [{ scaleY: heightAnim }],
        },
      ]}
    />
  );
};

const VoiceCallContent: React.FC<Omit<VoiceCallModalProps, "visible">> = ({
  onClose,
  coachName,
  coachColor,
  coachSystemPrompt,
  coachAgentId,
}) => {
  const { colors } = useTheme();
  const [isStarting, setIsStarting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const conversation = useConversation({
    onConnect: ({ conversationId }) => {
      console.log("✅ Connected:", conversationId);
    },
    onDisconnect: (details) => {
      console.log("❌ Disconnected:", details);
    },
    onError: (message, context) => {
      console.error("❌ Error:", message, context);
    },
    onModeChange: ({ mode }) => {
      console.log("🔊 Mode changed:", mode);
    },
    onMessage: ({ message, source }) => {
      console.log("💬 Message from", source, ":", message);
    },
  });

  const startConversation = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      const agentId =
        coachAgentId ||
        Constants.expoConfig?.extra?.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        console.error("Missing Agent ID");
        return;
      }

      console.log("Starting session with agent:", agentId);
      await conversation.startSession({
        agentId: agentId,
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
      setTimeout(onClose, 300);
    } catch (error) {
      console.error("Failed to end conversation:", error);
      onClose();
    }
  };

  const isConnected = conversation.status === "connected";
  const isConnecting = conversation.status === "connecting";
  const isDisconnected = conversation.status === "disconnected";
  const isListening = isConnected && !conversation.isSpeaking;

  const getStatusText = () => {
    if (isConnecting) return "Connecting...";
    if (conversation.isSpeaking) return "Speaking";
    if (isListening) return "Listening";
    return "Tap to start";
  };

  const getStatusColor = () => {
    if (isConnecting) return colors.textSecondary;
    if (isConnected) return coachColor;
    return colors.textSecondary;
  };

  return (
    <View
      style={[styles.modalContainer, { backgroundColor: colors.background }]}
    >
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.surface }]}
          >
            <IconSymbol name="chevron.down" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.centerStage}>
          <View style={StyleSheet.absoluteFillObject}>
            <View style={styles.centerContainer}>
              <PulseRing
                delay={0}
                color={coachColor}
                isActive={isConnected}
                size={200}
              />
              <PulseRing
                delay={800}
                color={coachColor}
                isActive={isConnected}
                size={200}
              />
              <PulseRing
                delay={1600}
                color={coachColor}
                isActive={isConnected}
                size={200}
              />
            </View>
          </View>

          <View
            style={[
              styles.avatarContainer,
              { borderColor: isConnected ? coachColor : colors.border },
            ]}
          >
            {isConnected && !conversation.isSpeaking && (
              <ListeningAnimation color={coachColor} />
            )}
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: coachColor },
              ]}
            >
              <IconSymbol name="mic.fill" size={40} color="white" />
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={[styles.coachName, { color: colors.text }]}>
              {coachName}
            </Text>
            <View style={styles.statusRow}>
              {isConnected && (
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: coachColor,
                      opacity: conversation.isSpeaking ? 1 : 0.6,
                    },
                  ]}
                />
              )}
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor() },
                ]}
              >
                {getStatusText()}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.visualizerContainer,
              { opacity: isConnected ? 1 : 0 },
            ]}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <AudioBar
                key={i}
                index={i}
                color={coachColor}
                isSpeaking={conversation.isSpeaking}
              />
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          {isDisconnected && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: coachColor }]}
              onPress={startConversation}
              disabled={isStarting}
            >
              {isStarting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <IconSymbol
                    name="phone.fill"
                    size={24}
                    color="white"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.actionButtonText}>
                    Start Conversation
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {(isConnected || isConnecting) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.hangupButton]}
              onPress={endConversation}
            >
              <IconSymbol
                name="phone.down.fill"
                size={24}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.actionButtonText}>End Call</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

export const VoiceCallModal: React.FC<VoiceCallModalProps> = (props) => {
  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={props.onClose}
    >
      <ElevenLabsProvider>
        <VoiceCallContent {...props} />
      </ElevenLabsProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  listeningRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    opacity: 0.4,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "flex-start",
    paddingTop: 10,
  },
  closeButton: {
    padding: 10,
    borderRadius: 25,
  },
  centerStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 1.5,
  },
  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    marginTop: 32,
    alignItems: "center",
    zIndex: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  coachName: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 6,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  visualizerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    marginTop: 40,
    gap: 8,
  },
  audioBar: {
    width: 5,
    borderRadius: 3,
  },
  footer: {
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    width: "100%",
  },
  actionButton: {
    width: "100%",
    height: 64,
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  hangupButton: {
    backgroundColor: "#FF3B30",
  },
  buttonIcon: {
    marginRight: 10,
  },
  actionButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});
