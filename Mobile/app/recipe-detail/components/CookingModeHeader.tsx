import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing } from '../../../constants/Theme';

interface CookingModeHeaderProps {
  currentStep: number;
  totalSteps: number;
  componentName: string;
  accentColor: string;
  onBack: () => void;
  onClose: () => void;
}

export function CookingModeHeader({
  currentStep,
  totalSteps,
  componentName,
  accentColor,
  onBack,
  onClose,
}: CookingModeHeaderProps) {
  const progress = currentStep / totalSteps;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.titleGroup}>
          <Text style={[styles.componentName, { color: accentColor }]} numberOfLines={1}>
            {componentName}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          style={styles.iconBtn}
        >
          <Ionicons name="close" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` as any, backgroundColor: accentColor },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep} / {totalSteps}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  iconBtn: {
    padding: Spacing.xs,
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.sm,
  },
  componentName: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
});
