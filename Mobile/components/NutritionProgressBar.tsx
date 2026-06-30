import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, getProgressBarColor } from '../constants/Colors';
import { Typography, Spacing } from '../constants/Theme';

interface NutritionProgressBarProps {
  label: string;
  value: number;
  unit: string;
  percentDV: number;
  color?: string;
}

export function NutritionProgressBar({
  label,
  value,
  percentDV,
  unit,
  color,
}: NutritionProgressBarProps) {
  const barColor = color || getProgressBarColor(percentDV);
  const displayValue = value.toFixed(1);
  const displayPercent = percentDV.toFixed(0);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{displayValue}{unit}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentDV, 100)}%`,
                backgroundColor: barColor,
              },
            ]}
          />
        </View>
        <Text style={styles.percentText}>{displayPercent}% DV</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.body2,
    color: Colors.text.primary,
  },
  value: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.progressBar.low,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  percentText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    minWidth: 55,
    textAlign: 'right',
  },
});
