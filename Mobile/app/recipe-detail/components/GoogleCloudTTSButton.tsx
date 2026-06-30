import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, InterruptionModeAndroid } from 'expo-av';
import { File, Paths } from 'expo-file-system';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';

const ADMIN_API_URL = process.env.EXPO_PUBLIC_ADMIN_API_URL ?? 'https://admin.ketocakelab.com';

interface GoogleCloudTTSButtonProps {
  text: string;
  language: 'bg' | 'en';
  accentColor?: string;
}

export default function GoogleCloudTTSButton({
  text,
  language = 'bg',
  accentColor,
}: GoogleCloudTTSButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });
  }, []);

  // Stop and clean up when step changes
  useEffect(() => {
    stopAndCleanup();
  }, [text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAndCleanup();
    };
  }, []);

  const stopAndCleanup = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch {
        // already unloaded
      }
      setSound(null);
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  const handlePress = async () => {
    if (isPlaying) {
      await stopAndCleanup();
      return;
    }

    if (!text) {
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = ADMIN_API_URL;
      const apiUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
      const fullUrl = `${apiUrl}/api/tts/synthesize`;


      const res = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), language }),
      });


      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const audioData = (data.audio as string).replace('data:audio/mp3;base64,', '');

      const cacheFile = new File(Paths.cache, 'tts_audio.mp3');
      cacheFile.write(audioData, { encoding: 'base64' });

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });

      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: cacheFile.uri },
        { shouldPlay: true }
      );

      setSound(audioSound);
      setIsPlaying(true);

      audioSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          audioSound.unloadAsync().catch(() => {});
          setSound(null);
        }
      });
    } catch (err: any) {
      console.error('[TTS] Full error:', err);
      alert(`TTS Error: ${err?.message ?? 'Unknown error'}`);
      setIsPlaying(false);
      setSound(null);
    } finally {
      setIsLoading(false);
    }
  };

  const btnColor = accentColor ?? Colors.primary.main;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: btnColor }, isPlaying && styles.buttonActive]}
        onPress={handlePress}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.text.inverse} />
        ) : (
          <Ionicons
            name={isPlaying ? 'pause' : 'volume-high-outline'}
            size={18}
            color={Colors.text.inverse}
          />
        )}
        <Text style={styles.buttonText}>
          {isLoading
            ? t('cookingMode.loading')
            : isPlaying
            ? t('cookingMode.stop')
            : t('cookingMode.listenInstructions')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
  },
  button: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  buttonActive: {
    opacity: 0.75,
  },
  buttonText: {
    ...Typography.body2,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
});
