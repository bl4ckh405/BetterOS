import { supabase } from './supabase';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export async function fixCoachAvatar(coachId: string, coachName: string) {
  try {
    // Let user pick new image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return false;

    const imageUri = result.assets[0].uri;
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    // Upload to Supabase Storage with user folder
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    const fileExt = imageUri.split('.').pop() || 'jpg';
    const fileName = `${user.id}/${coachId}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('coach-avatars')
      .upload(fileName, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('coach-avatars')
      .getPublicUrl(fileName);
    
    // Update coach
    const { error: updateError } = await supabase
      .from('coaches')
      .update({ avatar_url: publicUrl })
      .eq('id', coachId);

    if (updateError) throw updateError;

    Alert.alert('Success', `${coachName}'s avatar updated!`);
    return true;
  } catch (error: any) {
    console.error('Error fixing avatar:', error);
    Alert.alert('Error', error.message || 'Failed to update avatar');
    return false;
  }
}
