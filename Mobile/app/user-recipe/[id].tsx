// ===========================================================
// User Recipe Screen — зарежда от user_recipes + base_recipes
// UI рендерира чрез споделения RecipeDetailView компонент
// ===========================================================
import { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { useTranslation } from '../../constants/i18n';
import RecipeDetailView from '../../components/RecipeDetailView';

export default function UserRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, t } = useTranslation();

  const { data: recipe, isLoading: recipeLoading, error: recipeError } = useQuery({
    queryKey: ['userRecipe', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_recipes')
        .select(`
          *,
          dessert_type:dessert_types(id, name, name_en)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const baseRecipeIds = useMemo(() => {
    if (!recipe?.selected_components) return [] as number[];
    return (recipe.selected_components as any[]).map((c: any) => c.base_recipe_id);
  }, [recipe]);

  const { data: baseRecipes, isLoading: baseLoading, error: baseError } = useQuery({
    queryKey: ['baseRecipes', baseRecipeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('base_recipes')
        .select(`
          *,
          role:recipe_roles(id, name, name_en),
          ingredients:recipe_ingredients(id, ingredient_id, ingredient_name, quantity, unit, order_index, ingredient:ingredients_database(id, name_en, name_bg, image_url, category_id, unit_weight_grams, cat:ingredient_categories(id, name, name_en)))
        `)
        .in('id', baseRecipeIds);
      if (error) throw error;
      return data || [];
    },
    enabled: baseRecipeIds.length > 0,
  });

  // Optional: assembly_template — директен id или fallback по dessert_type_id
  const assemblyTemplateId = (recipe as any)?.assembly_template_id ?? null;
  const userDessertTypeId = (recipe as any)?.dessert_type_id ?? null;
  const { data: assemblyTemplate } = useQuery({
    queryKey: ['assemblyTemplate', assemblyTemplateId, userDessertTypeId],
    queryFn: async () => {
      try {
        if (assemblyTemplateId) {
          const { data } = await supabase
            .from('assembly_templates')
            .select('instructions, instructions_bg, instructions_en')
            .eq('id', assemblyTemplateId)
            .single();
          return data || null;
        }
        // Fallback: намери по compatible_dessert_types
        if (userDessertTypeId) {
          const { data: templates } = await supabase
            .from('assembly_templates')
            .select('*');
          const matchingTemplates = (templates || []).filter((t: any) => {
            const compatible = t.compatible_dessert_types as number[];
            return compatible && compatible.includes(Number(userDessertTypeId));
          });
          // Предпочитай id=1 (Sponge Cake) за торти, иначе първото съвпадение
          const matching = matchingTemplates.find((t: any) => t.id === 1) || matchingTemplates[0] || null;
          return matching;
        }
        return null;
      } catch (err) {
        console.error('Assembly template error:', err);
        return null;
      }
    },
    enabled: !!recipe && !!(assemblyTemplateId || userDessertTypeId),
  });

  const { data: stepsData, isLoading: stepsLoading, error: stepsError } = useQuery({
    queryKey: ['recipeSteps', baseRecipeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_instruction_steps')
        .select('*')
        .in('recipe_id', baseRecipeIds)
        .order('recipe_id')
        .order('step_number');
      if (error) throw error;
      return data || [];
    },
    enabled: baseRecipeIds.length > 0,
  });

  const isLoading = recipeLoading || baseLoading || stepsLoading;
  const error = recipeError || baseError || stepsError;

  const transformedData = useMemo(() => {
    if (!recipe || !baseRecipes) return null;

    // Assembly steps
    let assemblySteps: string[] | undefined;
    if (assemblyTemplate) {
      const instructions = language === 'en'
        ? (assemblyTemplate.instructions_en || assemblyTemplate.instructions || assemblyTemplate.instructions_bg)
        : (assemblyTemplate.instructions_bg || assemblyTemplate.instructions);
      if (instructions) {
        const parsed = instructions
          .split('\n')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        if (parsed.length > 0) assemblySteps = parsed;
      }
    }

    const selectedComponents: any[] = (recipe as any).selected_components || [];

    const sorted = [...baseRecipes].sort((a, b) => {
      const aComp = selectedComponents.find((c: any) => c.base_recipe_id === a.id);
      const bComp = selectedComponents.find((c: any) => c.base_recipe_id === b.id);
      return (aComp?.recipe_role_id || 0) - (bComp?.recipe_role_id || 0);
    });

    const components: any[] = [];
    const allIngredients: any[] = [];
    const allSteps: any[] = [];

    for (const br of sorted) {
      const roleName = language === 'bg'
        ? (br.role?.name || '')
        : (br.role?.name_en || br.role?.name || '');

      components.push({
        id: String(br.id),
        name: br.name,
        roleName,
        totalWeightGrams: br.total_weight_grams,
        totalCalories: br.total_calories,
        totalProtein: br.total_protein,
        totalFat: br.total_fat,
        totalCarbs: br.total_carbs,
        totalNetCarbs: br.total_net_carbs,
        bakeTemp: br.bake_temp_celsius,
        bakeTime: br.bake_time_minutes,
      });

      (br.ingredients || []).forEach((ing: any) => {
        allIngredients.push({
          id: String(ing.id),
          ingredientDatabaseId: ing.ingredient?.id ? String(ing.ingredient.id) : null,
          name: language === 'bg'
            ? (ing.ingredient?.name_bg || ing.ingredient?.name_en || ing.ingredient_name)
            : (ing.ingredient?.name_en || ing.ingredient?.name_bg || ing.ingredient_name),
          nameBg: ing.ingredient?.name_bg || ing.ingredient_name || '',
          nameEn: ing.ingredient?.name_en || ing.ingredient_name || '',
          quantity: ing.quantity,
          unit: ing.unit,
          imageUrl: ing.ingredient?.image_url,
          unitWeightGrams: ing.ingredient?.unit_weight_grams,
          category: language === 'en'
            ? (ing.ingredient?.cat?.name_en || undefined)
            : (ing.ingredient?.cat?.name || undefined),
          componentId: String(br.id),
        });
      });

      const stepsForRecipe = stepsData?.filter(s => s.recipe_id === br.id) || [];
      stepsForRecipe.forEach((step: any) => {
        allSteps.push({
          id: String(step.id),
          stepNumber: step.step_number,
          description: language === 'en'
            ? (step.step_description_en || step.step_description || step.step_description_bg || '')
            : (step.step_description_bg || step.step_description || step.step_description_en || ''),
          imageUrl: step.step_image_url,
          durationMinutes: step.step_duration_minutes,
          componentId: String(br.id),
        });
      });
    }

    const dessertType = (recipe as any).dessert_type;

    const nutrition = {
      totalCalories: components.reduce((s: number, c: any) => s + (c.totalCalories || 0), 0),
      totalProtein: components.reduce((s: number, c: any) => s + (c.totalProtein || 0), 0),
      totalFat: components.reduce((s: number, c: any) => s + (c.totalFat || 0), 0),
      totalCarbs: components.reduce((s: number, c: any) => s + (c.totalCarbs || 0), 0),
      totalNetCarbs: components.reduce((s: number, c: any) => s + (c.totalNetCarbs || 0), 0),
    };

    const totalWeight = components.reduce(
      (s: number, c: any) => s + (c.totalWeightGrams || 0), 0
    );

    const decorationBr = sorted.find((br: any) => {
      const comp = selectedComponents.find((c: any) => c.base_recipe_id === br.id);
      return comp?.recipe_role_id === 4;
    });
    const heroImageUrl = (recipe as any).user_image_url
      || decorationBr?.image_url
      || sorted[0]?.image_url
      || null;

    const fallbackName = language === 'bg'
      ? `Моя ${dessertType?.name || 'Десерт'}`
      : `My ${dessertType?.name_en || dessertType?.name || 'Dessert'}`;

    return {
      recipeId: String(id),
      name: (recipe as any).name || fallbackName,
      heroImageUrl,
      introText: undefined as string | undefined,
      dessertTypeName: language === 'bg'
        ? dessertType?.name
        : (dessertType?.name_en || dessertType?.name),
      components,
      ingredients: allIngredients,
      steps: allSteps,
      assemblySteps,
      nutrition,
      totalServings: (recipe as any).total_servings || 12,
      totalWeightGrams: totalWeight,
    };
  }, [recipe, baseRecipes, stepsData, assemblyTemplate, language]);

  if (isLoading || (!transformedData && !error)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  if (error || !transformedData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorText}>{t('recipeDetail.errorState')}</Text>
        <TouchableOpacity style={styles.errorBtn} onPress={() => router.back()}>
          <Text style={styles.errorBtnText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RecipeDetailView
        {...transformedData}
        onBack={() => router.back()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorEmoji: { fontSize: 56, marginBottom: 16 },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  errorBtn: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  errorBtnText: {
    color: Colors.text.inverse,
    fontWeight: 'bold',
  },
});
