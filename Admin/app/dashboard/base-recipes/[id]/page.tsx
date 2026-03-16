'use client';

import { EnhancedStepImages } from './EnhancedStepImages';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

interface BaseRecipe {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  recipe_role_id: number | null;
  compatible_dessert_types: number[] | null;
  assembly_template_id: number | null;
  prep_time_minutes: number | null;
  bake_time_minutes: number | null;
  servings: number | null;
  difficulty_level: string | null;
  total_calories: number | null;
  total_fat: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_net_carbs: number | null;
  image_url: string | null;
  ingredients_text_bg: string | null;
  ingredients_text_en: string | null;
  equipment_notes: string | null;
  equipment_notes_en: string | null;
  is_visible_to_users: boolean;
  is_free: boolean;
  created_at: string;
}

interface RecipeTag {
  id: number;
  name: string;
  name_bg: string | null;
  icon: string | null;
}

interface Equipment {
  id: number;
  slug: string;
  name: string;
  name_en: string | null;
  icon: string | null;
  category: string | null;
}

interface RecipeRole {
  id: number;
  name: string;
  name_en: string;
}

interface DessertType {
  id: number;
  name: string;
  name_en: string;
}

interface AssemblyTemplate {
  id: number;
  name: string;
  name_en: string | null;
  template_key: string;
}

interface RecipeStep {
  id?: string;
  step_number: number;
  step_description: string;
  step_description_bg?: string | null;
  step_description_en?: string | null;
  step_image_url?: string | null;
}

interface Ingredient {
  id?: string;
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
}

/**
 * Parse description text into individual steps
 * Supports: numbered (1., 2.), bulleted (•, -), newline separated
 */
function parseDescriptionIntoSteps(description: string): string[] {
  if (!description || description.trim() === '') {
    return [];
  }

  let steps: string[] = [];
  
  // Try numbered list (1., 2., 3. or 1), 2), 3))
  const numberedPattern = /(?:^|\n)\s*\d+[\.)]\s+(.+?)(?=\n\s*\d+[\.)]|\n\n|$)/gs;
  const numberedMatches = Array.from(description.matchAll(numberedPattern));
  
  if (numberedMatches.length > 0) {
    steps = numberedMatches.map(match => match[1].trim()).filter(Boolean);
    return steps;
  }

  // Try bulleted list (•, -, *, →)
  const bulletPattern = /(?:^|\n)\s*[•\-*→]\s+(.+?)(?=\n\s*[•\-*→]|\n\n|$)/gs;
  const bulletMatches = Array.from(description.matchAll(bulletPattern));
  
  if (bulletMatches.length > 0) {
    steps = bulletMatches.map(match => match[1].trim()).filter(Boolean);
    return steps;
  }

  // Fallback: split by double newlines or periods
  steps = description
    .split(/\n\n+|\.\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
  
  return steps;
}

// ─── Nutrition Calculation Helpers ───────────────────────────────────────────

function convertToGrams(quantity: number, unit: string, unitWeightGrams: number | null): number {
  const u = (unit || '').toLowerCase().trim();
  if (u === 'g' || u === 'гр' || u === 'гр.') return quantity;
  if (u === 'kg' || u === 'кг') return quantity * 1000;
  if (u === 'ml' || u === 'мл') return quantity;
  if (u === 'l' || u === 'л') return quantity * 1000;
  if (u === 'бр' || u === 'бр.' || u === 'pcs' || u === 'pc' || u === 'piece' || u === 'pieces') return quantity * (unitWeightGrams || 0);
  if (u === 'ч.л.' || u === 'ч.л' || u === 'tsp') return quantity * 5;
  if (u === 'с.л.' || u === 'с.л' || u === 'tbsp') return quantity * 15;
  return quantity;
}

async function calculateRecipeNutrition(
  recipeIngredients: { ingredient_name: string; quantity: number | null; unit: string | null }[]
): Promise<{ calories: number; protein: number; fat: number; carbs: number; net_carbs: number }> {
  let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0, totalFiber = 0;

  for (const ing of recipeIngredients) {
    if (!ing.quantity || !ing.ingredient_name) continue;

    const { data: dbIng } = await supabase
      .from('ingredients_database')
      .select('calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, unit_weight_grams')
      .or(`name_en.ilike.%${ing.ingredient_name}%,name_bg.ilike.%${ing.ingredient_name}%`)
      .limit(1)
      .maybeSingle();

    if (!dbIng) { console.warn(`Липсва в DB: ${ing.ingredient_name}`); continue; }

    const grams = convertToGrams(ing.quantity, ing.unit || 'g', dbIng.unit_weight_grams);
    const f = grams / 100;
    totalCalories += (dbIng.calories_per_100g || 0) * f;
    totalProtein  += (dbIng.protein_per_100g  || 0) * f;
    totalFat      += (dbIng.fat_per_100g      || 0) * f;
    totalCarbs    += (dbIng.carbs_per_100g    || 0) * f;
    totalFiber    += (dbIng.fiber_per_100g    || 0) * f;
  }

  return {
    calories:  Math.round(totalCalories * 10) / 10,
    protein:   Math.round(totalProtein  * 10) / 10,
    fat:       Math.round(totalFat      * 10) / 10,
    carbs:     Math.round(totalCarbs    * 10) / 10,
    net_carbs: Math.round((totalCarbs - totalFiber) * 10) / 10,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BaseRecipeDetailPage() {
  const params = useParams();
  const recipeId = params?.id as string;
  const router = useRouter();
  
  const [recipe, setRecipe] = useState<BaseRecipe | null>(null);
  const [recipeRoles, setRecipeRoles] = useState<RecipeRole[]>([]);
  const [dessertTypes, setDessertTypes] = useState<DessertType[]>([]);
  const [templates, setTemplates] = useState<AssemblyTemplate[]>([]);
  const [allTags, setAllTags] = useState<RecipeTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Map<number, string>>(new Map());
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [selectedStepsForImages, setSelectedStepsForImages] = useState<Set<number>>(new Set());
  const [generatingImages, setGeneratingImages] = useState(false);
  const [imageGenerationProgress, setImageGenerationProgress] = useState<{current: number, total: number} | null>(null);
  const [hasUnsavedImages, setHasUnsavedImages] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    description: '',
    description_en: '',
    recipe_role_id: 1,
    compatible_dessert_types: [] as number[],
    assembly_template_id: null as number | null,
    prep_time_minutes: 30,
    bake_time_minutes: 0,
    servings: 8,
    difficulty_level: '',
    total_calories: 0,
    total_fat: 0,
    total_protein: 0,
    total_carbs: 0,
    total_net_carbs: 0,
    image_url: '',
    ingredients_text_bg: '',
    ingredients_text_en: '',
    equipment_notes: '',
    equipment_notes_en: '',
    is_visible_to_users: true,
    is_free: false,
  });

  useEffect(() => {
    if (recipeId) {
      loadAllData();
    }
  }, [recipeId]);

  async function loadAllData() {
    try {
      setLoading(true);

      // Load reference data
      const [rolesRes, typesRes, templatesRes, tagsRes, equipmentRes] = await Promise.all([
        supabase.from('recipe_roles').select('*').order('id'),
        supabase.from('dessert_types').select('*').order('name'),
        supabase.from('assembly_templates').select('id, name, name_en, template_key').order('name'),
        supabase.from('recipe_tags').select('*').order('name'),
        supabase.from('equipment').select('*').order('name'),
      ]);

      if (rolesRes.data) setRecipeRoles(rolesRes.data);
      if (typesRes.data) setDessertTypes(typesRes.data);
      if (templatesRes.data) setTemplates(templatesRes.data);
      if (tagsRes.data) setAllTags(tagsRes.data);
      if (equipmentRes.data) setAllEquipment(equipmentRes.data);

      // Load recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('base_recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (recipeError) throw recipeError;
      
      setRecipe(recipeData);
      setFormData({
        name: recipeData.name || '',
        name_en: recipeData.name_en || '',
        description: recipeData.description || '',
        description_en: recipeData.description_en || '',
        recipe_role_id: recipeData.recipe_role_id || 1,
        compatible_dessert_types: recipeData.compatible_dessert_types || [],
        assembly_template_id: recipeData.assembly_template_id || null,
        prep_time_minutes: recipeData.prep_time_minutes || 30,
        bake_time_minutes: recipeData.bake_time_minutes || 0,
        servings: recipeData.servings || 8,
        difficulty_level: recipeData.difficulty_level || '',
        total_calories: recipeData.total_calories || 0,
        total_fat: recipeData.total_fat || 0,
        total_protein: recipeData.total_protein || 0,
        total_carbs: recipeData.total_carbs || 0,
        total_net_carbs: recipeData.total_net_carbs || 0,
        image_url: recipeData.image_url || '',
        ingredients_text_bg: recipeData.ingredients_text_bg || '',
        ingredients_text_en: recipeData.ingredients_text_en || '',
        equipment_notes: recipeData.equipment_notes || '',
        equipment_notes_en: recipeData.equipment_notes_en || '',
        is_visible_to_users: recipeData.is_visible_to_users !== false,
        is_free: recipeData.is_free || false,
      });

      // Load recipe tags
      const { data: recipeTagsData } = await supabase
        .from('base_recipe_tags')
        .select('tag_id')
        .eq('recipe_id', recipeId);
      
      if (recipeTagsData) {
        setSelectedTags(recipeTagsData.map(rt => rt.tag_id));
      }

      // Load recipe equipment
      const { data: recipeEquipmentData } = await supabase
        .from('base_recipe_equipment')
        .select('equipment_id, notes')
        .eq('recipe_id', recipeId);
      
      if (recipeEquipmentData) {
        const equipMap = new Map<number, string>();
        recipeEquipmentData.forEach(re => {
          equipMap.set(re.equipment_id, re.notes || '');
        });
        setSelectedEquipment(equipMap);
      }

      // Load steps
      const { data: stepsData } = await supabase
        .from('recipe_instruction_steps')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('step_number');

      setSteps(stepsData || []);

      // Load ingredients
      const { data: ingredientsData } = await supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('order_index');
      
      if (ingredientsData && ingredientsData.length > 0) {
        setIngredients(ingredientsData.map(ing => ({
          id: ing.id,
          ingredient_name: ing.ingredient_name,
          quantity: ing.quantity,
          unit: ing.unit
        })));
      } else {
        setIngredients([{ ingredient_name: '', quantity: null, unit: 'g' }]);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      alert('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  }

  function toggleDessertType(typeId: number) {
    const current = formData.compatible_dessert_types;
    if (current.includes(typeId)) {
      setFormData({
        ...formData,
        compatible_dessert_types: current.filter(id => id !== typeId)
      });
    } else {
      setFormData({
        ...formData,
        compatible_dessert_types: [...current, typeId]
      });
    }
  }

  function toggleTag(tagId: number) {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  }

  function toggleEquipment(equipmentId: number) {
    const newMap = new Map(selectedEquipment);
    if (newMap.has(equipmentId)) {
      newMap.delete(equipmentId);
    } else {
      newMap.set(equipmentId, '');
    }
    setSelectedEquipment(newMap);
  }

  function updateEquipmentNotes(equipmentId: number, notes: string) {
    const newMap = new Map(selectedEquipment);
    newMap.set(equipmentId, notes);
    setSelectedEquipment(newMap);
  }

  function addIngredient() {
    setIngredients([...ingredients, { ingredient_name: '', quantity: null, unit: 'g' }]);
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: any) {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  }

  // Step manipulation functions
  function addStep() {
    const newStepNumber = steps.length > 0 ? Math.max(...steps.map(s => s.step_number)) + 1 : 1;
    setSteps([...steps, { step_number: newStepNumber, step_description: '' }]);
  }

  function removeStep(index: number) {
    const updated = steps.filter((_, i) => i !== index);
    // Renumber steps
    updated.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setSteps(updated);
  }

  function updateStep(index: number, field: keyof RecipeStep, value: any) {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  }

  function moveStepUp(index: number) {
    if (index === 0) return;
    const updated = [...steps];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    // Renumber
    updated.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setSteps(updated);
  }

  function moveStepDown(index: number) {
    if (index === steps.length - 1) return;
    const updated = [...steps];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    // Renumber
    updated.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setSteps(updated);
  }

 async function generateStepsFromDescription() {
  if (!recipe?.description && !recipe?.description_en) {
    alert('No description available to generate steps from.');
    return;
  }

  // Try manual parsing first
  const descriptionToUse = recipe.description || recipe.description_en || '';
  const manuallyParsedSteps = parseDescriptionIntoSteps(descriptionToUse);
  
  if (manuallyParsedSteps.length > 0) {
    const useManual = confirm(
      `Found ${manuallyParsedSteps.length} steps in the description.\n\n` +
      `Do you want to use these directly?\n\n` +
      `Click OK to use parsed steps\n` +
      `Click Cancel to use AI generation instead`
    );

    if (useManual) {
      const newSteps: RecipeStep[] = manuallyParsedSteps.map((stepText, idx) => ({
        step_number: idx + 1,
        step_description: stepText,
        step_description_bg: stepText,
        step_description_en: null
      }));

      setSteps(newSteps);
      alert(`✅ Created ${newSteps.length} steps from description!\n\nReview and edit before saving.`);
      return;
    }
  }

  // Use AI generation
  if (!confirm('This will use AI to generate steps. Continue?')) {
    return;
  }

  try {
    setSaving(true);

    const response = await fetch('/api/generate-steps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: recipe.description || recipe.description_en
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.steps || !Array.isArray(data.steps)) {
      throw new Error('Invalid response format');
    }

    const newSteps: RecipeStep[] = data.steps.map((item: any) => ({
      step_number: item.step_number,
      step_description: item.step_description,
      step_description_bg: item.step_description,
      step_description_en: item.step_description_en || null
    }));

    setSteps(newSteps);
    alert(`✅ Generated ${newSteps.length} steps!\n\nReview and edit before saving.`);

  } catch (error: any) {
    console.error('AI Generation error:', error);
    alert(`❌ Failed: ${error.message}`);
  } finally {
    setSaving(false);
  }
}

  // Image generation functions
  function toggleStepSelection(stepNumber: number) {
    const newSelection = new Set(selectedStepsForImages);
    if (newSelection.has(stepNumber)) {
      newSelection.delete(stepNumber);
    } else {
      newSelection.add(stepNumber);
    }
    setSelectedStepsForImages(newSelection);
  }

  function selectAllSteps() {
    const allStepNumbers = new Set(steps.map(s => s.step_number));
    setSelectedStepsForImages(allStepNumbers);
  }

  function deselectAllSteps() {
    setSelectedStepsForImages(new Set());
  }

async function generateImagesForSelectedSteps() {
  if (selectedStepsForImages.size === 0) {
    alert('Please select at least one step.');
    return;
  }

  const estimatedCost = selectedStepsForImages.size * 0.04;
  const estimatedTime = Math.ceil(selectedStepsForImages.size * 15 / 60);

  if (!confirm(
    `Generate images for ${selectedStepsForImages.size} steps?\n\n` +
    `Cost: ~$${estimatedCost.toFixed(2)}\n` +
    `Time: ~${estimatedTime} min\n\n` +
    `Using Google Imagen 4`
  )) {
    return;
  }

  try {
    setGeneratingImages(true);
    setImageGenerationProgress({ current: 0, total: selectedStepsForImages.size });

    const selectedSteps = steps.filter(s => selectedStepsForImages.has(s.step_number));
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedSteps.length; i++) {
      const step = selectedSteps[i];
      setImageGenerationProgress({ current: i + 1, total: selectedSteps.length });

      try {
        console.log(`[${i + 1}/${selectedSteps.length}] Generating step ${step.step_number}...`);

        const response = await fetch('/api/generate-step-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
  recipeId: recipeId,
  recipeName: recipe?.name || 'Recipe',
  stepNumber: step.step_number,
  stepDescription: step.step_description_bg || step.step_description,
  stepDescriptionEn: step.step_description_en,
  style: 'closeup'  // closeup, pov, или medium
})
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.imageUrl || typeof data.imageUrl !== 'string') {
          throw new Error('No valid image URL returned');
        }

        console.log(`✅ Step ${step.step_number}: ${data.imageUrl.substring(0, 50)}...`);

        // ✅ FIXED: Use functional update to always get latest state
        setSteps(prevSteps => 
          prevSteps.map(s => 
            s.step_number === step.step_number 
              ? { ...s, step_image_url: data.imageUrl }
              : s
          )
        );

        successCount++;

      } catch (error: any) {
        console.error(`❌ Step ${step.step_number} failed:`, error);
        failCount++;
      }

      // Rate limit delay
      if (i < selectedSteps.length - 1) {
        console.log('⏸️  Waiting 12s...');
        await new Promise(resolve => setTimeout(resolve, 12000));
      }
    }

    alert(
  `✅ Complete!\n\n` +
  `Success: ${successCount}\n` +
  `Failed: ${failCount}\n` +
  `Cost: ~$${(successCount * 0.04).toFixed(2)}\n\n` +
  `⚠️ IMPORTANT: Click "SAVE CHANGES" to store images in database!`
);

    setSelectedStepsForImages(new Set());

  } catch (error: any) {
    console.error('Image generation error:', error);
    alert(`❌ Error: ${error.message}`);
  } finally {
    setGeneratingImages(false);
    setImageGenerationProgress(null);
  }
}

  async function recalculateNutritionFromIngredients() {
    if (!recipeId) return;
    setRecalculating(true);
    try {
      const { data: ings, error } = await supabase
        .from('recipe_ingredients')
        .select('ingredient_name, quantity, unit')
        .eq('recipe_id', recipeId);

      if (error) throw error;
      if (!ings || ings.length === 0) {
        alert('Рецептата няма добавени съставки');
        return;
      }

      const nutrition = await calculateRecipeNutrition(ings);
      setFormData(prev => ({
        ...prev,
        total_calories:  nutrition.calories,
        total_protein:   nutrition.protein,
        total_fat:       nutrition.fat,
        total_carbs:     nutrition.carbs,
        total_net_carbs: nutrition.net_carbs,
      }));
      alert(`✅ Преизчислено от ${ings.length} съставки. Провери стойностите и запази.`);
    } catch (err) {
      console.error('Грешка при преизчисляване:', err);
      alert('Грешка при преизчисляване на нутриенти');
    } finally {
      setRecalculating(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      // 1. Update base recipe
      const updateData: any = {
        ...formData,
        assembly_template_id: formData.assembly_template_id || null,
      };

      const { error: recipeError } = await supabase
        .from('base_recipes')
        .update(updateData)
        .eq('id', recipeId);

      if (recipeError) throw recipeError;

      // 2. Save tags
      await supabase.from('base_recipe_tags').delete().eq('recipe_id', recipeId);
      if (selectedTags.length > 0) {
        const tagsData = selectedTags.map(tagId => ({
          recipe_id: recipeId,
          tag_id: tagId
        }));
        await supabase.from('base_recipe_tags').insert(tagsData);
      }

      // 3. Save equipment
      await supabase.from('base_recipe_equipment').delete().eq('recipe_id', recipeId);
      if (selectedEquipment.size > 0) {
        const equipmentData = Array.from(selectedEquipment.entries()).map(([equipId, notes]) => ({
          recipe_id: recipeId,
          equipment_id: equipId,
          notes: notes || null
        }));
        await supabase.from('base_recipe_equipment').insert(equipmentData);
      }

      // 4. Delete and reinsert ingredients
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);

      const validIngredients = ingredients.filter(
        ing => ing.ingredient_name && ing.ingredient_name.trim() !== ''
      );

      if (validIngredients.length > 0) {
        const ingredientsData = validIngredients.map((ing, idx) => ({
          recipe_id: recipeId,
          ingredient_name: ing.ingredient_name.trim(),
          quantity: ing.quantity || 0,
          unit: ing.unit || 'g',
          order_index: idx,
        }));

        const { error: ingError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientsData);

        if (ingError) throw ingError;
      }

      // 5. Save steps
      await supabase.from('recipe_instruction_steps').delete().eq('recipe_id', recipeId);

      const validSteps = steps.filter(
        step => step.step_description && step.step_description.trim() !== ''
      );

      if (validSteps.length > 0) {
        const stepsData = validSteps.map(step => ({
          recipe_id: recipeId,
          step_number: step.step_number,
          step_description: step.step_description.trim(),
          step_description_bg: step.step_description_bg || step.step_description.trim(),
          step_description_en: step.step_description_en?.trim() || null,
          step_image_url: step.step_image_url || null
        }));

        const { error: stepsError } = await supabase
          .from('recipe_instruction_steps')
          .insert(stepsData);

        if (stepsError) throw stepsError;
      }

      alert('Recipe updated successfully!');
      setEditMode(false);
      loadAllData();
    } catch (error: any) {
      console.error('Error updating recipe:', error);
      alert(error.message || 'Failed to update recipe');
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditMode(false);
    loadAllData(); // Reload everything from DB
  }

  const selectedRole = recipeRoles.find(r => r.id === formData.recipe_role_id);
  const shouldShowAssemblyTemplate = 
    selectedRole?.name_en === 'Cake base' || 
    selectedRole?.name_en === 'Base' ||
    selectedRole?.name?.toLowerCase().includes('блат');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Recipe not found</p>
          <button
            onClick={() => router.push('/dashboard/base-recipes')}
            className="text-purple-600 hover:text-purple-800"
          >
            ← Back to recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-purple-600">🎂 KetoCakr Admin</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/dashboard/base-recipes')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Base Recipes
                </button>
                <span className="text-purple-600 font-semibold">
                  {recipe.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Header with Edit button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">{recipe.name}</h2>
              {recipe.name_en && (
                <p className="text-gray-600 mt-1">{recipe.name_en}</p>
              )}
            </div>
            <div className="flex gap-2">
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                >
                  Edit Recipe
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Recipe Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Basic Information</h3>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name (Bulgarian) *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name (English)
                      </label>
                      <input
                        type="text"
                        value={formData.name_en}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recipe Role *
                      </label>
                      <select
                        value={formData.recipe_role_id}
                        onChange={(e) => setFormData({ ...formData, recipe_role_id: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {recipeRoles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name} / {role.name_en}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compatible Dessert Types
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {dessertTypes.map(type => (
                          <label key={type.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.compatible_dessert_types.includes(type.id)}
                              onChange={() => toggleDessertType(type.id)}
                              className="rounded text-purple-600 focus:ring-purple-600"
                            />
                            <span className="text-sm">{type.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipe Tags
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {allTags.map(tag => (
                          <label key={tag.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedTags.includes(tag.id)}
                              onChange={() => toggleTag(tag.id)}
                              className="rounded text-purple-600 focus:ring-purple-600"
                            />
                            <span className="text-sm">
                              {tag.icon && <span className="mr-1">{tag.icon}</span>}
                              {tag.name_bg || tag.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {shouldShowAssemblyTemplate && (
                      <div className="pt-4 border-t">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assembly Template
                          <span className="text-gray-500 text-xs ml-2">(for cake bases)</span>
                        </label>
                        <select
                          value={formData.assembly_template_id || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            assembly_template_id: e.target.value ? Number(e.target.value) : null 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">No template</option>
                          {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name} {template.name_en && `(${template.name_en})`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, difficulty_level: 'easy' })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.difficulty_level === 'easy'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                              formData.difficulty_level === 'easy' ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            <span className={`text-sm font-medium ${
                              formData.difficulty_level === 'easy' ? 'text-green-700' : 'text-gray-600'
                            }`}>
                              Easy
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, difficulty_level: 'medium' })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.difficulty_level === 'medium'
                              ? 'border-yellow-500 bg-yellow-50'
                              : 'border-gray-200 hover:border-yellow-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                              formData.difficulty_level === 'medium' ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}></div>
                            <span className={`text-sm font-medium ${
                              formData.difficulty_level === 'medium' ? 'text-yellow-700' : 'text-gray-600'
                            }`}>
                              Medium
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, difficulty_level: 'hard' })}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.difficulty_level === 'hard'
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-red-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`w-6 h-6 rounded-full mx-auto mb-1 ${
                              formData.difficulty_level === 'hard' ? 'bg-red-500' : 'bg-gray-300'
                            }`}></div>
                            <span className={`text-sm font-medium ${
                              formData.difficulty_level === 'hard' ? 'text-red-700' : 'text-gray-600'
                            }`}>
                              Hard
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Visibility & Access Control */}
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="is_visible"
                          checked={formData.is_visible_to_users}
                          onChange={(e) => setFormData({ ...formData, is_visible_to_users: e.target.checked })}
                          className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <label htmlFor="is_visible" className="block text-sm font-medium text-gray-700 cursor-pointer">
                            📱 Visible in Mobile App
                          </label>
                          <p className="text-xs text-gray-500 mt-0.5">
                            If enabled, users can select this recipe when generating desserts. If disabled, only admins can use it in ready recipes.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="is_free"
                          checked={formData.is_free}
                          onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                          className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <label htmlFor="is_free" className="block text-sm font-medium text-gray-700 cursor-pointer">
                            🎁 Free Tier Access
                          </label>
                          <p className="text-xs text-gray-500 mt-0.5">
                            If enabled, available in free trial. If disabled, requires paid subscription.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    {selectedRole && (
                      <div>
                        <span className="text-gray-500">Role:</span>
                        <span className="ml-2 font-medium">{selectedRole.name}</span>
                      </div>
                    )}
                    {formData.compatible_dessert_types.length > 0 && (
                      <div>
                        <span className="text-gray-500">Compatible with:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {formData.compatible_dessert_types.map(typeId => {
                            const type = dessertTypes.find(t => t.id === typeId);
                            return type ? (
                              <span key={typeId} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                {type.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    {selectedTags.length > 0 && (
                      <div className="pt-3 border-t">
                        <span className="text-gray-500">Tags:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedTags.map(tagId => {
                            const tag = allTags.find(t => t.id === tagId);
                            return tag ? (
                              <span key={tagId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                {tag.icon && <span className="mr-1">{tag.icon}</span>}
                                {tag.name_bg || tag.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    {recipe.assembly_template_id && (
                      <div className="pt-3 border-t">
                        <span className="text-gray-500">Assembly Template:</span>
                        <div className="mt-1 bg-purple-50 text-purple-700 px-3 py-2 rounded">
                          {templates.find(t => t.id === recipe.assembly_template_id)?.name || 'Loading...'}
                        </div>
                      </div>
                    )}
                    {recipe.difficulty_level && (
                      <div>
                        <span className="text-gray-500">Difficulty:</span>
                        <div className="mt-1 inline-flex items-center gap-2 ml-2">
                          <div className={`w-4 h-4 rounded-full ${
                            recipe.difficulty_level === 'easy' ? 'bg-green-500' :
                            recipe.difficulty_level === 'medium' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}></div>
                          <span className={`font-medium capitalize ${
                            recipe.difficulty_level === 'easy' ? 'text-green-700' :
                            recipe.difficulty_level === 'medium' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            {recipe.difficulty_level}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Visibility & Access */}
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full ${
                          recipe.is_visible_to_users 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <span>{recipe.is_visible_to_users ? '👁️' : '🔒'}</span>
                          {recipe.is_visible_to_users ? 'Visible to users' : 'Admin only'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full ${
                          recipe.is_free 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          <span>{recipe.is_free ? '🎁' : '💎'}</span>
                          {recipe.is_free ? 'Free tier' : 'Premium'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Equipment */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Equipment</h3>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Required Equipment
                      </label>
                      <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {allEquipment.map(equip => (
                          <div key={equip.id} className="space-y-1">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedEquipment.has(equip.id)}
                                onChange={() => toggleEquipment(equip.id)}
                                className="rounded text-purple-600 focus:ring-purple-600"
                              />
                              <span className="text-sm">
                                {equip.icon && <span className="mr-1">{equip.icon}</span>}
                                {equip.name}
                              </span>
                            </label>
                            {selectedEquipment.has(equip.id) && (
                              <input
                                type="text"
                                value={selectedEquipment.get(equip.id) || ''}
                                onChange={(e) => updateEquipmentNotes(equip.id, e.target.value)}
                                placeholder="e.g. 20cm, optional..."
                                className="ml-6 w-full text-xs px-2 py-1 border border-gray-300 rounded"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Equipment Notes (Bulgarian)
                      </label>
                      <textarea
                        value={formData.equipment_notes}
                        onChange={(e) => setFormData({ ...formData, equipment_notes: e.target.value })}
                        rows={2}
                        placeholder="Additional equipment notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Equipment Notes (English)
                      </label>
                      <textarea
                        value={formData.equipment_notes_en}
                        onChange={(e) => setFormData({ ...formData, equipment_notes_en: e.target.value })}
                        rows={2}
                        placeholder="Additional equipment notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    {selectedEquipment.size > 0 ? (
                      <div>
                        <ul className="space-y-1">
                          {Array.from(selectedEquipment.entries()).map(([equipId, notes]) => {
                            const equip = allEquipment.find(e => e.id === equipId);
                            return equip ? (
                              <li key={equipId} className="text-sm">
                                {equip.icon && <span className="mr-1">{equip.icon}</span>}
                                {equip.name}
                                {notes && <span className="text-gray-500 text-xs ml-2">({notes})</span>}
                              </li>
                            ) : null;
                          })}
                        </ul>
                        {recipe.equipment_notes && (
                          <p className="text-xs text-gray-500 mt-3 italic pt-3 border-t">{recipe.equipment_notes}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No equipment specified</p>
                    )}
                  </div>
                )}
              </div>

              {/* Timing & Servings */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Timing & Servings</h3>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prep Time (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.prep_time_minutes}
                        onChange={(e) => setFormData({ ...formData, prep_time_minutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bake Time (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.bake_time_minutes}
                        onChange={(e) => setFormData({ ...formData, bake_time_minutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Servings
                      </label>
                      <input
                        type="number"
                        value={formData.servings}
                        onChange={(e) => setFormData({ ...formData, servings: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {recipe.prep_time_minutes && (
                      <div>
                        <span className="text-gray-500">Prep:</span>
                        <span className="ml-2 font-medium">{recipe.prep_time_minutes} min</span>
                      </div>
                    )}
                    {recipe.bake_time_minutes > 0 && (
                      <div>
                        <span className="text-gray-500">Bake:</span>
                        <span className="ml-2 font-medium">{recipe.bake_time_minutes} min</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div>
                        <span className="text-gray-500">Servings:</span>
                        <span className="ml-2 font-medium">{recipe.servings}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Nutrition */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Nutrition (Total)</h3>

                {editMode ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calories
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.total_calories}
                        onChange={(e) => setFormData({ ...formData, total_calories: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fat (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.total_fat}
                        onChange={(e) => setFormData({ ...formData, total_fat: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.total_protein}
                        onChange={(e) => setFormData({ ...formData, total_protein: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.total_carbs}
                        onChange={(e) => setFormData({ ...formData, total_carbs: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Net Carbs (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.total_net_carbs}
                        onChange={(e) => setFormData({ ...formData, total_net_carbs: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    {/* Recalculate from ingredients */}
                    <div className="mt-4 flex items-center gap-4 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={recalculateNutritionFromIngredients}
                        disabled={recalculating || !recipeId}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
                        {recalculating ? 'Преизчислява...' : '♻️ Преизчисли от съставки'}
                      </button>
                      <p className="text-xs text-gray-500">
                        Изчислява нутриентите от съставките. Не забравяй да запазиш след това.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {recipe.total_calories > 0 && (
                      <div>
                        <span className="text-gray-500">Calories:</span>
                        <span className="ml-2 font-medium">{recipe.total_calories}</span>
                      </div>
                    )}
                    {recipe.total_fat > 0 && (
                      <div>
                        <span className="text-gray-500">Fat:</span>
                        <span className="ml-2 font-medium">{recipe.total_fat}g</span>
                      </div>
                    )}
                    {recipe.total_protein > 0 && (
                      <div>
                        <span className="text-gray-500">Protein:</span>
                        <span className="ml-2 font-medium">{recipe.total_protein}g</span>
                      </div>
                    )}
                    {recipe.total_net_carbs > 0 && (
                      <div>
                        <span className="text-gray-500">Net Carbs:</span>
                        <span className="ml-2 font-medium">{recipe.total_net_carbs}g</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recipe Image Upload */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Recipe Image</h3>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          try {
                            console.log('Starting upload...', file.name);
                            
                            // Upload to Supabase Storage
                            const fileExt = file.name.split('.').pop();
                            const fileName = `recipe-${recipeId}-${Date.now()}.${fileExt}`;
                            const filePath = fileName; // Upload to root, not subfolder

                            console.log('Uploading to:', filePath);

                            const { data: uploadData, error: uploadError } = await supabase.storage
                              .from('base-recipe-images')
                              .upload(filePath, file, {
                                cacheControl: '3600',
                                upsert: false
                              });

                            if (uploadError) {
                              console.error('Upload error:', uploadError);
                              throw uploadError;
                            }

                            console.log('Upload successful:', uploadData);

                            // Get public URL
                            const { data: urlData } = supabase.storage
                              .from('base-recipe-images')
                              .getPublicUrl(filePath);

                            console.log('Public URL:', urlData.publicUrl);

                            setFormData({ ...formData, image_url: urlData.publicUrl });
                            alert('Image uploaded successfully!');
                          } catch (error: any) {
                            console.error('Upload error details:', error);
                            alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Or paste Image URL
                      </label>
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    {formData.image_url && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full max-w-sm rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EInvalid Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {recipe.image_url ? (
                      <img
                        src={recipe.image_url}
                        alt={recipe.name}
                        className="w-full max-w-md rounded-lg"
                      />
                    ) : (
                      <p className="text-gray-500 text-sm">No image uploaded</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Description</h3>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Bulgarian)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (English)
                      </label>
                      <textarea
                        value={formData.description_en}
                        onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recipe.description && <p className="text-gray-700">{recipe.description}</p>}
                    {recipe.description_en && <p className="text-gray-500 text-sm">{recipe.description_en}</p>}
                    {!recipe.description && !recipe.description_en && (
                      <p className="text-gray-400 text-sm">No description</p>
                    )}
                  </div>
                )}
              </div>

              {/* Ingredients */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">
                    Ingredients ({ingredients.filter(i => i.ingredient_name).length})
                  </h3>
                  {editMode && (
                    <button
                      onClick={addIngredient}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      + Add
                    </button>
                  )}
                </div>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ingredients Description (Bulgarian)
                      </label>
                      <textarea
                        value={formData.ingredients_text_bg}
                        onChange={(e) => setFormData({ ...formData, ingredients_text_bg: e.target.value })}
                        rows={2}
                        placeholder="Optional intro text..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ingredients Description (English)
                      </label>
                      <textarea
                        value={formData.ingredients_text_en}
                        onChange={(e) => setFormData({ ...formData, ingredients_text_en: e.target.value })}
                        rows={2}
                        placeholder="Optional intro text..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      {ingredients.map((ing, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <input
                            type="text"
                            value={ing.ingredient_name}
                            onChange={(e) => updateIngredient(index, 'ingredient_name', e.target.value)}
                            placeholder="Ingredient name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="number"
                            step="0.1"
                            value={ing.quantity || ''}
                            onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                            placeholder="Qty"
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <select
                            value={ing.unit || 'g'}
                            onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                            className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="g">g</option>
                            <option value="ml">ml</option>
                            <option value="tbsp">tbsp</option>
                            <option value="tsp">tsp</option>
                            <option value="cup">cup</option>
                            <option value="pc">pc</option>
                          </select>
                          <button
                            onClick={() => removeIngredient(index)}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    {recipe.ingredients_text_bg && (
                      <p className="text-sm text-gray-600 mb-3 italic">{recipe.ingredients_text_bg}</p>
                    )}
                    {ingredients.filter(i => i.ingredient_name).length === 0 ? (
                      <p className="text-gray-500 text-sm">No ingredients yet</p>
                    ) : (
                      <ul className="space-y-1">
                        {ingredients.filter(i => i.ingredient_name).map((ing, idx) => (
                          <li key={idx} className="text-sm">
                            <span className="font-medium">{ing.ingredient_name}</span>
                            {ing.quantity && (
                              <span className="text-gray-600">
                                {' '}— {ing.quantity} {ing.unit}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Instructions */}
              {/* Instructions - Enhanced Step Images Component */}
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-xl font-semibold mb-6">Recipe Instructions & Step Images</h3>
  
  {editMode ? (
    // Keep existing edit mode for steps
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium">Edit Steps</h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={generateStepsFromDescription}
            disabled={saving || !recipe?.description}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            🤖 Generate from Description
          </button>
          <button
            type="button"
            onClick={addStep}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            + Add Step
          </button>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-3">No steps yet</p>
          <button
            type="button"
            onClick={addStep}
            className="text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add First Step
          </button>
          {recipe?.description && (
            <button
              type="button"
              onClick={generateStepsFromDescription}
              disabled={saving}
              className="ml-2 text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              🤖 Generate from Description
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveStepUp(index)}
                    disabled={index === 0}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.step_number}
                  </div>
                  <button
                    type="button"
                    onClick={() => moveStepDown(index)}
                    disabled={index === steps.length - 1}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
                <div className="flex-1">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Bulgarian
                      </label>
                      <textarea
                        value={step.step_description}
                        onChange={(e) => updateStep(index, 'step_description', e.target.value)}
                        placeholder="Describe this step..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        English
                      </label>
                      <textarea
                        value={step.step_description_en || ''}
                        onChange={(e) => updateStep(index, 'step_description_en', e.target.value)}
                        placeholder="English translation..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="px-3 h-8 text-red-600 hover:bg-red-50 rounded"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ) : (
    // NEW: Use EnhancedStepImages component when NOT in edit mode
    <EnhancedStepImages 
      recipeId={recipeId}
      steps={steps}
      onStepsUpdate={loadAllData}
    />
  )}
</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}