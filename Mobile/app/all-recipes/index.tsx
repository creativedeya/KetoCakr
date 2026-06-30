// ===========================================================
// All Recipes Screen — пълен списък с търсене
// ===========================================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows, IconSize } from '../../constants/Theme';
import { useTranslation } from '../../constants/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2;

export default function AllRecipesScreen() {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['allReadyRecipes', debouncedQuery, language],
    queryFn: async () => {
      let q = supabase
        .from('ready_recipes')
        .select('id, name_bg, name_en, hero_image_url, total_calories, total_net_carbs, total_servings')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (debouncedQuery.trim()) {
        if (language === 'en') {
          q = q.ilike('name_en', `%${debouncedQuery.trim()}%`);
        } else {
          q = q.ilike('name_bg', `%${debouncedQuery.trim()}%`);
        }
      }

      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('allRecipes.title')}</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={Colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('allRecipes.searchPlaceholder')}
            placeholderTextColor={Colors.text.tertiary}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
              <Ionicons name="close-circle" size={18} color={Colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Grid */}
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.primary.main} />
          </View>
        ) : (recipes || []).length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>{t('common.noResults')}</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContent}
          >
            <View style={styles.grid}>
              {(recipes || []).map((recipe) => {
                const servings = recipe.total_servings || 8;
                const calPerServing = recipe.total_calories
                  ? Math.round(recipe.total_calories / servings)
                  : null;
                const ncPerServing = recipe.total_net_carbs
                  ? Math.round(recipe.total_net_carbs / servings)
                  : null;
                return (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.card}
                    onPress={() => router.push({ pathname: '/recipe-detail/[id]', params: { id: recipe.id } })}
                  >
                    {recipe.hero_image_url ? (
                      <Image
                        source={{ uri: recipe.hero_image_url }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.cardImagePlaceholder}>
                        <Text style={styles.cardEmoji}>🎂</Text>
                      </View>
                    )}
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName} numberOfLines={2}>
                        {language === 'bg' ? recipe.name_bg : (recipe.name_en || recipe.name_bg)}
                      </Text>
                      {calPerServing !== null && (
                        <View>
                          <View style={styles.caloriesBadge}>
                            <Text style={styles.caloriesText}>
                              {calPerServing} {language === 'bg' ? 'кал' : 'cal'}
                              {ncPerServing !== null ? (
                                <Text style={styles.netCarbsText}>
                                  {' · '}{ncPerServing}g {language === 'bg' ? 'НВ' : 'NC'}
                                </Text>
                              ) : null}
                            </Text>
                          </View>
                          <Text style={styles.perServingLabel}>
                            {language === 'bg' ? 'на порция' : 'per serving'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backBtn: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
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
  searchClear: {
    padding: Spacing.xs,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
  gridContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['4xl'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.background.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 40,
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
  caloriesBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary.opacity[10],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  caloriesText: {
    fontSize: 10,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  netCarbsText: {
    fontSize: 10,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  perServingLabel: {
    fontSize: 9,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
});
