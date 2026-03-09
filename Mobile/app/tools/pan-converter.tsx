// ===========================================================
// Pan Converter — конвертор на тави (кръгла / правоъгълна)
// ===========================================================
import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useTranslation } from '../../constants/i18n';
import { useLanguageStore } from '../../store/useLanguageStore';
import { ROUND_PANS, RECTANGULAR_PANS } from '../../constants/BakingPans';

// Parse diameter in cm from metricSize string like "16 см"
function parseDiameter(metricSize: string): number {
  return parseInt(metricSize.replace(/[^\d]/g, ''), 10) || 0;
}

// Parse rectangular dimensions from "23×33 см" → [23, 33]
function parseRectDims(metricSize: string): [number, number] {
  const match = metricSize.match(/(\d+)[×x](\d+)/);
  if (!match) return [0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10)];
}

type PanShape = 'round' | 'rectangular';

export default function PanConverter() {
  const { t } = useTranslation();
  const { unitSystem } = useLanguageStore();
  const [shape, setShape] = useState<PanShape>('round');
  const [diameter, setDiameter] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');

  const result = useMemo(() => {
    if (shape === 'round') {
      const d = parseFloat(diameter.replace(',', '.'));
      if (isNaN(d) || d <= 0) return null;
      // Find closest round pan by diameter
      let closest = ROUND_PANS[0];
      let minDiff = Math.abs(parseDiameter(ROUND_PANS[0].metricSize) - d);
      for (const pan of ROUND_PANS) {
        const diff = Math.abs(parseDiameter(pan.metricSize) - d);
        if (diff < minDiff) { minDiff = diff; closest = pan; }
      }
      // Compute volume for arbitrary diameter: V = π × (d/2)² × h, approximate h=7cm
      const r = d / 2;
      const vol = Math.PI * r * r * 0.07; // height ~7cm in liters (m³ = π r² h, d in cm → /100 for m²×100 → L)
      // Simpler: area ratio to base pan (18cm = 1.4L)
      const baseR = 9; // 18cm / 2
      const volL = (r * r / (baseR * baseR)) * 1.4;
      return {
        size: unitSystem === 'metric' ? closest.metricSize : closest.imperialSize,
        volume: volL.toFixed(1),
        servings: closest.servings,
        exact: minDiff === 0,
      };
    } else {
      const l = parseFloat(length.replace(',', '.'));
      const w = parseFloat(width.replace(',', '.'));
      if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) return null;
      const area = l * w; // cm²
      // Find closest rectangular pan by area
      const rectAreas = RECTANGULAR_PANS.map(p => {
        const [pl, pw] = parseRectDims(p.metricSize);
        return { pan: p, area: pl * pw };
      });
      let closest = rectAreas[0];
      let minDiff = Math.abs(rectAreas[0].area - area);
      for (const item of rectAreas) {
        const diff = Math.abs(item.area - area);
        if (diff < minDiff) { minDiff = diff; closest = item; }
      }
      // Volume: area × height ~5cm
      const volL = (area * 5) / 1000;
      return {
        size: unitSystem === 'metric' ? closest.pan.metricSize : closest.pan.imperialSize,
        volume: volL.toFixed(1),
        servings: closest.pan.servings,
        exact: false,
      };
    }
  }, [shape, diameter, length, width, unitSystem]);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('panConverter.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Shape toggle */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, shape === 'round' && styles.toggleBtnActive]}
            onPress={() => setShape('round')}
          >
            <Text style={[styles.toggleText, shape === 'round' && styles.toggleTextActive]}>
              ⭕ {t('panConverter.round')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, shape === 'rectangular' && styles.toggleBtnActive]}
            onPress={() => setShape('rectangular')}
          >
            <Text style={[styles.toggleText, shape === 'rectangular' && styles.toggleTextActive]}>
              ▭ {t('panConverter.rectangular')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <View style={styles.card}>
          {shape === 'round' ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('panConverter.diameter')}</Text>
              <TextInput
                value={diameter}
                onChangeText={setDiameter}
                keyboardType="decimal-pad"
                placeholder="20"
                placeholderTextColor={Colors.text.tertiary}
                style={styles.input}
              />
            </View>
          ) : (
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>{t('panConverter.length')}</Text>
                <TextInput
                  value={length}
                  onChangeText={setLength}
                  keyboardType="decimal-pad"
                  placeholder="23"
                  placeholderTextColor={Colors.text.tertiary}
                  style={styles.input}
                />
              </View>
              <Text style={styles.timesSign}>×</Text>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>{t('panConverter.width')}</Text>
                <TextInput
                  value={width}
                  onChangeText={setWidth}
                  keyboardType="decimal-pad"
                  placeholder="33"
                  placeholderTextColor={Colors.text.tertiary}
                  style={styles.input}
                />
              </View>
            </View>
          )}
        </View>

        {/* Result */}
        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{t('panConverter.closestPan')}</Text>
            <Text style={styles.resultSize}>{result.size}</Text>
            <View style={styles.resultRow}>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{result.volume} {t('panConverter.liters')}</Text>
                <Text style={styles.resultItemLabel}>{t('panConverter.volume')}</Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{result.servings}</Text>
                <Text style={styles.resultItemLabel}>{t('panConverter.servings')}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('panConverter.enterSize')}</Text>
          </View>
        )}

        {/* Reference table */}
        <View style={styles.refCard}>
          <Text style={styles.refTitle}>📋 {t('panConverter.round')}</Text>
          {ROUND_PANS.map(pan => (
            <View key={pan.servings} style={styles.refRow}>
              <Text style={styles.refCell}>
                {unitSystem === 'metric' ? pan.metricSize : pan.imperialSize}
              </Text>
              <Text style={styles.refCell}>{pan.volumeLiters} {t('panConverter.liters')}</Text>
              <Text style={[styles.refCell, { color: Colors.primary.main, fontWeight: '700' }]}>
                {pan.servings} {t('panConverter.servings')}
              </Text>
            </View>
          ))}
          <Text style={[styles.refTitle, { marginTop: Spacing.md }]}>📋 {t('panConverter.rectangular')}</Text>
          {RECTANGULAR_PANS.map(pan => (
            <View key={pan.servings} style={styles.refRow}>
              <Text style={styles.refCell}>
                {unitSystem === 'metric' ? pan.metricSize : pan.imperialSize}
              </Text>
              <Text style={styles.refCell}>{pan.sheetName}</Text>
              <Text style={[styles.refCell, { color: Colors.primary.main, fontWeight: '700' }]}>
                {pan.servings} {t('panConverter.servings')}
              </Text>
            </View>
          ))}
        </View>

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
  headerTitle: { ...Typography.h3, color: Colors.text.primary },
  content: { padding: Spacing.xl, gap: Spacing.md },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: 4,
    ...Shadows.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  toggleBtnActive: { backgroundColor: Colors.primary.main },
  toggleText: { fontWeight: '700', color: Colors.text.secondary, fontSize: 14 },
  toggleTextActive: { color: '#FFFFFF' },
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  inputGroup: { marginBottom: 0 },
  inputLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.main,
    paddingVertical: 4,
    textAlign: 'center',
  },
  rowInputs: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  timesSign: { fontSize: 24, fontWeight: '700', color: Colors.text.secondary, paddingBottom: 8 },
  resultCard: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  resultTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  resultSize: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', marginBottom: Spacing.md },
  resultRow: { flexDirection: 'row', width: '100%', alignItems: 'center' },
  resultItem: { flex: 1, alignItems: 'center' },
  resultValue: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  resultItemLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  resultDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },
  emptyCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  emptyText: { color: Colors.text.tertiary, fontSize: 15 },
  refCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  refTitle: { fontWeight: '700', color: Colors.text.primary, fontSize: 14, marginBottom: Spacing.sm },
  refRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  refCell: { flex: 1, fontSize: 13, color: Colors.text.primary },
});
