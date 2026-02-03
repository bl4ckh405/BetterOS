import React, { useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import CreateCoachModal from '@/components/CreateCoachModal';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function CreateScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setModalVisible(true);
    }, [])
  );

  const handleCloseModal = () => {
    setModalVisible(false);
    router.push('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CreateCoachModal 
        visible={modalVisible} 
        onClose={handleCloseModal} 
      />
    </View>
  );
}