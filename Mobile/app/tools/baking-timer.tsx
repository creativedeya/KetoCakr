// ===========================================================
// Baking Timer — множество паралелни таймера
// ===========================================================
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Vibration,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useTranslation } from '../../constants/i18n';

interface BTimer {
  id: number;
  inputMinutes: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

let nextId = 1;

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function progressColor(ratio: number): string {
  if (ratio > 0.5) return Colors.primary.main;
  if (ratio > 0.2) return '#E07B39';
  return '#C0392B';
}

export default function BakingTimerScreen() {
  const { t } = useTranslation();
  const [timers, setTimers] = useState<BTimer[]>([
    { id: nextId++, inputMinutes: '', totalSeconds: 0, remainingSeconds: 0, isRunning: false },
  ]);

  // Single global tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => prev.map(timer => {
        if (!timer.isRunning || timer.remainingSeconds <= 0) return timer;
        const next = timer.remainingSeconds - 1;
        if (next === 0) {
          Alert.alert(`🔔 ${t('bakingTimer.done')}`, `${t('bakingTimer.timer')} ${timer.id} ${t('bakingTimer.finished')}`);
          try { Vibration.vibrate([400, 200, 400, 200, 400]); } catch (_) {}
          return { ...timer, remainingSeconds: 0, isRunning: false };
        }
        return { ...timer, remainingSeconds: next };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTimer = () => {
    setTimers(prev => [...prev, {
      id: nextId++, inputMinutes: '', totalSeconds: 0, remainingSeconds: 0, isRunning: false,
    }]);
  };

  const removeTimer = (id: number) => {
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  const startTimer = (id: number) => {
    setTimers(prev => prev.map(t => {
      if (t.id !== id) return t;
      // Resume if paused
      if (t.remainingSeconds > 0 && !t.isRunning) {
        return { ...t, isRunning: true };
      }
      // Fresh start
      const mins = parseFloat(t.inputMinutes.replace(',', '.'));
      if (isNaN(mins) || mins <= 0) return t;
      const secs = Math.round(mins * 60);
      return { ...t, totalSeconds: secs, remainingSeconds: secs, isRunning: true };
    }));
  };

  const pauseTimer = (id: number) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, isRunning: false } : t));
  };

  const resetTimer = (id: number) => {
    setTimers(prev => prev.map(t =>
      t.id === id ? { ...t, remainingSeconds: 0, totalSeconds: 0, isRunning: false } : t
    ));
  };

  const updateInput = (id: number, text: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, inputMinutes: text } : t));
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('bakingTimer.title')}</Text>
        <TouchableOpacity onPress={addTimer} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={Colors.primary.main} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {timers.map((timer, idx) => {
          const ratio = timer.totalSeconds > 0
            ? timer.remainingSeconds / timer.totalSeconds
            : 1;
          const isActive = timer.remainingSeconds > 0;
          const color = isActive ? progressColor(ratio) : Colors.primary.main;

          return (
            <View key={timer.id} style={styles.timerCard}>
              {/* Timer label + remove */}
              <View style={styles.timerHeader}>
                <Text style={styles.timerLabel}>{t('bakingTimer.timer')} {idx + 1}</Text>
                {timers.length > 1 && (
                  <TouchableOpacity onPress={() => removeTimer(timer.id)}>
                    <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Countdown display */}
              <Text style={[styles.countdown, { color }]}>
                {isActive ? fmt(timer.remainingSeconds) : '00:00'}
              </Text>

              {/* Input minutes (only when not running) */}
              {!timer.isRunning && !isActive && (
                <View style={styles.inputRow}>
                  <TextInput
                    value={timer.inputMinutes}
                    onChangeText={text => updateInput(timer.id, text)}
                    keyboardType="decimal-pad"
                    placeholder={t('bakingTimer.placeholderMin')}
                    placeholderTextColor={Colors.text.tertiary}
                    style={styles.minuteInput}
                  />
                  <Text style={styles.minuteLabel}>min</Text>
                </View>
              )}

              {/* Buttons */}
              <View style={styles.btnRow}>
                {!timer.isRunning ? (
                  <TouchableOpacity
                    style={[styles.btn, styles.btnPrimary]}
                    onPress={() => startTimer(timer.id)}
                  >
                    <Ionicons name="play" size={16} color="#FFF" />
                    <Text style={styles.btnTextLight}>
                      {isActive ? t('bakingTimer.resume') : t('bakingTimer.start')}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.btn, styles.btnSecondary]}
                    onPress={() => pauseTimer(timer.id)}
                  >
                    <Ionicons name="pause" size={16} color={Colors.text.primary} />
                    <Text style={styles.btnTextDark}>{t('bakingTimer.pause')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  onPress={() => resetTimer(timer.id)}
                >
                  <Ionicons name="refresh" size={16} color={Colors.text.secondary} />
                  <Text style={styles.btnTextGray}>{t('bakingTimer.reset')}</Text>
                </TouchableOpacity>
              </View>

              {/* Progress bar */}
              {isActive && (
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${ratio * 100}%` as any, backgroundColor: color }]} />
                </View>
              )}
            </View>
          );
        })}

        {/* Add timer button */}
        <TouchableOpacity style={styles.addTimerBtn} onPress={addTimer}>
          <Ionicons name="add-circle-outline" size={20} color={Colors.primary.main} />
          <Text style={styles.addTimerText}>{t('bakingTimer.addTimer')}</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background.secondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  addBtn: { width: 40, alignItems: 'flex-end' },
  headerTitle: { ...Typography.h3, color: Colors.text.primary },
  content: { padding: Spacing.xl, gap: Spacing.md },
  timerCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  timerLabel: { ...Typography.caption, fontWeight: '700', color: Colors.text.tertiary, textTransform: 'uppercase' },
  countdown: {
    fontSize: 56,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
    marginVertical: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  minuteInput: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.main,
    paddingVertical: 4,
    minWidth: 80,
    textAlign: 'center',
  },
  minuteLabel: { fontSize: 16, color: Colors.text.secondary, fontWeight: '500' },
  btnRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  btnPrimary: { backgroundColor: Colors.primary.main },
  btnSecondary: { backgroundColor: Colors.background.secondary },
  btnGhost: { backgroundColor: Colors.background.secondary },
  btnTextLight: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  btnTextDark: { color: Colors.text.primary, fontWeight: '700', fontSize: 14 },
  btnTextGray: { color: Colors.text.secondary, fontWeight: '600', fontSize: 14 },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.background.secondary,
    borderRadius: 2,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  addTimerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    borderStyle: 'dashed',
  },
  addTimerText: { color: Colors.primary.main, fontWeight: '700', fontSize: 15 },
});
