import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';

interface CookingModeNavigationProps {
  currentIndex: number;
  totalSteps: number;
  accentColor: string;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
}

export function CookingModeNavigation({
  currentIndex,
  totalSteps,
  onComplete,
}: CookingModeNavigationProps) {
  const isLast = currentIndex === totalSteps - 1;
  const { t } = useTranslation();

  if (!isLast) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.completeBtn, { backgroundColor: Colors.success.main }]}
        onPress={onComplete}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color={Colors.text.inverse} />
        <Text style={styles.navBtnText}>{t('cookingMode.completeComponent')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  navBtnText: {
    ...Typography.body1,
    color: Colors.text.inverse,
    fontWeight: '700',
  },
});
