import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { BorderRadius, Shadows, Spacing, Typography } from '../../constants/Theme';
import { useTranslation } from '../../constants/i18n';
import { supabase } from '../../lib/supabase';
import RecipeCard from '../../components/RecipeCard';

interface ReadyRecipeRow {
  id: string;
  name_bg: string;
  name_en: string | null;
  hero_image_url: string | null;
  selected_components: Array<{ base_recipe_id: string; recipe_role_id: number; order_index: number; multiplier: number }> | null;
}

export default function RecipesByRoleScreen() {
  const { linkedBaseRecipeId, componentName } = useLocalSearchParams<{
    linkedBaseRecipeId: string;
    componentName: string;
  }>();
  const { language } = useTranslation();

  const [recipes, setRecipes] = useState<ReadyRecipeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!linkedBaseRecipeId) { setLoading(false); return; }

    supabase
      .from('ready_recipes')
      .select('id, name_bg, name_en, hero_image_url, selected_components')
      .eq('status', 'published')
      .order('name_bg')
      .then(({ data }) => {
        // Client-side JSONB filter: keep only recipes that include this component
        // (dataset is small ~1-25 rows; revisit with server-side @> if catalog grows large)
        const filtered = (data || []).filter((r) =>
          (r.selected_components as any[])?.some(
            (c: any) => c.base_recipe_id === linkedBaseRecipeId
          )
        );
        setRecipes(filtered);
      })
      .finally(() => setLoading(false));
  }, [linkedBaseRecipeId]);

  const isBg = language === 'bg';
  const title = componentName
    ? (isBg ? `Торти с ${componentName}` : `Cakes with ${componentName}`)
    : (isBg ? 'Рецепти' : 'Recipes');

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary.main} size="large" />
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🎂</Text>
          <Text style={styles.emptyText}>
            {isBg
              ? 'Все още няма публикувани торти с този компонент — ще се появят тук съвсем скоро.'
              : 'No published cakes with this component yet — check back soon.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <RecipeCard
                recipe={{
                  id: item.id,
                  name_bg: item.name_bg,
                  name_en: item.name_en || item.name_bg,
                  hero_image_url: item.hero_image_url ?? undefined,
                }}
                onPress={() => router.push(`/recipe-detail/${item.id}`)}
                size="small"
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background.tertiary,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...Typography.h4,
    color: Colors.text.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  list: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  row: {
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '48%',
  },
});
