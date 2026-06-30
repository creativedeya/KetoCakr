import React from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../constants/Theme';

interface Recipe {
  id: string;
  name_bg?: string;
  name_en?: string;
  hero_image_url?: string;
  total_calories?: number;
  total_net_carbs?: number;
  total_servings?: number;
}

interface RecipesGridProps {
  recipes: Recipe[];
  isLoading: boolean;
  language: 'en' | 'bg';
}

export const RecipesGrid = ({ recipes, isLoading, language }: RecipesGridProps) => {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  if (recipes.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyEmoji}>🔍</Text>
        <Text style={styles.emptyText}>
          {language === 'bg' ? 'Няма резултати' : 'No results'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const servings = item.total_servings || 8;
        const cal = item.total_calories ? Math.round(item.total_calories / servings) : null;
        const nc = item.total_net_carbs ? Math.round(item.total_net_carbs / servings) : null;
        const name = language === 'bg'
          ? (item.name_bg || item.name_en || '—')
          : (item.name_en || item.name_bg || '—');

        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/recipe-detail/[id]', params: { id: item.id } })}
            activeOpacity={0.85}
          >
            {item.hero_image_url ? (
              <Image source={{ uri: item.hero_image_url }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Text style={styles.placeholderEmoji}>🎂</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.recipeName} numberOfLines={2}>{name}</Text>
              {cal !== null && (
                <Text style={styles.nutrition}>
                  {cal} {language === 'bg' ? 'кал' : 'cal'}
                  {nc !== null ? ` · ${nc}g NC` : ''}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      }}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      contentContainerStyle={styles.gridContent}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  gridContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 40,
  },
  gridRow: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  image: {
    width: '100%',
    height: 120,
  },
  imagePlaceholder: {
    backgroundColor: Colors.background.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  info: {
    padding: Spacing.sm,
  },
  recipeName: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  nutrition: {
    fontSize: 11,
    color: Colors.primary.main,
    fontWeight: '600',
  },
});
