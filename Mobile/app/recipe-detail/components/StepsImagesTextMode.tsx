import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius, IconSize } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';

interface StepItem {
  id: string;
  stepNumber: number;
  description: string;
  imageUrl?: string | null;
  durationMinutes?: number | null;
  componentId?: string;
}

interface ComponentInfo {
  id: string;
  name: string;
  roleName: string;
}

interface IngredientInfo {
  id: string;
  name: string;
  nameBg?: string;
  nameEn?: string;
  quantity?: number;
  unit?: string;
  componentId?: string;
  imageUrl?: string | null;
}

interface StepsImagesTextModeProps {
  steps: StepItem[];
  components?: ComponentInfo[];
  ingredients?: IngredientInfo[];
  onTimerPress?: (minutes: number) => void;
  timerEnabled?: boolean;
}

export function StepsImagesTextMode({
  steps,
  components = [],
  ingredients = [],
  onTimerPress,
  timerEnabled = false,
}: StepsImagesTextModeProps) {
  const { language, t } = useTranslation();

  if (steps.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {t('recipeDetail.instructions.noInstructions')}
        </Text>
      </View>
    );
  }

  const renderIngredientAvatars = (compId: string) => {
    const compIngredients = ingredients.filter(ing => ing.componentId === compId);
    if (compIngredients.length === 0) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.avatarsScroll}
        contentContainerStyle={styles.avatarsContent}
      >
        {compIngredients.map(ing => {
          const displayName = language === 'en' && ing.nameEn ? ing.nameEn : (ing.nameBg ?? ing.name);
          const quantityLabel = ing.quantity && ing.unit ? `${ing.quantity} ${ing.unit}` : '';
          return (
            <View key={ing.id} style={styles.avatarItem}>
              {ing.imageUrl ? (
                <Image
                  source={{ uri: ing.imageUrl }}
                  style={styles.avatarCircle}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.avatarCircle, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarEmoji}>🥄</Text>
                </View>
              )}
              {quantityLabel !== '' && (
                <Text style={styles.avatarQuantity} numberOfLines={1}>{quantityLabel}</Text>
              )}
              <Text style={styles.avatarName} numberOfLines={2}>{displayName}</Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderStep = (step: StepItem) => {
    if (!step.description && !step.imageUrl) return null;
    return (
      <View key={step.id} style={styles.stepItem}>
        <View style={styles.stepHeader}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepCircleText}>{step.stepNumber}</Text>
          </View>
          <Text style={styles.stepTitle}>
            {t('recipeDetail.instructions.step')} {step.stepNumber}
          </Text>
        </View>

        {step.imageUrl && (
          <Image
            source={{ uri: step.imageUrl }}
            style={styles.stepImage}
            resizeMode="cover"
          />
        )}

        {step.description && (
          <Text style={styles.stepDescription}>{step.description}</Text>
        )}

        {timerEnabled && step.durationMinutes && step.durationMinutes > 0 && (
          <TouchableOpacity
            onPress={() => onTimerPress?.(step.durationMinutes!)}
            style={styles.timerBtn}
          >
            <Ionicons name="timer-outline" size={14} color={Colors.text.inverse} />
            <Text style={styles.timerBtnText}>
              {step.durationMinutes} {language === 'bg' ? 'мин' : 'min'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // If we have component info, group steps by component
  if (components.length > 0) {
    const ungrouped = steps.filter(s => !s.componentId);
    return (
      <View style={styles.container}>
        {components.map(comp => {
          const compSteps = steps.filter(s => s.componentId === comp.id);
          if (compSteps.length === 0) return null;
          return (
            <View key={comp.id} style={styles.componentGroup}>
              <Text style={styles.componentLabel}>{comp.roleName}</Text>
              {renderIngredientAvatars(comp.id)}
              {compSteps.map(renderStep)}
            </View>
          );
        })}
        {ungrouped.length > 0 && ungrouped.map(renderStep)}
      </View>
    );
  }

  // Fallback: render all steps flat
  return (
    <View style={styles.container}>
      {steps.map(renderStep)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  componentGroup: {
    marginBottom: Spacing.xl,
  },
  componentLabel: {
    ...Typography.h3,
    color: Colors.primary.main,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  avatarsScroll: {
    marginBottom: Spacing.md,
  },
  avatarsContent: {
    gap: Spacing.md,
    paddingRight: Spacing.base,
  },
  avatarItem: {
    alignItems: 'center',
    width: 72,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.primary.opacity[10],
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  avatarQuantity: {
    ...Typography.caption,
    color: Colors.primary.main,
    fontWeight: '600',
    fontSize: 10,
    textAlign: 'center',
  },
  avatarName: {
    ...Typography.caption,
    color: Colors.text.primary,
    fontSize: 10,
    textAlign: 'center',
  },
  stepItem: {
    marginBottom: Spacing.xl,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  stepCircleText: {
    ...Typography.body1,
    fontWeight: '700',
    color: Colors.text.inverse,
    fontSize: 14,
  },
  stepTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    flex: 1,
  },
  stepImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  stepDescription: {
    ...Typography.body1,
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  timerBtnText: {
    ...Typography.caption,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
});
