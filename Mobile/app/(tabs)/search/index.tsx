// ===========================================================
// SEARCH SCREEN — Filters + Recipe Grid
// ===========================================================
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../../constants/Theme';
import { useTranslation } from '../../../constants/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2;

type Range = [number, number] | null;

const CALORIE_OPTIONS: { label: string; range: Range }[] = [
  { label: 'all',    range: null },
  { label: '< 100',  range: [0, 100] },
  { label: '100-150', range: [100, 150] },
  { label: '150-200', range: [150, 200] },
  { label: '200+',   range: [200, Infinity] },
];

const NET_CARB_OPTIONS: { label: string; range: Range }[] = [
  { label: 'all',   range: null },
  { label: '< 3g',  range: [0, 3] },
  { label: '3-5g',  range: [3, 5] },
  { label: '5-10g', range: [5, 10] },
  { label: '10g+',  range: [10, Infinity] },
];

export default function SearchScreen() {
  const { t, language } = useTranslation();

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDessertType, setSelectedDessertType] = useState<number | null>(null);
  const [calRange, setCalRange] = useState<Range>(null);
  const [ncRange, setNcRange] = useState<Range>(null);

  // Debounce search 300ms
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ─── Рецепти (всички, filtrira client-side) ───
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['searchRecipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ready_recipes')
        .select('id, name_bg, name_en, hero_image_url, dessert_type_id, total_calories, total_net_carbs, total_servings, difficulty_level')
        .order('name_bg');
      if (error) throw error;
      return data || [];
    },
  });

  // ─── Типове десерти за chips ───
  const { data: dessertTypes } = useQuery({
    queryKey: ['dessertTypesSearch'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dessert_types')
        .select('id, name, name_en, image_url')
        .order('id');
      if (error) throw error;
      return data || [];
    },
  });

  // ─── Комбиниран client-side filter ───
  const filteredRecipes = useMemo(() => {
    let result = recipes || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        (r.name_bg?.toLowerCase().includes(q)) ||
        (r.name_en?.toLowerCase().includes(q))
      );
    }

    if (selectedDessertType !== null) {
      result = result.filter(r => r.dessert_type_id === selectedDessertType);
    }

    if (calRange) {
      result = result.filter(r => {
        const perServing = (r.total_calories || 0) / (r.total_servings || 8);
        return perServing >= calRange[0] && perServing < calRange[1];
      });
    }

    if (ncRange) {
      result = result.filter(r => {
        const perServing = (r.total_net_carbs || 0) / (r.total_servings || 8);
        return perServing >= ncRange[0] && perServing < ncRange[1];
      });
    }

    return result;
  }, [recipes, searchQuery, selectedDessertType, calRange, ncRange]);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('search.title')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Search Bar ─── */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={Colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            value={searchInput}
            onChangeText={setSearchInput}
            placeholder={t('allRecipes.searchPlaceholder')}
            placeholderTextColor={Colors.text.tertiary}
            style={styles.searchInput}
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchInput(''); setSearchQuery(''); }}>
              <Ionicons name="close-circle" size={18} color={Colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* ─── Filter: Тип десерт ─── */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('search.filters.dessertType')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            <TouchableOpacity
              onPress={() => setSelectedDessertType(null)}
              style={[styles.chip, selectedDessertType === null && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedDessertType === null && styles.chipTextActive]}>
                {t('search.filters.all')}
              </Text>
            </TouchableOpacity>
            {(dessertTypes || []).map(dt => (
              <TouchableOpacity
                key={dt.id}
                onPress={() => setSelectedDessertType(selectedDessertType === dt.id ? null : dt.id)}
                style={[styles.chip, selectedDessertType === dt.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedDessertType === dt.id && styles.chipTextActive]}>
                  {language === 'en' ? (dt.name_en || dt.name) : dt.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Filter: Калории ─── */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('search.filters.calories')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {CALORIE_OPTIONS.map((opt) => {
              const isActive = calRange === opt.range ||
                (calRange !== null && opt.range !== null &&
                  calRange[0] === opt.range[0] && calRange[1] === opt.range[1]);
              return (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => setCalRange(opt.range)}
                  style={[styles.chip, isActive && styles.chipActive]}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {opt.label === 'all' ? t('search.filters.all') : opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── Filter: Net Carbs ─── */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('search.filters.netCarbs')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {NET_CARB_OPTIONS.map((opt) => {
              const isActive = ncRange === opt.range ||
                (ncRange !== null && opt.range !== null &&
                  ncRange[0] === opt.range[0] && ncRange[1] === opt.range[1]);
              return (
                <TouchableOpacity
                  key={opt.label}
                  onPress={() => setNcRange(opt.range)}
                  style={[styles.chip, isActive && styles.chipActive]}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {opt.label === 'all' ? t('search.filters.all') : opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── Резултати ─── */}
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={Colors.primary.main} size="large" />
          </View>
        ) : filteredRecipes.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>{t('common.noResults')}</Text>
          </View>
        ) : (
          <View style={styles.resultsSection}>
            <Text style={styles.resultCount}>
              {filteredRecipes.length} {t('search.results')}
            </Text>
            <View style={styles.grid}>
              {filteredRecipes.map((recipe) => {
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
                    onPress={() => router.push(`/recipe-detail/${recipe.id}`)}
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
                                <Text style={styles.netCarbsText}>{' · '}{ncPerServing}g NC</Text>
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
            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  scroll: {
    flex: 1,
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

  // Filter sections
  filterSection: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  chipsRow: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background.secondary,
  },
  chipActive: {
    backgroundColor: Colors.primary.main,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  chipTextActive: {
    color: Colors.text.inverse,
  },

  // Results
  resultsSection: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  resultCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },

  // Cards
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

  // Empty / loading
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },
});
