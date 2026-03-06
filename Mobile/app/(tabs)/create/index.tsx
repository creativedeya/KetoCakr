// ===========================================================
// CREATE SCREEN - My Creations grid + FAB
// ===========================================================
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2;

export default function CreateScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── QUERY 1: Всички user recipes ───
  const { data: userRecipes } = useQuery({
    queryKey: ['userRecipesCreate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_recipes')
        .select('id, name, dessert_type_id, created_at, selected_components, user_image_url, total_servings')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchOnMount: 'always',
  });

  // ─── DECORATION IMAGE MAP ───
  const decorationIds = useMemo(() => {
    if (!userRecipes || userRecipes.length === 0) return [] as string[];
    return userRecipes
      .map(ur => {
        const comps = (ur.selected_components as any[]) || [];
        const decor = comps.find((c: any) => c.recipe_role_id === 4);
        return decor?.base_recipe_id as string | undefined;
      })
      .filter((id): id is string => !!id);
  }, [userRecipes]);

  const { data: decorRecipes } = useQuery({
    queryKey: ['decorationImagesCreate', decorationIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('base_recipes')
        .select('id, image_url')
        .in('id', decorationIds);
      if (error) throw error;
      return data || [];
    },
    enabled: decorationIds.length > 0,
  });

  const decorImageMap = useMemo(
    () => new Map((decorRecipes || []).map((r: any) => [r.id, r.image_url])),
    [decorRecipes]
  );

  const getRecipeImage = (recipe: any): string | null => {
    if (recipe.user_image_url) return recipe.user_image_url;
    const comps = (recipe.selected_components as any[]) || [];
    const decor = comps.find((c: any) => c.recipe_role_id === 4);
    if (decor) return decorImageMap.get(decor.base_recipe_id) || null;
    return null;
  };

  const filteredRecipes = useMemo(() => {
    if (!userRecipes) return [];
    if (!debouncedQuery.trim()) return userRecipes;
    const q = debouncedQuery.trim().toLowerCase();
    return userRecipes.filter(r => r.name?.toLowerCase().includes(q));
  }, [userRecipes, debouncedQuery]);

  const handleCreateNew = () => {
    router.push('/(modals)/visual-recipe-builder');
  };

  const hasRecipes = userRecipes && userRecipes.length > 0;

  return (
    <View style={styles.screen}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('create.title')}</Text>
      </View>

      {hasRecipes ? (
        /* ─── Grid з рецепти ─── */
        <>
          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color={Colors.text.tertiary} style={styles.searchIcon} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('create.searchPlaceholder')}
              placeholderTextColor={Colors.text.tertiary}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {filteredRecipes.map((recipe) => {
            const imageUrl = getRecipeImage(recipe);
            return (
              <TouchableOpacity
                key={recipe.id}
                style={styles.card}
                onPress={() => router.push(`/user-recipe/${recipe.id}`)}
              >
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.cardImagePlaceholder}>
                    <Text style={styles.cardEmoji}>🎂</Text>
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={2}>{recipe.name}</Text>
                  <Text style={styles.cardServings}>
                    {recipe.total_servings} {t('create.servings')}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        </>
      ) : (
        /* ─── Empty State ─── */
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🧩</Text>
          <Text style={styles.emptyTitle}>{t('create.emptyState.title')}</Text>
          <Text style={styles.emptyDesc}>{t('create.emptyState.description')}</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleCreateNew}>
            <Ionicons name="add" size={20} color={Colors.text.inverse} />
            <Text style={styles.emptyButtonText}>{t('create.emptyState.button')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── FAB — винаги видим ─── */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateNew}>
        <Ionicons name="add" size={30} color={Colors.text.inverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.text.primary,
  },

  // Grid
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: 100,
  },

  // Recipe card
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.background.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 48,
  },
  cardInfo: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  cardName: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  cardServings: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl * 2,
    paddingBottom: 100,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyDesc: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.round,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyButtonText: {
    ...Typography.button,
    color: Colors.text.inverse,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    width: 60,
    height: 60,
    backgroundColor: Colors.primary.main,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
});
