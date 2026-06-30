import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';

export interface CookingComponent {
  id: string;
  name: string;
  roleName: string;
  icon: string;
  color: string;
  imageUrl?: string | null;
  steps: CookingStep[];
}

export interface CookingStep {
  id: string;
  stepNumber: number;
  description: string;
  imageUrl?: string | null;
  durationMinutes?: number | null;
  equipmentNeeded?: number[];
  ingredientsUsed?: string[];
  ingredientsUsedIds?: string[];
}

interface CookingModeComponentSelectorProps {
  components: CookingComponent[];
  onSelectComponent: (component: CookingComponent) => void;
  onClose: () => void;
}

export function CookingModeComponentSelector({
  components,
  onSelectComponent,
  onClose,
}: CookingModeComponentSelectorProps) {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('cookingMode.selectComponent')}</Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="close" size={24} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {components.map((comp) => (
          <TouchableOpacity
            key={comp.id}
            style={[styles.card, { borderColor: comp.color }]}
            onPress={() => onSelectComponent(comp)}
            activeOpacity={0.8}
          >
            <View style={styles.cardLeft}>
              {comp.imageUrl ? (
                <Image source={{ uri: comp.imageUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.icon}>{comp.icon}</Text>
                </View>
              )}
              <View style={styles.cardNameBlock}>
                <Text style={[styles.compName, { color: comp.color }]} numberOfLines={2}>
                  {comp.name}
                </Text>
                <Text style={styles.roleName} numberOfLines={1}>{comp.roleName}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <Text style={[styles.stepCount, { color: comp.color }]}>
                {comp.steps.length}
              </Text>
              <Text style={styles.stepLabel}>{t('cookingMode.steps')}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
    minWidth: 0,
  },
  cardNameBlock: {
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.background.tertiary,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 36,
  },
  compName: {
    fontSize: 14,
    fontWeight: '700',
  },
  roleName: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'center',
    minWidth: 52,
    flexShrink: 0,
  },
  stepCount: {
    ...Typography.h3,
    fontWeight: '700',
  },
  stepLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
});
