import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as TTS from 'expo-speech';
import { Audio, InterruptionModeAndroid } from 'expo-av';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';

interface VoiceOverButtonProps {
  text: string;
  language: 'bg' | 'en';
  accentColor?: string;
}

export default function VoiceOverButton({ text, language = 'bg', accentColor }: VoiceOverButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });
    return () => {
      TTS.stop();
    };
  }, []);

  // Stop speaking when text changes (step navigation)
  useEffect(() => {
    TTS.stop();
    setIsSpeaking(false);
  }, [text]);

  const handlePlayVoiceOver = async () => {

    try {
      if (isSpeaking) {
        await TTS.stop();
        setIsSpeaking(false);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });

      setIsSpeaking(true);
      TTS.speak(text, {
        language: language === 'bg' ? 'bg-BG' : 'en-US',
        rate: 0.85,
        pitch: 1.0,
        onDone: () => {
          setIsSpeaking(false);
        },
        onError: (err) => {
          console.error('[VoiceOver] Error:', err);
          setIsSpeaking(false);
        },
      });
    } catch (err) {
      console.error('[VoiceOver] Setup error:', err);
      setIsSpeaking(false);
    }
  };

  const btnColor = accentColor ?? Colors.primary.main;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: btnColor }, isSpeaking && styles.buttonActive]}
        onPress={handlePlayVoiceOver}
      >
        <Ionicons
          name={isSpeaking ? 'pause' : 'volume-high-outline'}
          size={18}
          color={Colors.text.inverse}
        />
        <Text style={styles.buttonText}>
          {isSpeaking ? t('cookingMode.stop') : t('cookingMode.listenInstructions')}
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
