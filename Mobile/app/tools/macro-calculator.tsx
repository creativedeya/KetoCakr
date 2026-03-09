// ===========================================================
// Macro Calculator — BMR / TDEE / Кето макроси
// ===========================================================
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/Theme';
import { useTranslation } from '../../constants/i18n';

type Gender = 'male' | 'female';
type Activity = 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'active' | 'veryActive';

const ACTIVITY_MULTIPLIERS: Record<Activity, number> = {
  sedentary: 1.2,
  lightlyActive: 1.375,
  moderatelyActive: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

interface MacroResult {
  bmr: number;
  tdee: number;
  deficit: number;
  fatG: number;
  proteinG: number;
  carbsG: number;
  fatGDeficit: number;
  proteinGDeficit: number;
  carbsGDeficit: number;
}

function calcMacros(
  weight: number, height: number, age: number,
  gender: Gender, activity: Activity
): MacroResult {
  // Mifflin-St Jeor
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
  const deficit = tdee - 500;

  // Keto macros for TDEE: Fat 72%, Protein 23%, Carbs 5%
  const makeMacros = (kcal: number) => ({
    fatG: Math.round(kcal * 0.72 / 9),
    proteinG: Math.round(kcal * 0.23 / 4),
    carbsG: Math.min(Math.round(kcal * 0.05 / 4), 50),
  });

  const mTdee = makeMacros(tdee);
  const mDef = makeMacros(deficit);

  return {
    bmr: Math.round(bmr),
    tdee,
    deficit,
    ...mTdee,
    fatGDeficit: mDef.fatG,
    proteinGDeficit: mDef.proteinG,
    carbsGDeficit: mDef.carbsG,
  };
}

export default function MacroCalculator() {
  const { t } = useTranslation();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [activity, setActivity] = useState<Activity>('moderatelyActive');
  const [result, setResult] = useState<MacroResult | null>(null);

  const calculate = () => {
    const w = parseFloat(weight.replace(',', '.'));
    const h = parseFloat(height.replace(',', '.'));
    const a = parseInt(age);
    if (isNaN(w) || isNaN(h) || isNaN(a) || w <= 0 || h <= 0 || a <= 0) {
      Alert.alert(t('common.error'), t('macroCalculator.fillAll'));
      return;
    }
    setResult(calcMacros(w, h, a, gender, activity));
  };

  const activities: { key: Activity; label: string }[] = [
    { key: 'sedentary', label: t('macroCalculator.sedentary') },
    { key: 'lightlyActive', label: t('macroCalculator.lightlyActive') },
    { key: 'moderatelyActive', label: t('macroCalculator.moderatelyActive') },
    { key: 'active', label: t('macroCalculator.active') },
    { key: 'veryActive', label: t('macroCalculator.veryActive') },
  ];

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('macroCalculator.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Basic inputs */}
        <View style={styles.card}>
          <View style={styles.inputsRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('macroCalculator.weight')}</Text>
              <TextInput
                value={weight} onChangeText={setWeight}
                keyboardType="decimal-pad" placeholder="65"
                placeholderTextColor={Colors.text.tertiary} style={styles.input}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('macroCalculator.height')}</Text>
              <TextInput
                value={height} onChangeText={setHeight}
                keyboardType="decimal-pad" placeholder="165"
                placeholderTextColor={Colors.text.tertiary} style={styles.input}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('macroCalculator.age')}</Text>
              <TextInput
                value={age} onChangeText={setAge}
                keyboardType="number-pad" placeholder="30"
                placeholderTextColor={Colors.text.tertiary} style={styles.input}
              />
            </View>
          </View>
        </View>

        {/* Gender */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('macroCalculator.gender')}</Text>
          <View style={styles.toggle}>
            {(['female', 'male'] as Gender[]).map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.toggleBtn, gender === g && styles.toggleBtnActive]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.toggleText, gender === g && styles.toggleTextActive]}>
                  {g === 'male' ? '♂ ' : '♀ '}{t(`macroCalculator.${g}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('macroCalculator.activity')}</Text>
          {activities.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.activityRow, activity === key && styles.activityRowActive]}
              onPress={() => setActivity(key)}
            >
              <View style={[styles.radio, activity === key && styles.radioActive]}>
                {activity === key && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.activityText, activity === key && styles.activityTextActive]}>
                {label}
              </Text>
              <Text style={styles.activityMultiplier}>×{ACTIVITY_MULTIPLIERS[key]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calculate button */}
        <TouchableOpacity style={styles.calcBtn} onPress={calculate}>
          <Ionicons name="calculator" size={20} color="#FFF" />
          <Text style={styles.calcBtnText}>{t('macroCalculator.calculate')}</Text>
        </TouchableOpacity>

        {/* Results */}
        {result && (
          <>
            {/* BMR / TDEE */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricCard, { backgroundColor: Colors.background.primary }]}>
                <Text style={styles.metricValue}>{result.bmr}</Text>
                <Text style={styles.metricLabel}>{t('macroCalculator.bmr')}</Text>
                <Text style={styles.metricUnit}>{t('macroCalculator.kcalPerDay')}</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: Colors.primary.main }]}>
                <Text style={[styles.metricValue, { color: '#FFF' }]}>{result.tdee}</Text>
                <Text style={[styles.metricLabel, { color: 'rgba(255,255,255,0.8)' }]}>{t('macroCalculator.tdee')}</Text>
                <Text style={[styles.metricUnit, { color: 'rgba(255,255,255,0.7)' }]}>{t('macroCalculator.kcalPerDay')}</Text>
              </View>
            </View>

            {/* Keto macros — maintenance */}
            <MacroCard
              title={`🥑 ${t('macroCalculator.ketoMacros')} — ${result.tdee} kcal`}
              fat={result.fatG}
              protein={result.proteinG}
              carbs={result.carbsG}
              t={t}
            />

            {/* Keto macros — deficit */}
            <MacroCard
              title={`📉 ${t('macroCalculator.deficit')} — ${result.deficit} kcal`}
              fat={result.fatGDeficit}
              protein={result.proteinGDeficit}
              carbs={result.carbsGDeficit}
              t={t}
              accent
            />
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

function MacroBar({ ratio, color }: { ratio: number; color: string }) {
  return (
    <View style={{ height: 6, backgroundColor: Colors.background.secondary, borderRadius: 3, overflow: 'hidden', marginTop: 4 }}>
      <View style={{ width: `${Math.min(ratio * 100, 100)}%` as any, height: '100%', backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
}

function MacroCard({ title, fat, protein, carbs, t, accent }: {
  title: string; fat: number; protein: number; carbs: number;
  t: (k: string) => string; accent?: boolean;
}) {
  const total = fat * 9 + protein * 4 + carbs * 4;
  return (
    <View style={[macroStyles.card, accent && { borderColor: Colors.primary.main, borderWidth: 2 }]}>
      <Text style={macroStyles.title}>{title}</Text>
      {[
        { label: t('macroCalculator.fat'), g: fat, kcal: fat * 9, color: '#E07B39', ratio: (fat * 9) / (total || 1) },
        { label: t('macroCalculator.protein'), g: protein, kcal: protein * 4, color: '#5B8DB8', ratio: (protein * 4) / (total || 1) },
        { label: t('macroCalculator.carbs'), g: carbs, kcal: carbs * 4, color: '#6B8E6B', ratio: (carbs * 4) / (total || 1) },
      ].map(row => (
        <View key={row.label} style={macroStyles.macroRow}>
          <Text style={macroStyles.macroLabel}>{row.label}</Text>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <MacroBar ratio={row.ratio} color={row.color} />
          </View>
          <Text style={[macroStyles.macroG, { color: row.color }]}>{row.g}g</Text>
        </View>
      ))}
    </View>
  );
}

const macroStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  title: { fontWeight: '700', color: Colors.text.primary, fontSize: 14, marginBottom: Spacing.md },
  macroRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  macroLabel: { width: 75, fontSize: 13, color: Colors.text.secondary, fontWeight: '600' },
  macroG: { width: 40, fontSize: 14, fontWeight: '800', textAlign: 'right' },
});

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
  inputsRow: { flexDirection: 'row', gap: Spacing.sm },
  inputGroup: { flex: 1 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  input: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.main,
    paddingVertical: 4,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: 3,
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
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
  },
  activityRowActive: { backgroundColor: Colors.primary.opacity[10] },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioActive: { borderColor: Colors.primary.main },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary.main },
  activityText: { flex: 1, fontSize: 14, color: Colors.text.secondary },
  activityTextActive: { color: Colors.text.primary, fontWeight: '600' },
  activityMultiplier: { fontSize: 12, color: Colors.text.tertiary, fontWeight: '600' },
  calcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary.main,
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
  },
  calcBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  metricsRow: { flexDirection: 'row', gap: Spacing.md },
  metricCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  metricValue: { fontSize: 28, fontWeight: '800', color: Colors.text.primary },
  metricLabel: { fontSize: 11, color: Colors.text.tertiary, textAlign: 'center', marginTop: 2, fontWeight: '600' },
  metricUnit: { fontSize: 10, color: Colors.text.tertiary, marginTop: 1 },
});
