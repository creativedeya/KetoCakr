// ===========================================================
// Pan Converter — 2 режима: смяна на тава / смяна на порции
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

type PanShape = 'round' | 'rectangular';
type AppMode = 'changePan' | 'changeServings';

const IN_TO_CM = 2.54;

function roundVolL(dCm: number): number {
  return Math.PI * (dCm / 2) * (dCm / 2) * 7 / 1000;
}

function rectVolL(lCm: number, wCm: number): number {
  return lCm * wCm * 5 / 1000;
}

function nearestRound(servings: number) {
  return ROUND_PANS.reduce((best, pan) =>
    Math.abs(pan.servings - servings) < Math.abs(best.servings - servings) ? pan : best
  );
}

function nearestRect(servings: number) {
  return RECTANGULAR_PANS.reduce((best, pan) =>
    Math.abs(pan.servings - servings) < Math.abs(best.servings - servings) ? pan : best
  );
}

// ── Sub-component ───────────────────────────────────────────
interface PanInputProps {
  title: string;
  shape: PanShape;
  onShapeChange: (s: PanShape) => void;
  diam: string; onDiamChange: (v: string) => void;
  len: string; onLenChange: (v: string) => void;
  wid: string; onWidChange: (v: string) => void;
  unitLabel: string;
  volumeL: number | null;
  t: (k: string) => string;
}

function PanInput({
  title, shape, onShapeChange,
  diam, onDiamChange, len, onLenChange, wid, onWidChange,
  unitLabel, volumeL, t,
}: PanInputProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.panTitle}>{title}</Text>

      {/* Shape selector */}
      <View style={styles.shapeToggle}>
        <TouchableOpacity
          style={[styles.shapeBtn, shape === 'round' && styles.shapeBtnActive]}
          onPress={() => onShapeChange('round')}
        >
          <Text style={[styles.shapeBtnText, shape === 'round' && styles.shapeBtnTextActive]}>
            ⭕ {t('panConverter.round')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shapeBtn, shape === 'rectangular' && styles.shapeBtnActive]}
          onPress={() => onShapeChange('rectangular')}
        >
          <Text style={[styles.shapeBtnText, shape === 'rectangular' && styles.shapeBtnTextActive]}>
            ▭ {t('panConverter.rectangular')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Size inputs */}
      {shape === 'round' ? (
        <View style={styles.sizeRow}>
          <TextInput
            value={diam} onChangeText={onDiamChange}
            keyboardType="decimal-pad" placeholder="20"
            placeholderTextColor={Colors.text.tertiary}
            style={styles.sizeInput}
          />
          <Text style={styles.unitSuffix}>{unitLabel}</Text>
        </View>
      ) : (
        <View style={styles.sizeRow}>
          <TextInput
            value={len} onChangeText={onLenChange}
            keyboardType="decimal-pad" placeholder="23"
            placeholderTextColor={Colors.text.tertiary}
            style={styles.sizeInput}
          />
          <Text style={styles.timesSign}>×</Text>
          <TextInput
            value={wid} onChangeText={onWidChange}
            keyboardType="decimal-pad" placeholder="33"
            placeholderTextColor={Colors.text.tertiary}
            style={styles.sizeInput}
          />
          <Text style={styles.unitSuffix}>{unitLabel}</Text>
        </View>
      )}

      {volumeL !== null && (
        <Text style={styles.volumeText}>
          {t('panConverter.volume')}: {volumeL.toFixed(1)} {t('panConverter.liters')}
        </Text>
      )}
    </View>
  );
}

// ── Main component ──────────────────────────────────────────
export default function PanConverter() {
  const { t } = useTranslation();
  const { unitSystem } = useLanguageStore();

  const [mode, setMode] = useState<AppMode>('changePan');
  const [units, setUnits] = useState<'metric' | 'imperial'>(unitSystem);

  // Mode 1 state
  const [recipeShape, setRecipeShape] = useState<PanShape>('round');
  const [recipeDiam, setRecipeDiam] = useState('');
  const [recipeLen, setRecipeLen] = useState('');
  const [recipeWid, setRecipeWid] = useState('');
  const [myShape, setMyShape] = useState<PanShape>('round');
  const [myDiam, setMyDiam] = useState('');
  const [myLen, setMyLen] = useState('');
  const [myWid, setMyWid] = useState('');

  // Mode 2 state
  const [recipeServ, setRecipeServ] = useState('');
  const [desiredServ, setDesiredServ] = useState('');

  const toCm = (val: string): number => {
    const n = parseFloat(val.replace(',', '.'));
    if (isNaN(n) || n <= 0) return 0;
    return units === 'imperial' ? n * IN_TO_CM : n;
  };

  const unitLabel = units === 'metric' ? 'см' : '"';

  const recipeVolL = useMemo(() => {
    if (recipeShape === 'round') {
      const d = toCm(recipeDiam);
      return d > 0 ? roundVolL(d) : null;
    }
    const l = toCm(recipeLen), w = toCm(recipeWid);
    return l > 0 && w > 0 ? rectVolL(l, w) : null;
  }, [recipeShape, recipeDiam, recipeLen, recipeWid, units]);

  const myVolL = useMemo(() => {
    if (myShape === 'round') {
      const d = toCm(myDiam);
      return d > 0 ? roundVolL(d) : null;
    }
    const l = toCm(myLen), w = toCm(myWid);
    return l > 0 && w > 0 ? rectVolL(l, w) : null;
  }, [myShape, myDiam, myLen, myWid, units]);

  const result = useMemo(() => {
    if (mode === 'changePan') {
      if (recipeVolL === null || myVolL === null || recipeVolL <= 0) return null;
      const multiplier = myVolL / recipeVolL;
      return { type: 'changePan' as const, multiplier };
    }
    const rs = parseFloat(recipeServ.replace(',', '.'));
    const ds = parseFloat(desiredServ.replace(',', '.'));
    if (isNaN(rs) || isNaN(ds) || rs <= 0 || ds <= 0) return null;
    return {
      type: 'changeServings' as const,
      multiplier: ds / rs,
      roundPan: nearestRound(ds),
      rectPan: nearestRect(ds),
    };
  }, [mode, recipeVolL, myVolL, recipeServ, desiredServ]);

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

        {/* Mode toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'changePan' && styles.modeBtnActive]}
            onPress={() => setMode('changePan')}
          >
            <Text style={[styles.modeBtnText, mode === 'changePan' && styles.modeBtnTextActive]}>
              🍳 {t('panConverter.changePan')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'changeServings' && styles.modeBtnActive]}
            onPress={() => setMode('changeServings')}
          >
            <Text style={[styles.modeBtnText, mode === 'changeServings' && styles.modeBtnTextActive]}>
              🔢 {t('panConverter.changeServings')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Unit toggle */}
        <View style={styles.unitRow}>
          <Text style={styles.unitRowLabel}>{t('panConverter.units')}:</Text>
          <View style={styles.unitToggle}>
            {(['metric', 'imperial'] as const).map(u => (
              <TouchableOpacity
                key={u}
                style={[styles.unitBtn, units === u && styles.unitBtnActive]}
                onPress={() => setUnits(u)}
              >
                <Text style={[styles.unitBtnText, units === u && styles.unitBtnTextActive]}>
                  {u === 'metric' ? 'см' : 'инч'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Mode 1: Change pan ── */}
        {mode === 'changePan' ? (
          <>
            <PanInput
              title={`📖 ${t('panConverter.recipeSays')}:`}
              shape={recipeShape} onShapeChange={setRecipeShape}
              diam={recipeDiam} onDiamChange={setRecipeDiam}
              len={recipeLen} onLenChange={setRecipeLen}
              wid={recipeWid} onWidChange={setRecipeWid}
              unitLabel={unitLabel}
              volumeL={recipeVolL}
              t={t}
            />

            <PanInput
              title={`🍳 ${t('panConverter.iHave')}:`}
              shape={myShape} onShapeChange={setMyShape}
              diam={myDiam} onDiamChange={setMyDiam}
              len={myLen} onLenChange={setMyLen}
              wid={myWid} onWidChange={setMyWid}
              unitLabel={unitLabel}
              volumeL={myVolL}
              t={t}
            />

            {result?.type === 'changePan' ? (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>📊 {t('panConverter.coefficient')}</Text>
                <Text style={styles.multiplierText}>×{result.multiplier.toFixed(2)}</Text>
                <Text style={styles.resultHint}>
                  {t('panConverter.multiplyBy')} {result.multiplier.toFixed(2)}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>{t('panConverter.enterSize')}</Text>
              </View>
            )}
          </>
        ) : (
          /* ── Mode 2: Change servings ── */
          <>
            <View style={styles.card}>
              <View style={styles.servingsRow}>
                <View style={styles.servingBlock}>
                  <Text style={styles.servingLabel}>{t('panConverter.recipeServings')}</Text>
                  <TextInput
                    value={recipeServ} onChangeText={setRecipeServ}
                    keyboardType="number-pad" placeholder="8"
                    placeholderTextColor={Colors.text.tertiary}
                    style={styles.bigInput}
                  />
                </View>
                <Text style={styles.arrowText}>→</Text>
                <View style={styles.servingBlock}>
                  <Text style={styles.servingLabel}>{t('panConverter.desiredServings')}</Text>
                  <TextInput
                    value={desiredServ} onChangeText={setDesiredServ}
                    keyboardType="number-pad" placeholder="20"
                    placeholderTextColor={Colors.text.tertiary}
                    style={styles.bigInput}
                  />
                </View>
              </View>
            </View>

            {result?.type === 'changeServings' ? (
              <>
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>📊 {t('panConverter.coefficient')}</Text>
                  <Text style={styles.multiplierText}>×{result.multiplier.toFixed(2)}</Text>
                  <Text style={styles.resultHint}>
                    {t('panConverter.multiplyBy')} {result.multiplier.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.recCard}>
                  <Text style={styles.recTitle}>🍳 {t('panConverter.recommendedPan')}</Text>
                  <View style={styles.recRow}>
                    <Text style={styles.recShape}>⭕ {t('panConverter.round')}:</Text>
                    <Text style={styles.recSize}>
                      {units === 'metric' ? result.roundPan.metricSize : result.roundPan.imperialSize}
                    </Text>
                    <Text style={styles.recServings}>
                      {result.roundPan.servings} {t('panConverter.servings')}
                    </Text>
                  </View>
                  <View style={styles.recRow}>
                    <Text style={styles.recShape}>▭ {t('panConverter.rectangular')}:</Text>
                    <Text style={styles.recSize}>
                      {units === 'metric' ? result.rectPan.metricSize : result.rectPan.imperialSize}
                    </Text>
                    <Text style={styles.recServings}>
                      {result.rectPan.servings} {t('panConverter.servings')}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>{t('panConverter.enterSize')}</Text>
              </View>
            )}
          </>
        )}

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

  // Mode toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: 4,
    ...Shadows.sm,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  modeBtnActive: { backgroundColor: Colors.primary.main },
  modeBtnText: { fontWeight: '700', color: Colors.text.secondary, fontSize: 13 },
  modeBtnTextActive: { color: '#FFFFFF' },

  // Unit toggle
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  unitRowLabel: { fontSize: 13, color: Colors.text.tertiary, fontWeight: '600' },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: 2,
    ...Shadows.sm,
  },
  unitBtn: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  unitBtnActive: { backgroundColor: Colors.primary.main },
  unitBtnText: { fontWeight: '700', color: Colors.text.secondary, fontSize: 13 },
  unitBtnTextActive: { color: '#FFFFFF' },

  // PanInput card
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  panTitle: {
    fontWeight: '700',
    color: Colors.text.primary,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  shapeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  shapeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  shapeBtnActive: { backgroundColor: Colors.primary.main },
  shapeBtnText: { fontWeight: '700', color: Colors.text.secondary, fontSize: 13 },
  shapeBtnTextActive: { color: '#FFFFFF' },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  sizeInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text.primary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.main,
    paddingVertical: 4,
    textAlign: 'center',
  },
  timesSign: { fontSize: 22, fontWeight: '700', color: Colors.text.secondary },
  unitSuffix: { fontSize: 16, fontWeight: '600', color: Colors.text.tertiary, width: 36 },
  volumeText: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontSize: 13,
    color: Colors.text.tertiary,
    fontWeight: '600',
  },

  // Result card
  resultCard: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  resultLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  multiplierText: { color: '#FFFFFF', fontSize: 48, fontWeight: '800', letterSpacing: 1 },
  resultHint: { color: 'rgba(255,255,255,0.9)', fontSize: 13, textAlign: 'center', marginTop: Spacing.sm },

  // Empty state
  emptyCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  emptyText: { color: Colors.text.tertiary, fontSize: 15 },

  // Recommended pan card
  recCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  recTitle: { fontWeight: '700', color: Colors.text.primary, fontSize: 14, marginBottom: Spacing.md },
  recRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    gap: 4,
  },
  recShape: { fontSize: 13, color: Colors.text.secondary, fontWeight: '600', width: 90 },
  recSize: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  recServings: { fontSize: 13, color: Colors.primary.main, fontWeight: '700' },

  // Servings mode
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  servingBlock: { flex: 1, alignItems: 'center' },
  servingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  bigInput: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text.primary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.main,
    paddingVertical: 4,
    textAlign: 'center',
    minWidth: 80,
  },
  arrowText: {
    fontSize: 22,
    color: Colors.text.tertiary,
    fontWeight: '700',
    marginTop: 16,
  },
});
