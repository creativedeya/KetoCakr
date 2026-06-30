import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';

export type StepsMode = 'text' | 'images-text' | 'cooking';

const MODES: { key: StepsMode; icon: string }[] = [
  { key: 'text', icon: 'document-text-outline' },
  { key: 'images-text', icon: 'images-outline' },
  { key: 'cooking', icon: 'restaurant-outline' },
];

interface StepsModeToggleProps {
  selected: StepsMode;
  onChange: (mode: StepsMode) => void;
  timerEnabled?: boolean;
  onTimerToggle?: () => void;
}

export default function StepsModeToggle({
  selected,
  onChange,
  timerEnabled,
  onTimerToggle,
}: StepsModeToggleProps) {
  const { t } = useTranslation();

  const modeLabel = (key: StepsMode): string => {
    switch (key) {
      case 'text': return t('cookingMode.textOnly');
      case 'images-text': return t('cookingMode.imagesText');
      case 'cooking': return t('cookingMode.cooking');
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.modeGroup}>
        {MODES.map((m, i) => (
          <TouchableOpacity
            key={m.key}
            onPress={() => onChange(m.key)}
            style={[
              styles.btn,
              i === 0 && styles.btnLeft,
              i === MODES.length - 1 && styles.btnRight,
              selected === m.key && styles.btnActive,
            ]}
          >
            <Ionicons
              name={m.icon as any}
              size={14}
              color={selected === m.key ? Colors.primary.main : Colors.text.secondary}
            />
            <Text
              style={[
                styles.label,
                { color: selected === m.key ? Colors.primary.main : Colors.text.secondary },
              ]}
            >
              {modeLabel(m.key)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {onTimerToggle && selected !== 'cooking' && (
        <TouchableOpacity
          onPress={onTimerToggle}
          style={[styles.timerBtn, timerEnabled && styles.timerBtnActive]}
        >
          <Ionicons
            name="timer-outline"
            size={14}
            color={timerEnabled ? Colors.text.inverse : Colors.text.secondary}
          />
          <Text
            style={[
              styles.timerLabel,
              { color: timerEnabled ? Colors.text.inverse : Colors.text.secondary },
            ]}
          >
            {timerEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modeGroup: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    overflow: 'hidden',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 4,
    backgroundColor: Colors.background.primary,
    borderRightWidth: 1,
    borderRightColor: Colors.border.medium,
  },
  btnLeft: {
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  btnRight: {
    borderTopRightRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    borderRightWidth: 0,
  },
  btnActive: {
    backgroundColor: Colors.primary.opacity[10],
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.medium,
    backgroundColor: Colors.background.primary,
  },
  timerBtnActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  timerLabel: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
