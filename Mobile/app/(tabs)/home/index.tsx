import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/Colors';
import { Typography, Spacing, BorderRadius, Shadows, IconSize } from '../../../constants/Theme';
import SectionHeader from '../../../components/SectionHeader';
import FilterChip from '../../../components/FilterChip';
import EmptyState from '../../../components/EmptyState';
import { useTranslation } from '../../../constants/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ROLE_FALLBACK_ICONS: Record<number, React.ComponentProps<typeof Ionicons>['name']> = {
  1: 'layers-outline',
  2: 'color-palette-outline',
  3: 'heart-outline',
  4: 'sparkles-outline',
};

export default function HomeScreen() {
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const { t, language } = useTranslation();

  // ─── QUERY 1: Десерт на деня (случаен, детерминиран по дата) ───
  const todaySeed = useMemo(() => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }, []);

  const {
    data: dailyRecipe,
    isLoading: dailyLoading,
    isError: dailyError,
    refetch: refetchDaily,
  } = useQuery({
    queryKey: ['dailyDelight', todaySeed],
    staleTime: Infinity, // не се рефрешва до края на сесията
    queryFn: async () => {
      const { data: ids } = await supabase
        .from('ready_recipes')
        .select('id')
        .eq('is_visible_to_users', true);

      if (!ids || ids.length === 0) {
        const { data: allIds } = await supabase
          .from('ready_recipes')
          .select('id');
        if (!allIds || allIds.length === 0) return null;
        const idx2 = todaySeed % allIds.length;
        const { data: fallbackData } = await supabase
          .from('ready_recipes')
          .select('*')
          .eq('id', allIds[idx2].id)
          .single();
        return fallbackData || null;
      }

      // Детерминиран псевдо-случаен индекс по дата
      const idx = todaySeed % ids.length;
      const pickedId = ids[idx].id;

      const { data } = await supabase
        .from('ready_recipes')
        .select('*')
        .eq('id', pickedId)
        .single();

      return data || null;
    },
  });

  // ─── QUERY 2: Твоите рецепти ───
  const { data: userRecipes } = useQuery({
    queryKey: ['homeUserRecipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_recipes')
        .select('id, name, dessert_type_id, created_at, selected_components, user_image_url')
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
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
    queryKey: ['decorationImages', decorationIds],
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

  // ─── QUERY 3: Типове десерти за pills ───
  const { data: dessertTypes } = useQuery({
    queryKey: ['dessertTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dessert_types')
        .select('id, name, name_en, image_url')
        .order('id');
      if (error) throw error;
      return data || [];
    },
  });

  // ─── QUERY 3б: Recipe roles (за секция "Създай шедьовър") ───
  const { data: recipeRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['recipeRoles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_roles')
        .select('id, name, name_en, image_url')
        .order('id');
      if (error) throw error;
      return data || [];
    },
  });

  // ─── QUERY 4: Готови рецепти (с филтър по тип) ───
  const {
    data: readyRecipes,
    isLoading: readyLoading,
  } = useQuery({
    queryKey: ['readyRecipes', selectedTypeId],
    queryFn: async () => {
      let query = supabase
        .from('ready_recipes')
        .select('id, name_bg, name_en, hero_image_url, total_calories, total_net_carbs, total_servings, dessert_type_id')
        .order('created_at', { ascending: false })
        .limit(8);

      if (selectedTypeId) {
        query = query.eq('dessert_type_id', selectedTypeId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ─── СЕКЦИЯ 1: HEADER ─── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('home.greeting')}</Text>
          <TouchableOpacity style={styles.bellButton}>
            <Ionicons
              name="notifications-outline"
              size={IconSize.md}
              color={Colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* ─── СЕКЦИЯ 2: ДЕСЕРТ НА ДЕНЯ ─── */}
        <View style={styles.section}>
          <SectionHeader title={t('home.hero.title')} />

          {dailyLoading ? (
            <View style={styles.dailySkeleton}>
              <ActivityIndicator color={Colors.primary.main} />
            </View>
          ) : dailyError ? (
            <EmptyState
              emoji="⚠️"
              title={t('home.error.title')}
              subtitle={t('home.error.failedToLoad')}
              actionLabel={t('common.retry')}
              onAction={() => refetchDaily()}
            />
          ) : dailyRecipe ? (
            <View style={styles.dailyCard}>
              {dailyRecipe.hero_image_url ? (
                <TouchableOpacity
                  onPress={() => router.push(`/recipe-detail/${dailyRecipe.id}`)}
                  activeOpacity={0.9}
                >
                  <ImageBackground
                    source={{ uri: dailyRecipe.hero_image_url }}
                    style={styles.dailyImage}
                    imageStyle={{ borderRadius: BorderRadius.xl }}
                    resizeMode="cover"
                  >
                    {/* Badge at top */}
                    <View style={styles.dailyBadgeContainer}>
                      <View style={styles.featuredBadge}>
                        <Ionicons name="sparkles" size={IconSize.xs} color={Colors.text.inverse} />
                        <Text style={styles.featuredBadgeText}>{t('home.featuredBadge')}</Text>
                      </View>
                    </View>
                    {/* Gradient only at bottom */}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.75)']}
                      style={styles.dailyOverlay}
                    >
                      <View style={styles.dailyInfo}>
                        <Text style={styles.dailyName} numberOfLines={2}>
                          {language === 'bg' ? dailyRecipe.name_bg : (dailyRecipe.name_en || dailyRecipe.name_bg)}
                        </Text>
                        {(dailyRecipe.description_bg || dailyRecipe.description_en) ? (
                          <Text style={styles.dailyDesc} numberOfLines={2}>
                            {language === 'bg' ? dailyRecipe.description_bg : (dailyRecipe.description_en || dailyRecipe.description_bg)}
                          </Text>
                        ) : null}
                        <TouchableOpacity
                          style={styles.dailyButton}
                          onPress={() => router.push(`/recipe-detail/${dailyRecipe.id}`)}
                        >
                          <Text style={styles.dailyButtonText}>{t('home.viewRecipe')}</Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.dailyPlaceholder}
                  onPress={() => router.push(`/recipe-detail/${dailyRecipe.id}`)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.dailyPlaceholderEmoji}>🎂</Text>
                  <Text style={styles.dailyNameDark} numberOfLines={2}>
                    {language === 'bg' ? dailyRecipe.name_bg : (dailyRecipe.name_en || dailyRecipe.name_bg)}
                  </Text>
                  {(dailyRecipe.description_bg || dailyRecipe.description_en) ? (
                    <Text style={styles.dailyDescDark} numberOfLines={2}>
                      {language === 'bg' ? dailyRecipe.description_bg : (dailyRecipe.description_en || dailyRecipe.description_bg)}
                    </Text>
                  ) : null}
                  <TouchableOpacity
                    style={styles.dailyButton}
                    onPress={() => router.push(`/recipe-detail/${dailyRecipe.id}`)}
                  >
                    <Text style={styles.dailyButtonText}>{t('home.viewRecipe')}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <EmptyState
              emoji="🎂"
              title={t('home.noDessert.title')}
              subtitle={t('home.noDessert.subtitle')}
            />
          )}
        </View>

        {/* ─── СЕКЦИЯ 3: СЪЗДАЙ ШЕДЬОВЪР ─── */}
        <View style={styles.section}>
          <SectionHeader title={t('home.createMasterpiece')} />

          <View style={styles.rolesGrid}>
            {rolesLoading
              ? [1, 2, 3, 4].map((i) => (
                  <View key={i} style={[styles.roleCard, styles.roleCardSkeleton]} />
                ))
              : (recipeRoles || []).map((role) => (
                  <View key={role.id} style={styles.roleCard}>
                    {role.image_url ? (
                      <Image
                        source={{ uri: role.image_url }}
                        style={styles.roleImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.roleIconCircle}>
                        <Ionicons
                          name={ROLE_FALLBACK_ICONS[role.id] ?? 'image-outline'}
                          size={IconSize.md}
                          color={Colors.primary.main}
                        />
                      </View>
                    )}
                    <Text style={styles.roleName}>
                      {language === 'bg' ? role.name : (role.name_en || role.name)}
                    </Text>
                  </View>
                ))}
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(modals)/visual-recipe-builder')}
          >
            <Ionicons name="add-circle-outline" size={IconSize.sm} color={Colors.text.inverse} />
            <Text style={styles.createButtonText}>{t('home.startCreating')}</Text>
          </TouchableOpacity>
        </View>

        {/* ─── СЕКЦИЯ 4: ТВОИТЕ РЕЦЕПТИ — само ако има рецепти ─── */}
        {userRecipes && userRecipes.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={t('home.yourCreations')}
              actionText={t('common.viewAll')}
              onAction={() => router.push('/(tabs)/create')}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {userRecipes.map((recipe) => {
                const comps = (recipe.selected_components as any[]) || [];
                const decor = comps.find((c: any) => c.recipe_role_id === 4);
                const imageUrl = (recipe as any).user_image_url
                  || (decor ? decorImageMap.get(decor.base_recipe_id) : null);
                return (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.userRecipeCard}
                    onPress={() => router.push(`/user-recipe/${recipe.id}`)}
                  >
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.userRecipeImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.userRecipeImagePlaceholder}>
                        <Ionicons name="layers-outline" size={IconSize.lg} color={Colors.primary.main} />
                      </View>
                    )}
                    <Text style={styles.userRecipeName} numberOfLines={2}>{recipe.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ─── СЕКЦИЯ 5: ГОТОВИ РЕЦЕПТИ ПО ТИП ─── */}
        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader title={t('home.quickActions.readyRecipes.title')} />

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            <FilterChip
              label={t('common.all')}
              active={selectedTypeId === null}
              onPress={() => setSelectedTypeId(null)}
            />
            {(dessertTypes || []).map((type) => (
              <FilterChip
                key={type.id}
                label={language === 'bg' ? type.name : (type.name_en || type.name)}
                active={selectedTypeId === type.id}
                onPress={() => setSelectedTypeId(type.id)}
              />
            ))}
          </ScrollView>

          {/* Grid */}
          {readyLoading ? (
            <ActivityIndicator
              color={Colors.primary.main}
              style={{ marginVertical: Spacing.lg }}
            />
          ) : (readyRecipes || []).length === 0 ? (
            <EmptyState
              emoji="🔍"
              title={t('home.noRecipes.title')}
              subtitle={t('common.noResults')}
            />
          ) : (
            <View>
              <View style={styles.grid}>
                {(readyRecipes || []).map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.readyRecipeCard}
                    onPress={() => router.push(`/recipe-detail/${recipe.id}`)}
                  >
                    {recipe.hero_image_url ? (
                      <Image
                        source={{ uri: recipe.hero_image_url }}
                        style={styles.readyRecipeImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.readyRecipeImagePlaceholder}>
                        <Text style={styles.readyRecipeEmoji}>🎂</Text>
                      </View>
                    )}
                    <View style={styles.readyRecipeInfo}>
                      <Text style={styles.readyRecipeName} numberOfLines={2}>
                        {language === 'bg' ? recipe.name_bg : (recipe.name_en || recipe.name_bg)}
                      </Text>
                      {recipe.total_calories ? (() => {
                        const servings = recipe.total_servings || 8;
                        const calPerServing = Math.round(recipe.total_calories / servings);
                        const ncPerServing = recipe.total_net_carbs
                          ? Math.round(recipe.total_net_carbs / servings)
                          : null;
                        return (
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
                        );
                      })() : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              {/* View all button */}
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => router.push('/all-recipes')}
              >
                <Text style={styles.viewAllBtnText}>{t('common.viewAll')}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary.main} />
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingBottom: Spacing['4xl'],
  },

  // ─── Header ───
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background.primary,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  bellButton: {
    padding: Spacing.sm,
  },

  // ─── Sections ───
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  lastSection: {
    marginBottom: 0,
  },

  // ─── Daily Delight ───
  dailySkeleton: {
    height: 280,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  dailyImage: {
    width: '100%',
    height: 280,
  },
  dailyBadgeContainer: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
  },
  dailyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    gap: Spacing.xs,
  },
  featuredBadgeText: {
    ...Typography.caption,
    color: Colors.text.inverse,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dailyInfo: {
    gap: Spacing.sm,
  },
  dailyName: {
    ...Typography.h3,
    color: Colors.text.inverse,
  },
  dailyDesc: {
    ...Typography.body2,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  dailyButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xs,
  },
  dailyButtonText: {
    ...Typography.button,
    color: Colors.text.inverse,
    letterSpacing: 0.5,
  },
  dailyPlaceholder: {
    height: 280,
    backgroundColor: Colors.background.accent,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  dailyPlaceholderEmoji: {
    fontSize: 64,
  },
  dailyNameDark: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  dailyDescDark: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // ─── Creator Roles Grid ───
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  roleCard: {
    width: (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  roleImage: {
    width: 106,
    height: 106,
    borderRadius: BorderRadius.lg,
  },
  roleIconCircle: {
    width: 106,
    height: 106,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary.opacity[10],
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardSkeleton: {
    height: 110,
    backgroundColor: Colors.background.secondary,
  },
  roleName: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  createButtonText: {
    ...Typography.button,
    color: Colors.text.inverse,
    letterSpacing: 0.5,
  },

  // ─── Horizontal List ───
  horizontalList: {
    paddingRight: Spacing.xl,
    gap: Spacing.md,
  },
  createNewCard: {
    width: 180,
    height: 240,
    backgroundColor: Colors.background.accent,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  createNewText: {
    ...Typography.body2,
    color: Colors.primary.main,
    fontWeight: '600',
  },

  // ─── User Recipe Cards ───
  userRecipeCard: {
    width: 180,
    height: 240,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  userRecipeImage: {
    flex: 1,
    width: '100%',
  },
  userRecipeImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.opacity[10],
  },
  userRecipeName: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: '600',
    padding: Spacing.sm,
  },
  noCreationsCard: {
    width: 180,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  noCreationsText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // ─── Filter Pills ───
  pillsRow: {
    paddingBottom: Spacing.base,
  },

  // ─── Ready Recipes Grid ───
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  readyRecipeCard: {
    width: (SCREEN_WIDTH - Spacing.xl * 2 - Spacing.md) / 2,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  readyRecipeImage: {
    width: '100%',
    height: 120,
  },
  readyRecipeImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.background.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyRecipeEmoji: {
    fontSize: 40,
  },
  readyRecipeInfo: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  readyRecipeName: {
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
    ...Typography.caption,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  netCarbsText: {
    ...Typography.caption,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  perServingLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontSize: 9,
    marginTop: 1,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  viewAllBtnText: {
    ...Typography.body2,
    color: Colors.primary.main,
    fontWeight: '600',
  },
});
