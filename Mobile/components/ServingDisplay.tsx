import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography, Spacing } from '../constants/Theme';

export interface ServingContainerInfo {
  id: number;
  name: string;
  name_en?: string | null;
  serving_container_type: string;
}

interface ServingDisplayProps {
  totalServings: number;
  servingContainer?: ServingContainerInfo | null;
  caloriesPerServing?: number;
  language?: 'en' | 'bg';
}

export default function ServingDisplay({
  totalServings,
  servingContainer,
  caloriesPerServing,
  language = 'en',
}: ServingDisplayProps) {

  const calLabel = language === 'bg' ? 'кк на порция' : 'kcal per serving';

  if (!servingContainer) {
    return (
      <View style={styles.container}>
        <Text style={styles.count}>
          {totalServings} {language === 'bg' ? 'порции' : 'servings'}
        </Text>
        {caloriesPerServing != null && caloriesPerServing > 0 && (
          <Text style={styles.sub}>~{caloriesPerServing} {calLabel}</Text>
        )}
      </View>
    );
  }

  const name = language === 'bg'
    ? servingContainer.name
    : (servingContainer.name_en || servingContainer.name);


  switch (servingContainer.serving_container_type) {
    case 'pan':
      return (
        <View style={styles.container}>
          <Text style={styles.count}>{totalServings} {language === 'bg' ? 'резена' : 'slices'}</Text>
          <Text style={styles.sub}>{language === 'bg' ? 'от' : 'from'} {name}</Text>
          {caloriesPerServing != null && caloriesPerServing > 0 && (
            <Text style={styles.sub}>~{caloriesPerServing} {calLabel}</Text>
          )}
        </View>
      );

    case 'glass':
    case 'cup':
    case 'ramekin':
    case 'jar':
    case 'bowl':
      return (
        <View style={styles.container}>
          <Text style={styles.count}>{totalServings} {name}</Text>
          {caloriesPerServing != null && caloriesPerServing > 0 && (
            <Text style={styles.sub}>~{caloriesPerServing} {language === 'bg' ? 'кк на' : 'kcal /'} {name}</Text>
          )}
        </View>
      );

    case 'plate':
      return (
        <View style={styles.container}>
          <Text style={styles.count}>{totalServings} {language === 'bg' ? 'чинии' : 'plates'}</Text>
          {caloriesPerServing != null && caloriesPerServing > 0 && (
            <Text style={styles.sub}>~{caloriesPerServing} {calLabel}</Text>
          )}
        </View>
      );

    default:
      return (
        <View style={styles.container}>
          <Text style={styles.count}>{totalServings} {name}</Text>
          {caloriesPerServing != null && caloriesPerServing > 0 && (
            <Text style={styles.sub}>~{caloriesPerServing} {calLabel}</Text>
          )}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  count: {
    fontSize: Typography.body1.fontSize,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  sub: {
    fontSize: Typography.caption.fontSize,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
});
