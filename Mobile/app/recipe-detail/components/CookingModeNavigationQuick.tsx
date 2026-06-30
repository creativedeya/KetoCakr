import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';

interface CookingModeNavigationQuickProps {
  currentIndex: number;
  totalSteps: number;
  accentColor: string;
  onNext: () => void;
  onPrev: () => void;
}

export function CookingModeNavigationQuick({
  currentIndex,
  totalSteps,
  accentColor,
  onNext,
  onPrev,
}: CookingModeNavigationQuickProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
        onPress={onPrev}
        disabled={isFirst}
      >
        <Ionicons
          name="chevron-back"
          size={18}
          color={isFirst ? Colors.text.tertiary : Colors.text.inverse}
        />
        <Text style={[styles.navBtnText, isFirst && styles.navBtnTextDisabled]}>
          {t('common.back')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navBtn, { backgroundColor: accentColor }, isLast && styles.navBtnDisabled]}
        onPress={onNext}
        disabled={isLast}
      >
        <Text style={[styles.navBtnText, isLast && styles.navBtnTextDisabled]}>
          {t('cookingMode.forward')}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={isLast ? Colors.text.tertiary : Colors.text.inverse}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.base,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary.main,
  },
  navBtnDisabled: {
    backgroundColor: Colors.background.tertiary,
  },
  navBtnText: {
    ...Typography.body2,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  navBtnTextDisabled: {
    color: Colors.text.tertiary,
  },
});
