import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import CreateCoachModal from '@/components/CreateCoachModal';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSubscriptionGate } from '@/components/SubscriptionGate';

export default function CreateScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isProUser, checkAccess, PaywallComponent } = useSubscriptionGate();
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      // Check access first
      if (!checkAccess()) {
        // User doesn't have access, paywall will show
        // Don't show modal
        return;
      }
      
      // User has access, show modal
      setModalVisible(true);
    }, [isProUser])
  );

  const handleCloseModal = () => {
    setModalVisible(false);
    // Check if we can go back, otherwise go to home
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };
  
  const handlePaywallClose = () => {
    // When paywall closes, navigate back
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CreateCoachModal 
        visible={modalVisible} 
        onClose={handleCloseModal} 
      />
      <PaywallComponent onClose={handlePaywallClose} />
    </View>
  );
}