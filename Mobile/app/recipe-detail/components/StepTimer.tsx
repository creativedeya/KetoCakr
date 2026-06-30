import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';

interface StepTimerProps {
  durationMinutes: number;
}

export function StepTimer({ durationMinutes }: StepTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when durationMinutes changes (step navigation)
  useEffect(() => {
    setTimeLeft(durationMinutes * 60);
    setIsRunning(false);
  }, [durationMinutes]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeLeft === 0) setIsRunning(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isFinished = timeLeft === 0;
  const { t } = useTranslation();

  const handleReset = () => {
    setTimeLeft(durationMinutes * 60);
    setIsRunning(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="timer-outline" size={16} color={Colors.primary.main} />
        <Text style={styles.headerText}>{t('bakingTimer.timer')}</Text>
      </View>

      <Text style={[styles.display, isFinished && styles.displayFinished]}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.playBtn, isRunning && styles.pauseBtn, isFinished && styles.finishedBtn]}
          onPress={() => setIsRunning((r) => !r)}
          disabled={isFinished}
        >
          <Ionicons
            name={isRunning ? 'pause' : 'play'}
            size={18}
            color={Colors.text.inverse}
          />
          <Text style={styles.playBtnText}>
            {isFinished ? t('bakingTimer.done') : isRunning ? t('bakingTimer.pause') : t('bakingTimer.start')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Ionicons name="reload-outline" size={16} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary.opacity[10],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary.opacity[30],
    padding: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  headerText: {
    ...Typography.caption,
    color: Colors.primary.main,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  display: {
    ...Typography.h1,
    color: Colors.primary.main,
    fontVariant: ['tabular-nums'],
    marginBottom: Spacing.md,
  },
  displayFinished: {
    color: Colors.success.main,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  pauseBtn: {
    backgroundColor: Colors.primary.dark,
  },
  finishedBtn: {
    backgroundColor: Colors.success.main,
  },
  playBtnText: {
    ...Typography.body2,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  resetBtn: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.background.primary,
  },
});
