// ===========================================================
// Ready Recipe Screen — зарежда от ready_recipes
// selected_components (jsonb) → base_recipes → ingredients + steps
// Поддържа: множество компоненти от 1 роля, multiplier върху quantities
// ===========================================================
import { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/Colors';
import { useTranslation, localizedField } from '../../constants/i18n';
import RecipeDetailView from '../../components/RecipeDetailView';

export default function ReadyRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, t } = useTranslation();

  // Заявка 1: ready_recipe (без JOIN — dessert_types няма FK в ready_recipes)
  const { data: recipe, isLoading: recipeLoading, error: recipeError } = useQuery({
    queryKey: ['readyRecipe', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ready_recipes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Заявка 2 (optional): dessert_type по dessert_type_id
  const dessertTypeId = (recipe as any)?.dessert_type_id ?? null;
  const { data: dessertType } = useQuery({
    queryKey: ['dessertType', dessertTypeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dessert_types')
        .select('id, name, name_en')
        .eq('id', dessertTypeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!dessertTypeId,
  });

  // Уникалните base_recipe_id-та от selected_components
  const baseRecipeIds = useMemo(() => {
    if (!recipe?.selected_components) return [] as number[];
    const comps = recipe.selected_components as any[];
    return [...new Set(comps.map((c: any) => c.base_recipe_id))] as number[];
  }, [recipe]);

  // Заявка 3: base_recipes + role + recipe_ingredients
  const { data: baseRecipes, isLoading: baseLoading, error: baseError } = useQuery({
    queryKey: ['readyRecipeComponents', baseRecipeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('base_recipes')
        .select('*, role:recipe_roles(id, name, name_en), recipe_ingredients(*, ingredient:ingredients_database(id, name_en, name_bg, image_url, category))')
        .in('id', baseRecipeIds);
      if (error) throw error;
      return data || [];
    },
    enabled: baseRecipeIds.length > 0,
  });

  // Заявка 4: instruction steps отделно (няма FK към base_recipes)
  const { data: stepsData, isLoading: stepsLoading, error: stepsError } = useQuery({
    queryKey: ['readyRecipeSteps', baseRecipeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_instruction_steps')
        .select('*')
        .in('recipe_id', baseRecipeIds)
        .order('step_number');
      if (error) throw error;
      return data || [];
    },
    enabled: baseRecipeIds.length > 0,
  });

  // Заявка 5 (optional): assembly_template — директен id или fallback по dessert_type_id
  const assemblyTemplateId = (recipe as any)?.assembly_template_id ?? null;
  console.log('📄 assembly_template_id:', assemblyTemplateId);
  const { data: assemblyTemplate } = useQuery({
    queryKey: ['assemblyTemplate', assemblyTemplateId, dessertTypeId],
    queryFn: async () => {
      if (assemblyTemplateId) {
        // Администраторът е избрал изрично
        const { data } = await supabase
          .from('assembly_templates')
          .select('instructions, instructions_bg, instructions_en')
          .eq('id', assemblyTemplateId)
          .single();
        return data || null;
      }
      // Fallback: намери по compatible_dessert_types
      if (dessertTypeId) {
        const { data: templates } = await supabase
          .from('assembly_templates')
          .select('*');
        const matching = (templates || []).find((t: any) => {
          const compatible = t.compatible_dessert_types as number[];
          return compatible && compatible.includes(Number(dessertTypeId));
        });
        return matching || null;
      }
      return null;
    },
    enabled: !!recipe && !!(assemblyTemplateId || dessertTypeId),
  });

  const isLoading = recipeLoading || baseLoading || stepsLoading;
  const error = recipeError || baseError || stepsError;

  const transformedData = useMemo(() => {
    if (!recipe) return null;
    // Изчакай base_recipes ако имаме компоненти
    if (baseRecipeIds.length > 0 && baseRecipes === undefined) return null;

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

    type SelectedComponent = {
      recipe_role_id: number;
      base_recipe_id: number;
      order_index: number;
      multiplier: number;
    };

    const selectedComponents: SelectedComponent[] =
      ((recipe as any).selected_components || []);

    // Сортирай по order_index
    const sortedComponents = [...selectedComponents].sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
    );

    const baseRecipesArray = baseRecipes || [];
    const components: any[] = [];
    const allIngredients: any[] = [];
    const allSteps: any[] = [];

    for (const comp of sortedComponents) {
      const br = baseRecipesArray.find((b: any) => b.id === comp.base_recipe_id);
      if (!br) continue;

      // Уникален ID за всяко появяване на компонента (включва order_index)
      const componentId = `${br.id}_${comp.order_index}`;

      const roleName = language === 'bg'
        ? (br.role?.name || '')
        : (br.role?.name_en || br.role?.name || '');

      components.push({
        id: componentId,
        name: br.name,
        roleName,
        totalWeightGrams: br.total_weight_grams != null
          ? Math.round(br.total_weight_grams * comp.multiplier)
          : undefined,
        totalCalories: br.total_calories != null
          ? br.total_calories * comp.multiplier
          : undefined,
        totalProtein: br.total_protein != null
          ? br.total_protein * comp.multiplier
          : undefined,
        totalFat: br.total_fat != null
          ? br.total_fat * comp.multiplier
          : undefined,
        totalCarbs: br.total_carbs != null
          ? br.total_carbs * comp.multiplier
          : undefined,
        totalNetCarbs: br.total_net_carbs != null
          ? br.total_net_carbs * comp.multiplier
          : undefined,
        bakeTemp: br.bake_temp_celsius,
        bakeTime: br.bake_time_minutes,
      });

      // Ingredients — quantity * multiplier, сортирани по order_index
      const sortedIngredients = [...(br.recipe_ingredients || [])].sort(
        (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
      );
      sortedIngredients.forEach((ing: any) => {
        allIngredients.push({
          id: `${ing.id}_${comp.order_index}`,
          ingredientDatabaseId: ing.ingredient?.id ? String(ing.ingredient.id) : null,
          name: language === 'en'
            ? (ing.ingredient?.name_en || ing.ingredient_name || '')
            : (ing.ingredient?.name_bg || ing.ingredient_name || ''),
          nameBg: ing.ingredient?.name_bg || ing.ingredient_name || '',
          nameEn: ing.ingredient?.name_en || ing.ingredient_name || '',
          quantity: ing.quantity * comp.multiplier,
          unit: ing.unit || '',
          imageUrl: ing.ingredient?.image_url || null,
          unitWeightGrams: null,
          category: ing.ingredient?.category || undefined,
          componentId,
        });
      });

      // Steps — линкваме към componentId на ТОВА появяване
      const stepsForRecipe = (stepsData || []).filter(
        (s: any) => s.recipe_id === br.id
      );
      stepsForRecipe.forEach((step: any) => {
        allSteps.push({
          id: `${step.id}_${comp.order_index}`,
          stepNumber: step.step_number,
          description: language === 'en'
            ? (step.step_description_en || step.step_description || step.step_description_bg || '')
            : (step.step_description_bg || step.step_description || step.step_description_en || ''),
          imageUrl: step.step_image_url,
          durationMinutes: step.step_duration_minutes,
          componentId,
        });
      });
    }

    const nutrition = {
      totalCalories: (recipe as any).total_calories
        || components.reduce((s: number, c: any) => s + (c.totalCalories || 0), 0),
      totalProtein: (recipe as any).total_protein
        || components.reduce((s: number, c: any) => s + (c.totalProtein || 0), 0),
      totalFat: (recipe as any).total_fat
        || components.reduce((s: number, c: any) => s + (c.totalFat || 0), 0),
      totalCarbs: (recipe as any).total_carbs
        || components.reduce((s: number, c: any) => s + (c.totalCarbs || 0), 0),
      totalNetCarbs: (recipe as any).total_net_carbs
        || components.reduce((s: number, c: any) => s + (c.totalNetCarbs || 0), 0),
    };

    const totalWeight = (recipe as any).total_weight_grams
      || components.reduce((s: number, c: any) => s + (c.totalWeightGrams || 0), 0);

    const introText = language === 'bg'
      ? ((recipe as any).custom_intro_text_bg || localizedField(recipe, 'description', language))
      : ((recipe as any).custom_intro_text_en || localizedField(recipe, 'description', language));

    return {
      recipeId: String(id),
      name: localizedField(recipe, 'name', language) || (recipe as any).name_bg || '',
      heroImageUrl: (recipe as any).hero_image_url,
      introText,
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
  }, [recipe, dessertType, baseRecipes, baseRecipeIds, stepsData, assemblyTemplate, language]);

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
