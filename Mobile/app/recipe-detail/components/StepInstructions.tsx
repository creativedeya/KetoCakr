import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';

interface StepInstructionsProps {
  stepNumber: number;
  description: string;
  accentColor: string;
}

export function StepInstructions({
  stepNumber,
  description,
  accentColor,
}: StepInstructionsProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={[styles.stepLabel, { color: accentColor }]}>
        {t('recipeDetail.instructions.step')} {stepNumber}
      </Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  stepLabel: {
    ...Typography.body2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body1,
    color: Colors.text.primary,
    lineHeight: 26,
  },
});
