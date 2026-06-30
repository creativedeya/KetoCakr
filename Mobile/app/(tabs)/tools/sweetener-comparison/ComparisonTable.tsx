import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../../../constants/Theme';
import { useTranslation } from '../../../../constants/i18n';
import { Sweetener } from './types';

interface Props {
  sweeteners: Sweetener[];
}

const COL_WIDTH = 130;

export default function ComparisonTable({ sweeteners }: Props) {
  const { language } = useTranslation();
  const isBg = language === 'bg';

  if (sweeteners.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {isBg ? 'Изберете до 5 подсладителя за сравнение' : 'Select up to 5 sweeteners to compare'}
        </Text>
      </View>
    );
  }

  function fmt(v: any, suffix = ''): string {
    const n = Number(v);
    return v != null && !isNaN(n) ? `${n}${suffix}` : '-';
  }

  const rows = [
    {
      label: isBg ? 'Гликемичен индекс' : 'Glycemic Index',
      key: 'glycemic_index' as const,
      format: (v: any) => fmt(v),
      highlight: (v: any) => {
        const n = Number(v);
        return n <= 5 ? Colors.success.main : n <= 30 ? Colors.warning.main : Colors.error.main;
      },
    },
    {
      label: isBg ? 'Сладост %' : 'Sweetness %',
      key: 'sweetness_ratio' as const,
      format: (v: any) => {
        const n = Number(v);
        return v != null && !isNaN(n) ? `${(n * 100).toFixed(0)}%` : '-';
      },
      highlight: () => Colors.text.primary,
    },
    {
      label: isBg ? 'Кал/г' : 'Cal/g',
      key: 'calories_per_gram' as const,
      format: (v: any) => fmt(v, ' kcal'),
      highlight: (v: any) => (Number(v) === 0 ? Colors.success.main : Colors.text.primary),
    },
    {
      label: isBg ? 'Кето' : 'Keto',
      key: 'keto' as const,
      format: (v: any) => (v ? '✓' : '✗'),
      highlight: (v: any) => (v ? Colors.success.main : Colors.error.main),
    },
    {
      label: isBg ? 'Тип' : 'Source',
      key: 'source' as const,
      format: (v: any) => {
        const map: Record<string, string> = {
          natural: isBg ? 'Природен' : 'Natural',
          synthetic: isBg ? 'Синтетичен' : 'Synthetic',
          'semi-natural': isBg ? 'Полу-природен' : 'Semi-Natural',
        };
        return map[v] ?? v ?? '-';
      },
      highlight: () => Colors.text.secondary,
    },
    {
      label: isBg ? 'Форма' : 'Form',
      key: (isBg ? 'form_bg' : 'form_en') as 'form_bg' | 'form_en',
      format: (v: any) => v ?? '-',
      highlight: () => Colors.text.secondary,
    },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.labelCell} />
          {sweeteners.map(s => (
            <View key={s.id} style={[styles.cell, styles.headerCell]}>
              <Text style={styles.headerName} numberOfLines={2}>
                {language === 'bg' ? s.name_bg : s.name_en}
              </Text>
            </View>
          ))}
        </View>

        {/* Data rows */}
        {rows.map((row, i) => (
          <View key={row.key} style={[styles.dataRow, i % 2 === 0 && styles.rowAlt]}>
            <View style={styles.labelCell}>
              <Text style={styles.rowLabel}>{row.label}</Text>
            </View>
            {sweeteners.map(s => {
              const val = s[row.key];
              return (
                <View key={s.id} style={styles.cell}>
                  <Text style={[styles.cellValue, { color: row.highlight(val as any) }]}>
                    {row.format(val as any)}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  emptyText: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.main,
  },
  dataRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
  },
  rowAlt: {
    backgroundColor: Colors.background.secondary,
  },
  labelCell: {
    width: 120,
    padding: Spacing.md,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border.light,
  },
  rowLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  cell: {
    width: COL_WIDTH,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border.light,
  },
  headerCell: {
    backgroundColor: Colors.primary.main,
  },
  headerName: {
    ...Typography.caption,
    color: Colors.text.inverse,
    fontWeight: '700',
    textAlign: 'center',
  },
  cellValue: {
    ...Typography.body2,
    fontWeight: '600',
    textAlign: 'center',
  },
});
