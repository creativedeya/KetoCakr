import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../../../constants/Theme';
import { useTranslation } from '../../../../constants/i18n';
import { Sweetener, UNIT_TO_GRAMS } from './types';

interface Props {
  sweeteners: Sweetener[];
}

const UNITS = ['g', 'tsp', 'tbsp', 'cup'] as const;
type Unit = typeof UNITS[number];

export default function Calculator({ sweeteners }: Props) {
  const { language } = useTranslation();
  const isBg = language === 'bg';

  const [fromId, setFromId] = useState<string | null>(null);
  const [toId, setToId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<Unit>('g');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const labels = {
    title: isBg ? 'Конвертор на подсладители' : 'Sweetener Converter',
    from: isBg ? 'От' : 'From',
    to: isBg ? 'Към' : 'To',
    amount: isBg ? 'Количество' : 'Amount',
    result: isBg ? 'Резултат' : 'Result',
    calories: isBg ? 'Калории' : 'Calories',
    select: isBg ? 'Избери подсладител...' : 'Select sweetener...',
    noResult: isBg ? 'Въведи количество' : 'Enter an amount',
  };

  const fromSweetener = sweeteners.find(s => s.id === fromId) ?? null;
  const toSweetener = sweeteners.find(s => s.id === toId) ?? null;

  type CalcResult =
    | { ok: true; toGrams: number; calories: number }
    | { ok: false; error: string };

  const result = useMemo((): CalcResult | null => {
    if (!fromSweetener || !toSweetener) return null;
    const fromRatio = Number(fromSweetener.sweetness_ratio);
    const toRatio = Number(toSweetener.sweetness_ratio);
    if (isNaN(fromRatio) || fromRatio <= 0) {
      return { ok: false, error: isBg ? 'Липсва sweetness_ratio за изходния подсладител' : 'Missing sweetness ratio for source sweetener' };
    }
    if (isNaN(toRatio) || toRatio <= 0) {
      return { ok: false, error: isBg ? 'Липсва sweetness_ratio за целевия подсладител' : 'Missing sweetness ratio for target sweetener' };
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return null;
    const fromGrams = num * UNIT_TO_GRAMS[unit];
    const toGrams = fromGrams * (fromRatio / toRatio);
    const calPerGram = Number(toSweetener.calories_per_gram);
    const calories = toGrams * (isNaN(calPerGram) ? 0 : calPerGram);
    return { ok: true, toGrams, calories };
  }, [fromSweetener, toSweetener, amount, unit, isBg]);

  function sweetenerName(s: Sweetener) {
    return isBg ? s.name_bg : s.name_en;
  }

  function renderPicker(
    selected: Sweetener | null,
    show: boolean,
    onToggle: () => void,
    onSelect: (id: string) => void
  ) {
    return (
      <View>
        <TouchableOpacity style={styles.pickerBtn} onPress={onToggle}>
          <Text style={selected ? styles.pickerValue : styles.pickerPlaceholder} numberOfLines={1}>
            {selected ? sweetenerName(selected) : labels.select}
          </Text>
        </TouchableOpacity>
        {show && (
          <View style={styles.dropdown}>
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
              {sweeteners.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.dropdownItem, s.id === selected?.id && styles.dropdownItemActive]}
                  onPress={() => { onSelect(s.id); onToggle(); }}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      s.id === selected?.id && styles.dropdownTextActive,
                    ]}
                  >
                    {sweetenerName(s)}
                  </Text>
                  <Text style={styles.dropdownMeta}>{Math.round(Number(s.sweetness_ratio) * 100)}%</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>{labels.from}</Text>
        {renderPicker(fromSweetener, showFromPicker, () => setShowFromPicker(v => !v), setFromId)}

        <View style={styles.amountRow}>
          <TextInput
            style={styles.amountInput}
            placeholder={labels.amount}
            placeholderTextColor={Colors.text.tertiary}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          <View style={styles.unitRow}>
            {UNITS.map(u => (
              <TouchableOpacity
                key={u}
                style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>{labels.to}</Text>
        {renderPicker(toSweetener, showToPicker, () => setShowToPicker(v => !v), setToId)}
      </View>

      <View style={styles.resultCard}>
        <Text style={styles.resultLabel}>{labels.result}</Text>
        {result && !result.ok ? (
          <Text style={styles.errorText}>{result.error}</Text>
        ) : result && result.ok ? (
          <>
            <Text style={styles.resultValue}>{result.toGrams.toFixed(1)} g</Text>
            <Text style={styles.caloriesText}>
              {labels.calories}: {Math.round(result.calories)} kcal
            </Text>
          </>
        ) : (
          <Text style={styles.noResult}>{labels.noResult}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.md },
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
    ...Shadows.md,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pickerBtn: {
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
  },
  pickerValue: { ...Typography.body2, color: Colors.text.primary, fontWeight: '600' },
  pickerPlaceholder: { ...Typography.body2, color: Colors.text.tertiary },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.primary,
    marginTop: 4,
    ...Shadows.sm,
    zIndex: 99,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  dropdownItemActive: { backgroundColor: Colors.primary.opacity[10] },
  dropdownText: { ...Typography.body2, color: Colors.text.primary },
  dropdownTextActive: { color: Colors.primary.main, fontWeight: '700' },
  dropdownMeta: { ...Typography.caption, color: Colors.text.tertiary },
  amountRow: { gap: Spacing.sm },
  amountInput: {
    borderWidth: 1,
    borderColor: Colors.border.medium,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.body1,
    color: Colors.text.primary,
    backgroundColor: Colors.background.secondary,
  },
  unitRow: { flexDirection: 'row', gap: Spacing.xs },
  unitBtn: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    alignItems: 'center',
  },
  unitBtnActive: { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main },
  unitText: { ...Typography.caption, color: Colors.text.secondary, fontWeight: '600' },
  unitTextActive: { color: Colors.text.inverse },
  divider: { height: 1, backgroundColor: Colors.border.light },
  resultCard: {
    backgroundColor: Colors.primary.opacity[10],
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xs,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  resultLabel: {
    ...Typography.caption,
    color: Colors.primary.main,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  resultValue: { ...Typography.h3, color: Colors.primary.main },
  caloriesText: { ...Typography.body2, color: Colors.text.secondary },
  noResult: { ...Typography.body2, color: Colors.text.tertiary },
  errorText: { ...Typography.body2, color: Colors.error.main, textAlign: 'center' },
});
