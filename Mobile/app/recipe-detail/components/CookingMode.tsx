import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Text, Image } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { Spacing } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';
import {
  CookingModeComponentSelector,
  CookingComponent,
} from './CookingModeComponentSelector';
import { CookingModeHeader } from './CookingModeHeader';
import { CookingModeImage } from './CookingModeImage';
import { CookingModeNavigationQuick } from './CookingModeNavigationQuick';
import { StepInstructions } from './StepInstructions';
import { StepTimer } from './StepTimer';
import GoogleCloudTTSButton from './GoogleCloudTTSButton';
import { CookingModeNavigation } from './CookingModeNavigation';

// Color/icon palette — assigned by component index
const COMPONENT_PALETTE = [
  { icon: '🍰', color: '#A80048' },
  { icon: '🍶', color: '#8B5A8F' },
  { icon: '🍓', color: '#C0392B' },
  { icon: '✨', color: '#B2AC88' },
  { icon: '🔗', color: '#2980B9' },
  { icon: '🎂', color: '#27AE60' },
];

interface RawStep {
  id: string;
  stepNumber: number;
  description: string;
  imageUrl?: string | null;
  durationMinutes?: number | null;
  componentId?: string;
  equipmentNeeded?: number[];
  ingredientsUsed?: string[];
  ingredientsUsedIds?: string[];
}

interface RawComponent {
  id: string;
  name: string;
  roleName: string;
  imageUrl?: string | null;
}

interface RawEquipment {
  id: number;
  name: string;
  imageUrl?: string | null;
}

interface RawIngredient {
  id: string;       // recipe_ingredients PK (e.g. "4695" or "4695_0")
  name: string;
  imageUrl?: string | null;
  quantity?: number;
  unit?: string;
}

interface CookingModeProps {
  components: RawComponent[];
  steps: RawStep[];
  equipment?: RawEquipment[];
  ingredients?: RawIngredient[];
  onClose: () => void;
}

export function CookingMode({ components, steps, equipment = [], ingredients = [], onClose }: CookingModeProps) {
  const { t, language } = useTranslation();
  const [selectedComponent, setSelectedComponent] = useState<CookingComponent | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cookingComponents: CookingComponent[] = useMemo(() => {
    return components
      .map((comp, i) => {
        const compSteps = steps
          .filter((s) => s.componentId === comp.id)
          .sort((a, b) => a.stepNumber - b.stepNumber);

        if (compSteps.length === 0) return null;

        const palette = COMPONENT_PALETTE[i % COMPONENT_PALETTE.length];
        return {
          id: comp.id,
          name: comp.name,
          roleName: comp.roleName,
          icon: palette.icon,
          color: palette.color,
          imageUrl: comp.imageUrl,
          steps: compSteps,
        };
      })
      .filter((c): c is CookingComponent => c !== null);
  }, [components, steps]);

  if (!selectedComponent) {
    return (
      <CookingModeComponentSelector
        components={cookingComponents}
        onSelectComponent={(comp) => {
          setSelectedComponent(comp);
          setCurrentIndex(0);
        }}
        onClose={onClose}
      />
    );
  }

  const currentStep = selectedComponent.steps[currentIndex];

  const handleNext = () => {
    if (currentIndex < selectedComponent.steps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleComplete = () => {
    setSelectedComponent(null);
    setCurrentIndex(0);
  };

  const handleBack = () => {
    setSelectedComponent(null);
    setCurrentIndex(0);
  };

  const stepIngIds = currentStep.ingredientsUsedIds ?? currentStep.ingredientsUsed ?? [];
  const stepIngredients = stepIngIds.length > 0
    ? ingredients.filter(ing => stepIngIds.includes(ing.id))
    : [];

  const stepEquipment = equipment.filter(e =>
    (currentStep.equipmentNeeded ?? []).includes(e.id)
  );


  return (
    <SafeAreaView style={styles.safeArea}>
      <CookingModeHeader
        currentStep={currentIndex + 1}
        totalSteps={selectedComponent.steps.length}
        componentName={selectedComponent.name}
        accentColor={selectedComponent.color}
        onBack={handleBack}
        onClose={onClose}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Step image */}
        <CookingModeImage
          imageUrl={currentStep.imageUrl}
          stepNumber={currentStep.stepNumber}
        />

        {/* Per-step ingredients */}
        {stepIngredients.length > 0 && (
          <View style={styles.avatarSection}>
            <Text style={styles.avatarSectionLabel}>
              {t('cookingMode.ingredients')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarRow}
            >
              {stepIngredients.map(ing => (
                <View key={ing.id} style={styles.avatarItem}>
                  {ing.imageUrl ? (
                    <Image
                      source={{ uri: ing.imageUrl }}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarEmoji}>🥚</Text>
                    </View>
                  )}
                  {ing.quantity != null && (
                    <Text style={styles.avatarQty} numberOfLines={1}>
                      {ing.quantity} {ing.unit}
                    </Text>
                  )}
                  <Text style={styles.avatarName} numberOfLines={2}>{ing.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Per-step equipment */}
        {stepEquipment.length > 0 && (
          <View style={styles.avatarSection}>
            <Text style={styles.avatarSectionLabel}>
              {t('cookingMode.equipment')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.avatarRow}
            >
              {stepEquipment.map(eq => (
                <View key={eq.id} style={styles.avatarItem}>
                  {eq.imageUrl ? (
                    <Image
                      source={{ uri: eq.imageUrl }}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarEmoji}>🍳</Text>
                    </View>
                  )}
                  <Text style={styles.avatarName} numberOfLines={2}>{eq.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ⏱ Timer — shown if step has duration */}
        {(currentStep.durationMinutes ?? 0) > 0 && (
          <View style={styles.timerSection}>
            <StepTimer durationMinutes={currentStep.durationMinutes!} />
          </View>
        )}

        {/* 🔊 Voice — prominent, before navigation */}
        <View style={styles.voiceSection}>
          <GoogleCloudTTSButton
            text={currentStep.description}
            language={language}
            accentColor={selectedComponent.color}
          />
        </View>

        {/* ← Navigation + step text */}
        <View style={styles.details}>
          <CookingModeNavigationQuick
            currentIndex={currentIndex}
            totalSteps={selectedComponent.steps.length}
            accentColor={selectedComponent.color}
            onNext={handleNext}
            onPrev={handlePrev}
          />

          <StepInstructions
            stepNumber={currentStep.stepNumber}
            description={currentStep.description}
            accentColor={selectedComponent.color}
          />
        </View>
      </ScrollView>

      <CookingModeNavigation
        currentIndex={currentIndex}
        totalSteps={selectedComponent.steps.length}
        accentColor={selectedComponent.color}
        onNext={handleNext}
        onPrev={handlePrev}
        onComplete={handleComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  timerSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.background.secondary,
  },
  voiceSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.background.secondary,
  },
  details: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  avatarSection: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.background.secondary,
  },
  avatarSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  avatarRow: {
    gap: Spacing.md,
    paddingRight: Spacing.base,
  },
  avatarItem: {
    alignItems: 'center',
    width: 80,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.background.secondary,
    overflow: 'hidden',
  },
  avatarFallback: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 26,
  },
  avatarQty: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary.main,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 2,
  },
  avatarName: {
    fontSize: 10,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 13,
  },
});
