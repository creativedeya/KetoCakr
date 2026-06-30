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
import RecipeDetailView, { EquipmentItem, LabNoteItem } from '../../components/RecipeDetailView';

export default function ReadyRecipeScreen() {
  const { id, type: typeParam } = useLocalSearchParams<{ id: string; type?: string }>();
  const { language, t } = useTranslation();

  // When navigating with ?type=ready|simple we skip the detection query
  const hasTypeParam = typeParam === 'ready' || typeParam === 'simple';

  // Type detection: only runs when type is NOT provided via navigation params
  const { data: detectedType, isLoading: typeLoading, error: typeError } = useQuery({
    queryKey: ['detectRecipeType', id],
    queryFn: async () => {
      // Check base_recipes FIRST — simple recipes take priority
      const { data: baseData } = await supabase
        .from('base_recipes')
        .select('id, is_simple_recipe')
        .eq('id', id)
        .maybeSingle();
      if (baseData?.is_simple_recipe === true) {
        return 'simple' as const;
      }

      const { data: readyData } = await supabase
        .from('ready_recipes')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      if (readyData) {
        return 'ready' as const;
      }

      throw new Error('Recipe not found');
    },
    enabled: !!id && !hasTypeParam,
    staleTime: 30 * 1000,
  });
  const recipeType = hasTypeParam
    ? (typeParam as 'ready' | 'simple')
    : (detectedType ?? null);

  // Заявка 1: ready_recipe (без JOIN — dessert_types няма FK в ready_recipes)
  const { data: recipe, isLoading: recipeLoading, error: recipeError } = useQuery({
    queryKey: ['readyRecipe', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ready_recipes')
        .select('*, serving_container_info:equipment(id, name, name_en, serving_container_type)')
        .eq('id', id)
        .single();
      if (error) {
        console.error('[Supabase] ready_recipes error:', { code: error.code, message: error.message, details: error.details });
        throw error;
      }
      return data;
    },
    enabled: !!id && recipeType === 'ready',
  });

  // Заявка 2 (optional): dessert_type по dessert_type_id — works for both ready and simple recipes
  const dessertTypeId = (recipe as any)?.dessert_type_id ?? (simpleRecipe as any)?._meta?.dessert_type_id ?? null;
  const { data: dessertType } = useQuery({
    queryKey: ['dessertType', dessertTypeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dessert_types')
        .select('id, name, name_en, image_url')
        .eq('id', dessertTypeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!dessertTypeId,
  });

  // Уникалните base_recipe_id-та от selected_components (само за ready recipes)
  const baseRecipeIds = useMemo(() => {
    if (recipeType !== 'ready') return [] as number[];
    if (!recipe?.selected_components) return [] as number[];
    const comps = recipe.selected_components as any[];
    const ids = [...new Set(comps.map((c: any) => c.base_recipe_id))] as number[];
    return ids;
  }, [recipe, recipeType]);

  // Заявка 3: base_recipes + role + recipe_ingredients
  const { data: baseRecipes, isLoading: baseLoading, error: baseError } = useQuery({
    queryKey: ['readyRecipeComponents', baseRecipeIds],
   queryFn: async () => {
      const { data, error } = await supabase
        .from('base_recipes')
        .select('id, name, name_en, image_url, total_weight_grams, total_calories, total_protein, total_fat, total_carbs, total_net_carbs, prep_time_minutes, bake_time_minutes, equipment_notes, equipment_notes_en, servings, recipe_role_id, role:recipe_roles(id, name, name_en), recipe_ingredients(id, ingredient_database_id, ingredient_name, quantity, unit, order_index, ingredient:ingredients_database(id, name_en, name_bg, image_url, category_id, unit_weight_grams, fiber_per_100g, sugar_per_100g, sugar_alcohol_per_100g, saturated_fat_per_100g, cholesterol_per_100g, sodium_per_100g, calcium_per_100g, iron_per_100g, magnesium_per_100g, potassium_per_100g, zinc_per_100g, vitamin_a_per_100g, vitamin_c_per_100g, vitamin_d_per_100g, cat:ingredient_categories(id, name, name_en)))')
        .in('id', baseRecipeIds);

      if (error) throw error;
      return data || [];
    },
    enabled: baseRecipeIds.length > 0,
  });

  // Заявка 4: recipe_equipment с JOIN към equipment таблица
  const { data: equipmentData } = useQuery({
    queryKey: ['readyRecipeEquipment', baseRecipeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_equipment')
        .select('id, recipe_id, equipment_id, quantity, equipment:equipment(id, name, name_en, image_url, reference_image_url)')
        .in('recipe_id', baseRecipeIds);
      if (error) throw error;
      return data || [];
    },
    enabled: baseRecipeIds.length > 0,
  });

  // Заявка 5: lab_notes за всички base_recipes
  const { data: labNotesData } = useQuery({
    queryKey: ['readyRecipeLabNotes', baseRecipeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_notes')
        .select('id, recipe_id, content, content_bg, category, title, title_bg, display_order, is_active')
        .in('recipe_id', baseRecipeIds)
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
    enabled: baseRecipeIds.length > 0,
  });

  // Заявка 6: instruction steps отделно (няма FK към base_recipes)
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

  const { data: readyRecipeIngredientsData, isLoading: readyRecipeIngredientsLoading, error: readyRecipeIngredientsError } = useQuery({
    queryKey: ['readyRecipeIngredients', id],
    queryFn: async () => {
      if (recipeType !== 'ready') return [];
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select('id, ingredient_database_id, ingredient_name, quantity, unit, order_index, ingredient:ingredients_database(id, name_en, name_bg, image_url, category_id, unit_weight_grams, fiber_per_100g, sugar_per_100g, sugar_alcohol_per_100g, saturated_fat_per_100g, cholesterol_per_100g, sodium_per_100g, calcium_per_100g, iron_per_100g, magnesium_per_100g, potassium_per_100g, zinc_per_100g, vitamin_a_per_100g, vitamin_c_per_100g, vitamin_d_per_100g, cat:ingredient_categories(id, name, name_en))')
        .eq('recipe_id', id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id && recipeType === 'ready',
  });

  // Equipment IDs referenced in ready recipe steps (fallback ако recipe_equipment е празна)
  const readyEquipmentIds = useMemo(() => {
    if (recipeType !== 'ready' || !stepsData) return [] as number[];
    const ids = new Set<number>();
    (stepsData as any[]).forEach((step: any) => {
      (step.equipment_needed ?? []).forEach((eqId: number) => ids.add(eqId));
    });
    return Array.from(ids);
  }, [stepsData, recipeType]);

  const { data: readyEquipmentData } = useQuery({
    queryKey: ['readyEquipment', readyEquipmentIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, name_en, image_url, reference_image_url')
        .in('id', readyEquipmentIds);
      if (error) throw error;
      return data || [];
    },
    enabled: readyEquipmentIds.length > 0,
  });

  // Заявки за simple recipe
  const { data: simpleRecipe, isLoading: simpleLoading } = useQuery({
    queryKey: ['simpleRecipe', id],
    queryFn: async () => {
      const [{ data, error }, { data: metaData }] = await Promise.all([
        supabase
          .from('base_recipes')
          .select(`
            id, name, name_en, image_url,
            total_weight_grams, total_calories, total_protein, total_fat, total_carbs, total_net_carbs,
            prep_time_minutes, bake_time_minutes, servings,
            recipe_ingredients(
              id, ingredient_database_id, ingredient_name, quantity, unit, order_index,
              ingredient:ingredients_database(
                id, name_en, name_bg, image_url, category_id, unit_weight_grams,
                fiber_per_100g, sugar_per_100g, sugar_alcohol_per_100g,
                saturated_fat_per_100g, cholesterol_per_100g, sodium_per_100g,
                calcium_per_100g, iron_per_100g, magnesium_per_100g,
                potassium_per_100g, zinc_per_100g, vitamin_a_per_100g,
                vitamin_c_per_100g, vitamin_d_per_100g,
                cat:ingredient_categories(id, name, name_en)
              )
            )
          `)
          .eq('id', id)
          .eq('is_simple_recipe', true)
          .single(),
        supabase
          .from('ready_recipes')
          .select('dessert_type_id, serving_container_id, serving_container_info:equipment(id, name, name_en, serving_container_type)')
          .eq('id', id)
          .maybeSingle(),
      ]);
      if (error) {
        console.error('[SimpleRecipe] base_recipes error:', error);
        throw error;
      }
      console.log('[SimpleRecipe] loaded:', data?.id, '_meta:', JSON.stringify((metaData as any)?.dessert_type_id));
      return { ...data, _meta: metaData ?? null };
    },
    enabled: !!id && recipeType === 'simple',
  });

  const { data: simpleSteps, isLoading: simpleStepsLoading } = useQuery({
    queryKey: ['simpleRecipeSteps', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_instruction_steps')
        .select('*')
        .eq('recipe_id', id)
        .order('step_number');
      if (error) throw error;
      return data || [];
    },
    enabled: !!id && recipeType === 'simple',
  });

  const { data: simpleLabNotesData } = useQuery({
    queryKey: ['simpleLabNotes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_notes')
        .select('id, content_bg, content, title, title_bg, category, display_order')
        .eq('recipe_id', id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) {
        console.error('[Lab Notes] Error loading:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!id && recipeType === 'simple',
  });


  // Заявка 7 (optional): assembly_template — директен id или fallback по dessert_type_id
  const assemblyTemplateId = (recipe as any)?.assembly_template_id ?? null;
  const { data: assemblyTemplate } = useQuery({
    queryKey: ['assemblyTemplate', assemblyTemplateId, dessertTypeId],
    queryFn: async () => {
      try {
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
          const matchingTemplates = (templates || []).filter((t: any) => {
            const compatible = t.compatible_dessert_types as number[];
            return compatible && compatible.includes(Number(dessertTypeId));
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
    enabled: !!recipe && !!(assemblyTemplateId || dessertTypeId),
  });

  // Equipment IDs referenced in simple recipe steps (for per-step display in cooking mode)
  const simpleEquipmentIds = useMemo(() => {
    if (recipeType !== 'simple' || !simpleSteps) return [] as number[];
    const ids = new Set<number>();
    (simpleSteps as any[]).forEach((step: any) => {
      (step.equipment_needed ?? []).forEach((eqId: number) => ids.add(eqId));
    });
    return Array.from(ids);
  }, [simpleSteps, recipeType]);

  const { data: simpleEquipmentData } = useQuery({
    queryKey: ['simpleEquipment', simpleEquipmentIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, name_en, image_url, reference_image_url')
        .in('id', simpleEquipmentIds);
      if (error) throw error;
      return data || [];
    },
    enabled: simpleEquipmentIds.length > 0,
  });

  const detectionError = !hasTypeParam ? (typeError as Error | null) : null;
  const isLoading = (!hasTypeParam && typeLoading) || recipeLoading || baseLoading || stepsLoading || readyRecipeIngredientsLoading || simpleLoading || simpleStepsLoading;
  const error = recipeError || baseError || stepsError || readyRecipeIngredientsError || detectionError;

  const transformedData = useMemo(() => {
    // ─── Simple recipe path ───────────────────────────────────
    if (recipeType === 'simple') {
      if (!simpleRecipe) return null;

      const simpleComponent = {
        id: 'simple-main',
        name: language === 'en'
          ? (simpleRecipe.name_en || simpleRecipe.name_bg || simpleRecipe.name || '')
          : (simpleRecipe.name_bg || simpleRecipe.name || ''),
        roleName: '',
        imageUrl: simpleRecipe.image_url || null,
        totalWeightGrams: simpleRecipe.total_weight_grams,
        totalCalories: simpleRecipe.total_calories,
        totalProtein: simpleRecipe.total_protein,
        totalFat: simpleRecipe.total_fat,
        totalCarbs: simpleRecipe.total_carbs,
        totalNetCarbs: simpleRecipe.total_net_carbs,
        bakeTime: simpleRecipe.bake_time_minutes,
        prepTime: simpleRecipe.prep_time_minutes,
      };

      const simpleIngredients = [...(simpleRecipe.recipe_ingredients || [])]
        .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((ing: any) => ({
          id: String(ing.id),
          ingredientDatabaseId: ing.ingredient?.id ? String(ing.ingredient.id) : null,
          name: language === 'en'
            ? (ing.ingredient?.name_en || ing.ingredient_name || '')
            : (ing.ingredient?.name_bg || ing.ingredient_name || ''),
          nameBg: ing.ingredient?.name_bg || ing.ingredient_name || '',
          nameEn: ing.ingredient?.name_en || ing.ingredient_name || '',
          quantity: (ing.quantity != null) ? Number(ing.quantity) : 0,
          unit: ing.unit || '',
          imageUrl: ing.ingredient?.image_url || null,
          unitWeightGrams: ing.ingredient?.unit_weight_grams ?? null,
          category: language === 'en'
            ? (ing.ingredient?.cat?.name_en || undefined)
            : (ing.ingredient?.cat?.name || undefined),
          componentId: 'simple-main',
          fiberPer100g: ing.ingredient?.fiber_per_100g ?? null,
          sugarPer100g: ing.ingredient?.sugar_per_100g ?? null,
          sugarAlcoholPer100g: ing.ingredient?.sugar_alcohol_per_100g ?? null,
          saturatedFatPer100g: ing.ingredient?.saturated_fat_per_100g ?? null,
          cholesterolPer100g: ing.ingredient?.cholesterol_per_100g ?? null,
          sodiumPer100g: ing.ingredient?.sodium_per_100g ?? null,
          calciumPer100g: ing.ingredient?.calcium_per_100g ?? null,
          ironPer100g: ing.ingredient?.iron_per_100g ?? null,
          magnesiumPer100g: ing.ingredient?.magnesium_per_100g ?? null,
          potassiumPer100g: ing.ingredient?.potassium_per_100g ?? null,
          zincPer100g: ing.ingredient?.zinc_per_100g ?? null,
          vitaminAPer100g: ing.ingredient?.vitamin_a_per_100g ?? null,
          vitaminCPer100g: ing.ingredient?.vitamin_c_per_100g ?? null,
          vitaminDPer100g: ing.ingredient?.vitamin_d_per_100g ?? null,
        }));

      // Build lookup: recipe_ingredients integer PK → string id used by CookingMode
      // ingredient_ids in steps stores integer PKs of recipe_ingredients rows directly
      const ingPkToStringId = new Map<number, string>();
      (simpleRecipe.recipe_ingredients || []).forEach((ing: any) => {
        const pk = Number(ing.id);
        if (!isNaN(pk)) {
          ingPkToStringId.set(pk, String(ing.id));
        }
      });

      const simpleStepItems = (simpleSteps || []).map((step: any) => {
        let ingredientsUsedIds: string[] = [];

        if (Array.isArray(step.ingredients_used) && step.ingredients_used.length > 0) {
          ingredientsUsedIds = step.ingredients_used
            .map((rawId: any) => {
              const pk = Number(rawId);
              return ingPkToStringId.get(pk) ?? null;
            })
            .filter(Boolean) as string[];
        }

        return {
          id: String(step.id),
          stepNumber: step.step_number,
          description: language === 'en'
            ? (step.step_description_en || step.step_description || step.step_description_bg || '')
            : (step.step_description_bg || step.step_description || step.step_description_en || ''),
          imageUrl: step.step_image_url,
          durationMinutes: step.step_duration_minutes,
          componentId: 'simple-main',
          equipmentNeeded: step.equipment_needed ?? [],
          ingredientsUsedIds,
        };
      });

      const simpleLabNotes: LabNoteItem[] = (simpleLabNotesData || []).map((note: any) => ({
        id: String(note.id),
        recipeId: simpleRecipe.id,
        text: language === 'en'
          ? (note.content || note.content_bg || '')
          : (note.content_bg || note.content || ''),
        title: language === 'en'
          ? (note.title || note.title_bg || '')
          : (note.title_bg || note.title || ''),
        categoria: note.category || null,
        baseRecipeImageUrl: simpleRecipe.image_url || null,
      }));

      return {
        recipeId: String(id),
        name: language === 'en'
          ? (simpleRecipe.name_en || simpleRecipe.name_bg || simpleRecipe.name || '')
          : (simpleRecipe.name_bg || simpleRecipe.name || ''),
        heroImageUrl: simpleRecipe.image_url,
        sourceUrl: undefined,
        introText: undefined,
        dessertTypeName: dessertType
          ? (language === 'bg' ? (dessertType.name || '') : ((dessertType as any).name_en || dessertType.name || ''))
          : undefined,
        dessertTypeImageUrl: (dessertType as any)?.image_url || null,
        isPortionDessert: (simpleRecipe as any)._meta?.dessert_type_id === 8,
        isCookieRecipe: (simpleRecipe as any)._meta?.dessert_type_id === 7,
        servingContainer: (simpleRecipe as any)._meta?.serving_container_info ?? null,
        components: [simpleComponent],
        ingredients: simpleIngredients,
        steps: simpleStepItems,
        assemblySteps: undefined,
        nutrition: {
          totalCalories: simpleRecipe.total_calories || 0,
          totalProtein: simpleRecipe.total_protein || 0,
          totalFat: simpleRecipe.total_fat || 0,
          totalCarbs: simpleRecipe.total_carbs || 0,
          totalNetCarbs: simpleRecipe.total_net_carbs || 0,
        },
        totalServings: simpleRecipe.servings || 12,
        totalWeightGrams: simpleRecipe.total_weight_grams || 0,
        equipment: (simpleEquipmentData || []).map((eq: any) => ({
          id: eq.id as number,
          name: language === 'en' ? (eq.name_en || eq.name || '') : (eq.name || ''),
          imageUrl: eq.image_url || eq.reference_image_url || null,
          quantity: 1,
        })),
        labNotes: simpleLabNotes,
        recipeType: 'simple' as const,
      };
    }

    // ─── Ready recipe path ────────────────────────────────────
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
        ? ((br.role as any)?.name || '')
        : ((br.role as any)?.name_en || (br.role as any)?.name || '');

      components.push({
        id: componentId,
        name: language === 'en' ? (br.name_en || br.name) : br.name,
        roleName,
        imageUrl: (br as any).image_url || null,
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
        bakeTime: br.bake_time_minutes,
        prepTime: br.prep_time_minutes,
        equipmentNotes: br.equipment_notes,
        equipmentNotesEn: br.equipment_notes_en,
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
          unitWeightGrams: ing.ingredient?.unit_weight_grams ?? null,
          category: language === 'en'
            ? (ing.ingredient?.cat?.name_en || undefined)
            : (ing.ingredient?.cat?.name || undefined),
          componentId,
          fiberPer100g: ing.ingredient?.fiber_per_100g ?? null,
          sugarPer100g: ing.ingredient?.sugar_per_100g ?? null,
          sugarAlcoholPer100g: ing.ingredient?.sugar_alcohol_per_100g ?? null,
          saturatedFatPer100g: ing.ingredient?.saturated_fat_per_100g ?? null,
          cholesterolPer100g: ing.ingredient?.cholesterol_per_100g ?? null,
          sodiumPer100g: ing.ingredient?.sodium_per_100g ?? null,
          calciumPer100g: ing.ingredient?.calcium_per_100g ?? null,
          ironPer100g: ing.ingredient?.iron_per_100g ?? null,
          magnesiumPer100g: ing.ingredient?.magnesium_per_100g ?? null,
          potassiumPer100g: ing.ingredient?.potassium_per_100g ?? null,
          zincPer100g: ing.ingredient?.zinc_per_100g ?? null,
          vitaminAPer100g: ing.ingredient?.vitamin_a_per_100g ?? null,
          vitaminCPer100g: ing.ingredient?.vitamin_c_per_100g ?? null,
          vitaminDPer100g: ing.ingredient?.vitamin_d_per_100g ?? null,
        });
      });

      // Steps — линкваме към componentId на ТОВА появяване
      const stepsForRecipe = (stepsData || []).filter(
        (s: any) => s.recipe_id === br.id
      );

      const buildIngredientUuidMap = (baseRecipe: any): Map<string, string> => {
        const map = new Map<string, string>();
        if (baseRecipe?.recipe_ingredients) {
          baseRecipe.recipe_ingredients.forEach((ing: any) => {
            const key = String(ing.ingredient_database_id);
            const value = `${ing.id}_${comp.order_index}`;
            map.set(key, value);
          });
        }
        return map;
      };

      const ingredientUuidMap = buildIngredientUuidMap(br);

      stepsForRecipe.forEach((step: any) => {
        // Parse ingredients_used
        let ingredientsUsedIds: string[] = [];

        if (step.ingredients_used) {
          let idsArray: string[] = [];

          if (typeof step.ingredients_used === 'string') {
            try {
              const parsed = JSON.parse(step.ingredients_used);
              idsArray = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              idsArray = [step.ingredients_used];
            }
          } else if (Array.isArray(step.ingredients_used)) {
            idsArray = step.ingredients_used.map((id: any) => String(id));
          }

          const isUuidFormat = idsArray.some(id => id.includes('-'));

          if (isUuidFormat) {
            ingredientsUsedIds = idsArray
              .map(uuid => ingredientUuidMap.get(uuid))
              .filter(Boolean) as string[];
          } else {
            ingredientsUsedIds = idsArray.map(id => `${id}_${comp.order_index}`);
          }
        }

        allSteps.push({
          id: `${step.id}_${comp.order_index}`,
          stepNumber: step.step_number,
          description: language === 'en'
            ? (step.step_description_en || step.step_description || step.step_description_bg || '')
            : (step.step_description_bg || step.step_description || step.step_description_en || ''),
          imageUrl: step.step_image_url,
          durationMinutes: step.step_duration_minutes,
          componentId,
          ingredientsUsedIds,
          equipmentNeeded: step.equipment_needed,
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

    // ─── Equipment: извличаме от equipment_needed полетата в steps (fallback ако recipe_equipment е празна)
    
    // Събираме уникални equipment IDs от steps
    const equipmentIdsFromSteps = new Set<number>();
    for (const step of (stepsData || [])) {
      (step.equipment_needed ?? []).forEach((eqId: number) => equipmentIdsFromSteps.add(eqId));
    }
    
    const equipmentMap = new Map<number, EquipmentItem>();
    
    // Опит 1: Ако recipe_equipment има данни, използвай ги
    for (const row of (equipmentData || [])) {
      const eq = (row as any).equipment;
      if (!eq) continue;
      const eqId = eq.id as number;
      if (!equipmentMap.has(eqId)) {
        equipmentMap.set(eqId, {
          id: eqId,
          name: language === 'en' ? (eq.name_en || eq.name || '') : (eq.name || ''),
          imageUrl: eq.image_url || eq.reference_image_url || null,
          quantity: (row as any).quantity || 1,
        });
      }
    }
    
    // Опит 2: Ако recipe_equipment е празна, използвай readyEquipmentData от steps
    if (equipmentMap.size === 0 && readyEquipmentData && readyEquipmentData.length > 0) {
      for (const eq of readyEquipmentData) {
        const eqId = eq.id as number;
        if (!equipmentMap.has(eqId)) {
          equipmentMap.set(eqId, {
            id: eqId,
            name: language === 'en' ? (eq.name_en || eq.name || '') : (eq.name || ''),
            imageUrl: eq.image_url || eq.reference_image_url || null,
            quantity: 1,
          });
        }
      }
    }
    
    const allEquipment = Array.from(equipmentMap.values());

    // ─── Lab Notes: свързани с image_url от съответния base_recipe
    const baseRecipeImageMap = new Map<number, string | null>();
    const recipeRoleMap = new Map<number, number>();
    for (const br of baseRecipesArray) {
      baseRecipeImageMap.set(br.id, (br as any).image_url || null);
      recipeRoleMap.set(br.id, (br as any).recipe_role_id || 999);
    }
    const allLabNotes: LabNoteItem[] = [...(labNotesData || [])]
      .sort((a: any, b: any) => (recipeRoleMap.get(a.recipe_id) ?? 999) - (recipeRoleMap.get(b.recipe_id) ?? 999))
      .map((note: any) => ({
        id: String(note.id),
        recipeId: note.recipe_id,
        text: language === 'en' ? (note.content || note.content_bg || '') : (note.content_bg || note.content || ''),
        title: language === 'en' ? (note.title || note.title_bg || '') : (note.title_bg || note.title || ''),
        categoria: note.category || null,
        baseRecipeImageUrl: baseRecipeImageMap.get(note.recipe_id) || null,
      }));
    return {
      recipeId: String(id),
      recipeType: 'ready' as const,
      name: localizedField(recipe, 'name', language) || (recipe as any).name_bg || '',
      heroImageUrl: (recipe as any).hero_image_url,
      sourceUrl: undefined,
      introText,
      dessertTypeName: language === 'bg'
        ? dessertType?.name
        : (dessertType?.name_en || dessertType?.name),
      dessertTypeImageUrl: (dessertType as any)?.image_url || null,
      isPortionDessert: (
        (recipe as any).dessert_type_id === 3 ||
        (dessertType as any)?.name_en === 'Portion Desserts' ||
        (dessertType as any)?.name_bg === 'Порционни десерти'
      ),
      servingContainer: (recipe as any).serving_container_info ?? null,
      components,
      ingredients: allIngredients,
      steps: allSteps,
      assemblySteps,
      nutrition,
      totalServings: (recipe as any).total_servings || (recipe as any).servings || 12,
      totalWeightGrams: totalWeight,
      equipment: allEquipment,
      labNotes: allLabNotes,
    };
  }, [recipe, dessertType, baseRecipes, baseRecipeIds, stepsData, readyRecipeIngredientsData, equipmentData, readyEquipmentData, labNotesData, assemblyTemplate, language, recipeType, simpleRecipe, simpleSteps, simpleLabNotesData, simpleEquipmentData]);

  // Task 5: production-ready render path

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


  try {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <RecipeDetailView
          {...transformedData}
          onBack={() => router.back()}
        />
      </>
    );
  } catch (renderError: any) {
    console.error('[Recipe Detail] RecipeDetailView render error:', renderError);
    return (
      <View style={[styles.centered, { padding: 20 }]}>
        <Text style={[styles.errorText, { color: 'red', fontSize: 14 }]}>
          Render error: {renderError?.message || JSON.stringify(renderError)}
        </Text>
        <TouchableOpacity style={styles.errorBtn} onPress={() => router.back()}>
          <Text style={styles.errorBtnText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }
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
