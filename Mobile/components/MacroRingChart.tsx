import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '../constants/Colors';

interface MacroRingChartProps {
  calories: number;
  netCarbsGrams: number;
  proteinGrams: number;
  fatGrams: number;
  size?: number;
}

export function MacroRingChart({
  calories,
  netCarbsGrams,
  proteinGrams,
  fatGrams,
  size = 160,
}: MacroRingChartProps) {
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const centerX = size / 2;
  const centerY = size / 2;

  const totalGrams = netCarbsGrams + proteinGrams + fatGrams;

  if (totalGrams === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={Colors.background.secondary}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
        </Svg>
        <View style={styles.centerText}>
          <Text style={styles.caloriesText}>0</Text>
          <Text style={styles.caloriesLabel}>Calories</Text>
        </View>
      </View>
    );
  }

  // Proportions based on GRAMS (not calories)
  const carbsDashLength = circumference * (netCarbsGrams / totalGrams);
  const proteinDashLength = circumference * (proteinGrams / totalGrams);
  const fatDashLength = circumference * (fatGrams / totalGrams);

  // Offsets: each segment starts where the previous ended
  const carbsOffset = 0;
  const proteinOffset = -carbsDashLength;
  const fatOffset = -(carbsDashLength + proteinDashLength);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${centerX}, ${centerY}`}>

          {/* Background track */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={Colors.background.secondary}
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Net Carbs segment — Ruby Red (primary brand color) */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={Colors.primary.main}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${carbsDashLength} ${circumference}`}
            strokeDashoffset={carbsOffset}
            strokeLinecap="round"
          />

          {/* Protein segment */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={Colors.macros.protein}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${proteinDashLength} ${circumference}`}
            strokeDashoffset={proteinOffset}
            strokeLinecap="round"
          />

          {/* Fat segment */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={Colors.macros.fat}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${fatDashLength} ${circumference}`}
            strokeDashoffset={fatOffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {/* Center text */}
      <View style={styles.centerText}>
        <Text style={styles.caloriesText}>{Math.round(calories)}</Text>
        <Text style={styles.caloriesLabel}>Calories</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 40,
  },
  caloriesLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
