// ===========================================================
// Unit Converter — Инч ↔ Сантиметър
// ===========================================================
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useTranslation } from '../../constants/i18n';

export default function UnitConverter() {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [result, setResult] = useState<{ text: string; mode: 'inchToCm' | 'cmToInch' } | null>(null);

  const convert = (mode: 'inchToCm' | 'cmToInch') => {
    const num = parseFloat(value.replace(',', '.'));
    if (isNaN(num) || value.trim() === '') {
      setResult(null);
      return;
    }
    if (mode === 'inchToCm') {
      setResult({ text: `${(num * 2.54).toFixed(2)} ${t('unitConverter.cm')}`, mode });
    } else {
      setResult({ text: `${(num / 2.54).toFixed(2)} ${t('unitConverter.inches')}`, mode });
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('unitConverter.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Input */}
        <View style={styles.card}>
          <Text style={styles.label}>{t('unitConverter.placeholder')}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={Colors.text.tertiary}
            style={styles.input}
          />

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, result?.mode === 'inchToCm' && styles.btnActive]}
              onPress={() => convert('inchToCm')}
            >
              <Text style={[styles.btnText, result?.mode === 'inchToCm' && styles.btnTextActive]}>
                {t('unitConverter.inchToCm')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, result?.mode === 'cmToInch' && styles.btnActive]}
              onPress={() => convert('cmToInch')}
            >
              <Text style={[styles.btnText, result?.mode === 'cmToInch' && styles.btnTextActive]}>
                {t('unitConverter.cmToInch')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Result */}
        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>{t('unitConverter.result')}</Text>
            <Text style={styles.resultValue}>{result.text}</Text>
          </View>
        )}

        {/* Reference card */}
        <View style={styles.refCard}>
          <Text style={styles.refTitle}>📏 Справка</Text>
          {[
            { inch: '6"', cm: '15.24 см' },
            { inch: '7"', cm: '17.78 см' },
            { inch: '8"', cm: '20.32 см' },
            { inch: '9"', cm: '22.86 см' },
            { inch: '10"', cm: '25.40 см' },
            { inch: '12"', cm: '30.48 см' },
          ].map(row => (
            <View key={row.inch} style={styles.refRow}>
              <Text style={styles.refText}>{row.inch}</Text>
              <Text style={styles.refDivider}>→</Text>
              <Text style={styles.refText}>{row.cm}</Text>
            </View>
          ))}
        </View>
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
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  label: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  input: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text.primary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.main,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  btnRow: { flexDirection: 'row', gap: Spacing.sm },
  btn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
  },
  btnActive: { backgroundColor: Colors.primary.main },
  btnText: { fontWeight: '700', fontSize: 14, color: Colors.text.secondary },
  btnTextActive: { color: '#FFFFFF' },
  resultCard: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  resultLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  resultValue: { color: '#FFFFFF', fontSize: 36, fontWeight: '800' },
  refCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  refTitle: { fontWeight: '700', color: Colors.text.primary, marginBottom: Spacing.md, fontSize: 15 },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  refText: { flex: 1, fontSize: 14, color: Colors.text.primary, fontWeight: '500' },
  refDivider: { color: Colors.text.tertiary, marginHorizontal: Spacing.sm },
});
