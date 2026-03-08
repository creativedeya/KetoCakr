import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

export async function pickImage(source: 'camera' | 'gallery'): Promise<string | null> {
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return null;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return null;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
  }
}

export async function uploadRecipeImage(uri: string, recipeId: string): Promise<string | null> {
  try {
    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${recipeId}_${Date.now()}.${fileExt}`;
    const filePath = `recipes/${fileName}`;

    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      name: fileName,
      type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
    } as any);

    const { error } = await supabase.storage
      .from('user-recipe-images')
      .upload(filePath, formData, {
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('user-recipe-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  }
}

export async function updateRecipeImage(recipeId: string, imageUrl: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_recipes')
    .update({ user_image_url: imageUrl })
    .eq('id', recipeId);
  return !error;
}
