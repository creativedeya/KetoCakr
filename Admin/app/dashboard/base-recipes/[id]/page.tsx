'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { IngredientAutocomplete as IngredientAutocompleteNamed } from '@/components/IngredientAutocomplete';
// Local alias to avoid strict prop-type checks in this admin page
const IngredientAutocomplete: any = IngredientAutocompleteNamed;
import LabNotesManager from '@/components/LabNotesManager';
import SimpleRecipeEditForm from '@/components/SimpleRecipeEditForm';
import RecipeEquipmentManager from '@/components/RecipeEquipmentManager';
import RecipeResourcesManager from '@/components/RecipeResourcesManager';
import { EnhancedStepImages } from './EnhancedStepImages';
import { StepIngredientEditor } from './StepIngredientEditor';

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

interface AssemblyTemplate {
  id: number;
  name: string;
  name_en: string | null;
  template_key: string;
}

interface Ingredient {
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
  ingredient_id?: string;
}

interface InstructionStep {
  step_number: number;
  instruction_text: string;
}

export default function EditBaseRecipePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generatingSteps, setGeneratingSteps] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isSavingIngredients, setIsSavingIngredients] = useState(false);
  const [recipeRoles, setRecipeRoles] = useState<RecipeRole[]>([]);
  const [dessertTypes, setDessertTypes] = useState<DessertType[]>([]);
  const [allTags, setAllTags] = useState<RecipeTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Map<number, string>>(new Map());
  const [templates, setTemplates] = useState<AssemblyTemplate[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    recipe_role_id: 1,
    compatible_dessert_types: [] as number[],
    assembly_template_id: null as number | null,
    description: '',
    description_en: '',
    ingredients_text_bg: '',
    ingredients_text_en: '',
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
    equipment_notes: '',
    equipment_notes_en: '',
    is_visible_to_users: true,
    is_free: false,
    total_weight_grams: null as number | null,
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { ingredient_name: '', quantity: null, unit: 'g' }
  ]);

  const [steps, setSteps] = useState<InstructionStep[]>([
    { step_number: 1, instruction_text: '' }
  ]);
  const [savedSteps, setSavedSteps] = useState<any[]>([]);

  useEffect(() => {
    loadReferenceData();
    if (id) loadRecipe();
  }, [id]);

  async function loadRecipe() {
    const [recipeRes, ingredientsRes, stepsRes] = await Promise.all([
      supabase.from('base_recipes').select('*').eq('id', id).single(),
      supabase.from('recipe_ingredients').select('*').eq('recipe_id', id).order('order_index'),
      supabase.from('recipe_instruction_steps').select('*').eq('recipe_id', id).order('step_number'),
    ]);

    if (recipeRes.data) setFormData(prev => ({ ...prev, ...recipeRes.data }));

    if (ingredientsRes.data && ingredientsRes.data.length > 0) {
      setIngredients(ingredientsRes.data.map((ing: any) => ({
        ingredient_name: ing.ingredient_name,
        quantity: ing.quantity,
        unit: ing.unit,
        ingredient_id: ing.ingredient_database_id,
      })));
    }

    if (stepsRes.data && stepsRes.data.length > 0) {
      setSavedSteps(stepsRes.data);
      setSteps(stepsRes.data.map((s: any) => ({
        step_number: s.step_number,
        instruction_text: s.step_description,
      })));
    }

    setPageLoading(false);
  }

  async function loadReferenceData() {
    try {
      const [rolesRes, typesRes, tagsRes, equipmentRes, templatesRes] = await Promise.all([
        supabase.from('recipe_roles').select('*').order('id'),
        supabase.from('dessert_types').select('*').order('name'),
        supabase.from('recipe_tags').select('*').order('name'),
        supabase.from('equipment').select('*').order('name'),
        supabase.from('assembly_templates').select('id, name, name_en, template_key').order('name'),
      ]);
      
      if (rolesRes.data) setRecipeRoles(rolesRes.data);
      if (typesRes.data) setDessertTypes(typesRes.data);
      if (tagsRes.data) setAllTags(tagsRes.data);
      if (equipmentRes.data) setAllEquipment(equipmentRes.data);
      if (templatesRes.data) setTemplates(templatesRes.data);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  }

  function addStep() {
    setSteps([...steps, { step_number: steps.length + 1, instruction_text: '' }]);
  }

  function removeStep(index: number) {
    const updated = steps.filter((_, i) => i !== index);
    updated.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setSteps(updated);
  }

  function updateStep(index: number, text: string) {
    const updated = [...steps];
    updated[index].instruction_text = text;
    setSteps(updated);
  }

  async function handleGenerateSteps() {
    const source = formData.description || formData.description_en;
    if (!source) {
      alert('Добави описание първо (BG или EN)');
      return;
    }

    const confirmed = steps.some(s => s.instruction_text.trim())
      ? confirm('Ще се заменят текущите стъпки. Продължи?')
      : true;
    if (!confirmed) return;

    setGeneratingSteps(true);
    try {
      const res = await fetch('/api/generate-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: source })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newSteps = data.steps.map((s: any) => ({
        step_number: s.step_number,
        instruction_text: s.step_description
      }));
      setSteps(newSteps);
    } catch (err: any) {
      alert(`Грешка при генерация: ${err.message}`);
    } finally {
      setGeneratingSteps(false);
    }
  }

  function toggleDessertType(typeId: number) {
    const current = formData.compatible_dessert_types ?? [];
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

  function updateIngredient(index: number, name: string, quantity: number | null, unit: string, ingredientId?: string) {
    const updated = [...ingredients];
    updated[index] = { ingredient_name: name, quantity, unit, ingredient_id: ingredientId };
    setIngredients(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update base recipe
      const { error: recipeError } = await supabase
        .from('base_recipes')
        .update(formData)
        .eq('id', id);
      if (recipeError) throw recipeError;

      // 2. Tags: delete then insert
      await supabase.from('base_recipe_tags').delete().eq('recipe_id', id);
      if (selectedTags.length > 0) {
        await supabase.from('base_recipe_tags').insert(
          selectedTags.map(tagId => ({ recipe_id: id, tag_id: tagId }))
        );
      }

      // 3. Equipment: delete then insert
      await supabase.from('base_recipe_equipment').delete().eq('recipe_id', id);
      if (selectedEquipment.size > 0) {
        await supabase.from('base_recipe_equipment').insert(
          Array.from(selectedEquipment.entries()).map(([equipId, notes]) => ({
            recipe_id: id,
            equipment_id: equipId,
            notes: notes || null,
          }))
        );
      }

      // 4. Ingredients: delete then insert
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
      const validIngredients = ingredients.filter(ing => ing.ingredient_name?.trim());
      if (validIngredients.length > 0) {
        const { error: ingError } = await supabase.from('recipe_ingredients').insert(
          validIngredients.map((ing, idx) => ({
            recipe_id: id,
            ingredient_database_id: ing.ingredient_id || null,
            ingredient_name: ing.ingredient_name.trim(),
            quantity: ing.quantity || 0,
            unit: ing.unit || 'g',
            order_index: idx,
          }))
        );
        if (ingError) throw ingError;
      }

      // 5. Steps: delete then insert, preserving existing step_image_url
      await supabase.from('recipe_instruction_steps').delete().eq('recipe_id', id);
      const validSteps = steps.filter(s => s.instruction_text?.trim());
      if (validSteps.length > 0) {
        // Find existing image URLs from savedSteps by step_number
        const imagesByStepNumber: Record<number, string | null> = {};
        savedSteps.forEach((s: any) => {
          imagesByStepNumber[s.step_number] = s.step_image_url || null;
        });

        const { error: stepsError } = await supabase.from('recipe_instruction_steps').insert(
          validSteps.map(step => ({
            recipe_id: id,
            step_number: step.step_number,
            step_description: step.instruction_text.trim(),
            step_image_url: imagesByStepNumber[step.step_number] || null,
          }))
        );
        if (stepsError) throw stepsError;
      }

      alert('✅ Рецептата беше обновена успешно!');
      router.push('/dashboard/base-recipes');
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      alert(`Грешка: ${error.message || 'Непозната грешка'}`);
      setLoading(false);
    }
  }

  const selectedRole = recipeRoles.find(r => r.id === formData.recipe_role_id);
  const shouldShowAssemblyTemplate = 
    selectedRole?.name_en === 'Cake base' || 
    selectedRole?.name_en === 'Base' ||
    selectedRole?.name?.toLowerCase().includes('блат');

  async function handleDuplicate() {
    if (!confirm('Duplicate this recipe?')) return;
    setIsDuplicating(true);
    try {
      const res = await fetch('/api/base-recipes/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed');
      router.push(`/dashboard/base-recipes/${data.newRecipe.id}`);
    } catch (err: any) {
      alert('Error duplicating recipe: ' + err.message);
    } finally {
      setIsDuplicating(false);
    }
  }

  async function saveIngredients() {
    setIsSavingIngredients(true);
    try {
      const validIngredients = ingredients.filter(ing => ing.ingredient_name?.trim());

      const res = await fetch(`/api/base-recipes/${id}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: validIngredients.map((ing, idx) => ({
            ingredient_database_id: ing.ingredient_id || null,
            ingredient_name: ing.ingredient_name.trim(),
            quantity: ing.quantity || 0,
            unit: ing.unit || 'g',
            order_index: idx,
          })),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      alert('✅ Съставките са запазени!');
      await loadRecipe();
    } catch (err: any) {
      alert('❌ Грешка: ' + err.message);
    } finally {
      setIsSavingIngredients(false);
    }
  }

  if (pageLoading) return <div className="p-8 text-center">Зареждане...</div>;

  if ((formData as any).is_simple_recipe) {
    return <SimpleRecipeEditForm recipeId={id} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Редактирай Рецепта</h1>
        </div>
      </div>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Основна Информация</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Име (Български) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Име (Английски)
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Роля на Рецептата *
              </label>
              <select
                value={formData.recipe_role_id}
                onChange={(e) => setFormData({ ...formData, recipe_role_id: Number(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                {recipeRoles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} / {role.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Съвместим с Типове Десерти
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {dessertTypes.map(type => (
                  <label key={type.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.compatible_dessert_types?.includes(type.id) ?? false}
                      onChange={() => toggleDessertType(type.id)}
                      className="rounded text-purple-600 focus:ring-purple-600"
                    />
                    <span className="text-sm">{type.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4">
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

            {/* Difficulty */}
            <div className="mt-4">
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

            {/* Assembly Template */}
            {shouldShowAssemblyTemplate && (
              <div className="mt-4 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assembly Template
                  <span className="text-gray-500 text-xs ml-2">(for cake bases)</span>
                </label>
                <select
                  value={formData.assembly_template_id || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    assembly_template_id: e.target.value ? Number(e.target.value) : null 
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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

            {/* Visibility & Access Control */}
            <div className="mt-4 pt-4 border-t space-y-3">
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
                    If enabled, users can select this recipe when generating desserts.
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

          {/* Equipment */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Equipment</h2>

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

            <div className="mt-4">
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

            <div className="mt-2">
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

          {/* Ingredients */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Ingredients</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                + Add
              </button>
            </div>

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

              <div className="space-y-3">
                {ingredients.map((ing, index) => (
                  <IngredientAutocomplete
                    key={index}
                    value={ing.ingredient_name}
                    quantity={ing.quantity}
                    unit={ing.unit || 'g'}
                    onChange={(name) => updateIngredient(index, name, ing.quantity, ing.unit || 'g', ing.ingredient_id)}
                    onQuantityChange={(qty) => updateIngredient(index, ing.ingredient_name, qty, ing.unit || 'g', ing.ingredient_id)}
                    onUnitChange={(unit) => updateIngredient(index, ing.ingredient_name, ing.quantity, unit, ing.ingredient_id)}
                    onSelect={(ingOption) => updateIngredient(index, ingOption.name_bg, ing.quantity, ing.unit || 'g', ingOption.id)}
                    onRemove={() => removeIngredient(index)}
                  />
                ))}
              </div>
            </div>

            {/* Save Ingredients Button */}
            <div className="flex justify-end mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={saveIngredients}
                disabled={isSavingIngredients}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white rounded-lg font-medium text-sm transition"
              >
                {isSavingIngredients ? '⟳ Запазване...' : '💾 Запази Съставките'}
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Описание</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание (Български)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание (Английски)
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Timing & Servings */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Време и Порции</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Подготовка (минути)
                </label>
                <input
                  type="number"
                  value={formData.prep_time_minutes}
                  onChange={(e) => setFormData({ ...formData, prep_time_minutes: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Печене (минути)
                </label>
                <input
                  type="number"
                  value={formData.bake_time_minutes}
                  onChange={(e) => setFormData({ ...formData, bake_time_minutes: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Порции
                </label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Nutrition */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Хранителна Информация (Общо)</h2>
              <button
                type="button"
                onClick={async () => {
                  try {
                    // Force trigger by updating updated_at (always fires)
                    const { error } = await supabase
                      .from('base_recipes')
                      .update({ updated_at: new Date().toISOString() })
                      .eq('id', id);
                    if (error) throw error;

                    // Wait briefly for trigger to complete
                    await new Promise(resolve => setTimeout(resolve, 300));

                    // Reload ALL nutrition fields
                    const { data } = await supabase
                      .from('base_recipes')
                      .select('total_calories, total_fat, total_protein, total_carbs, total_net_carbs, total_fiber, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, net_carbs_per_100g, total_weight_grams')
                      .eq('id', id)
                      .single();

                    if (data) {
                      setFormData(prev => ({
                        ...prev,
                        total_calories: data.total_calories ?? prev.total_calories,
                        total_fat: data.total_fat ?? prev.total_fat,
                        total_protein: data.total_protein ?? prev.total_protein,
                        total_carbs: data.total_carbs ?? prev.total_carbs,
                        total_net_carbs: data.total_net_carbs ?? prev.total_net_carbs,
                      }));
                    }

                    alert('✅ Нутриентите са преизчислени!');
                  } catch (err: any) {
                    alert(`Грешка: ${err.message}`);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                🔄 Преизчисли Нутриенти
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Калории
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.total_calories}
                  onChange={(e) => setFormData({ ...formData, total_calories: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Мазнини (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.total_fat}
                  onChange={(e) => setFormData({ ...formData, total_fat: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Протеини (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.total_protein}
                  onChange={(e) => setFormData({ ...formData, total_protein: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Въглехидрати (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.total_carbs}
                  onChange={(e) => setFormData({ ...formData, total_carbs: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Нето Въглехидрати (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.total_net_carbs}
                  onChange={(e) => setFormData({ ...formData, total_net_carbs: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Изображение</h2>
            
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
                      const fd = new FormData();
                      fd.append('file', file);

                      const response = await fetch('/api/upload-recipe-image', {
                        method: 'POST',
                        body: fd,
                      });

                      if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.error || 'Upload failed');
                      }

                      const { imageUrl } = await response.json();
                      setFormData({ ...formData, image_url: imageUrl });
                      alert('Image uploaded successfully!');
                    } catch (error: any) {
                      console.error('Upload error:', error);
                      alert(`Failed to upload: ${error.message}`);
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
                  />
                </div>
              )}
            </div>
          </div>

          {/* Instruction Steps */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Стъпки за Приготвяне</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerateSteps}
                  disabled={generatingSteps}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm disabled:opacity-50"
                >
                  {generatingSteps ? '⏳ Генерира...' : '✨ Генерирай от описание'}
                </button>
                <button
                  type="button"
                  onClick={addStep}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                  + Добави Стъпка
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex gap-3 items-start">
                    <div className="w-12 pt-2 text-center font-semibold text-purple-600">
                      {step.step_number}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={step.instruction_text}
                        onChange={(e) => updateStep(index, e.target.value)}
                        placeholder="Опишете стъпката..."
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {savedSteps.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-1">🥚 Съставки & Оборудване по Стъпка</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Назначете съставки и оборудване за всяка стъпка — показват се в Cooking Mode на мобилното приложение.
                </p>
                <StepIngredientEditor
                  recipeId={id}
                  steps={savedSteps}
                  onStepsUpdate={async () => {
                    const { data } = await supabase
                      .from('recipe_instruction_steps')
                      .select('*')
                      .eq('recipe_id', id)
                      .order('step_number');
                    if (data) setSavedSteps(data);
                  }}
                />
              </div>
            )}

            {savedSteps.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">📸 Изображения за Стъпки</h3>
                <EnhancedStepImages
                  key={savedSteps.map(s => `${s.step_number}-${s.step_image_url ?? 'x'}`).join('|')}
                  recipeId={id}
                  steps={savedSteps}
                  recipeName={formData.name_en || formData.name}
                  ingredients={ingredients.filter(i => i.ingredient_name).map(i => `${i.quantity ?? ''} ${i.unit ?? ''} ${i.ingredient_name}`.trim()).join(', ')}
                  utensils={formData.equipment_notes_en || formData.equipment_notes}
                  onStepsUpdate={async () => {
                    const { data } = await supabase
                      .from('recipe_instruction_steps')
                      .select('*')
                      .eq('recipe_id', id)
                      .order('step_number');
                    if (data) setSavedSteps(data);
                  }}
                />
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => router.push('/dashboard/base-recipes')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отказ
            </button>
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {isDuplicating ? '⟳ Копиране...' : '⎘ Копирай'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Запазване...' : 'Запази Промените'}
            </button>
          </div>
        </form>

        {/* Lab Notes */}
        <div className="mt-6 bg-white rounded-lg border p-6">
          <LabNotesManager
            recipeId={id}
            onUpdate={() => {}}
          />
        </div>

        {/* Equipment Manager */}
        <div className="mt-6 bg-white rounded-lg border p-6">
          <RecipeEquipmentManager recipeId={id} />
        </div>

        {/* Resources Manager */}
        <div className="mt-6 bg-white rounded-lg border p-6">
          <RecipeResourcesManager recipeId={id} recipeType="base" />
        </div>
      </main>
    </div>
  );
}
