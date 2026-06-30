'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import IngredientAutocomplete from '@/components/IngredientAutocomplete';
import LabNotesManager from '@/components/LabNotesManager';

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

export default function NewBaseRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [createdRecipeId, setCreatedRecipeId] = useState<string | null>(null);
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
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { ingredient_name: '', quantity: null, unit: 'g' }
  ]);

  const [steps, setSteps] = useState<InstructionStep[]>([
    { step_number: 1, instruction_text: '' }
  ]);

  useEffect(() => {
    loadReferenceData();
  }, []);

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

  function updateIngredient(index: number, name: string, quantity: number | null, unit: string, ingredientId?: string) {
    const updated = [...ingredients];
    updated[index] = { ingredient_name: name, quantity, unit, ingredient_id: ingredientId };
    setIngredients(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create base recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('base_recipes')
        .insert([formData])
        .select()
        .single();

      if (recipeError) throw recipeError;

      setCreatedRecipeId(recipe.id);

      // 2. Insert tags
      if (selectedTags.length > 0) {
        const tagsData = selectedTags.map(tagId => ({
          recipe_id: recipe.id,
          tag_id: tagId
        }));
        await supabase.from('base_recipe_tags').insert(tagsData);
      }

      // 3. Insert equipment
      if (selectedEquipment.size > 0) {
        const equipmentData = Array.from(selectedEquipment.entries()).map(([equipId, notes]) => ({
          recipe_id: recipe.id,
          equipment_id: equipId,
          notes: notes || null
        }));
        await supabase.from('base_recipe_equipment').insert(equipmentData);
      }

      // 4. Insert ingredients
      const validIngredients = ingredients.filter(
        ing => ing.ingredient_name && ing.ingredient_name.trim() !== ''
      );

      if (validIngredients.length > 0) {
        const ingredientsData = validIngredients.map((ing, idx) => ({
          recipe_id: recipe.id,
          ingredient_database_id: ing.ingredient_id || null,
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

      // 5. Insert steps
      const validSteps = steps.filter(
        step => step.instruction_text && step.instruction_text.trim() !== ''
      );

      if (validSteps.length > 0) {
        const stepsData = validSteps.map(step => ({
          recipe_id: recipe.id,
          step_number: step.step_number,
          instruction_text: step.instruction_text.trim()
        }));

        const { error: stepsError } = await supabase
          .from('recipe_instruction_steps')
          .insert(stepsData);

        if (stepsError) throw stepsError;
      }

      alert('✅ Рецептата беше създадена успешно! Сега можеш да добавиш Lab Notes.');
    } catch (error: any) {
      console.error('Error creating recipe:', error);
      alert(`Грешка при създаване на рецептата: ${error.message || 'Непозната грешка'}`);
      setLoading(false);
    }
  }

  const selectedRole = recipeRoles.find(r => r.id === formData.recipe_role_id);
  const shouldShowAssemblyTemplate = 
    selectedRole?.name_en === 'Cake base' || 
    selectedRole?.name_en === 'Base' ||
    selectedRole?.name?.toLowerCase().includes('блат');

  // If recipe created, show Lab Notes section
  if (createdRecipeId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">✅ Рецепта Създадена!</h1>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-900 mb-2">Рецептата "{formData.name}" е успешно създадена!</h2>
            <p className="text-green-700 mb-4">Сега можеш да добавиш Lab Notes за тази рецепта:</p>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <LabNotesManager
              recipeId={createdRecipeId}
              onUpdate={() => {
                // Refresh if needed
              }}
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => router.push('/dashboard/base-recipes')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Преди към Рецепти
            </button>
            <button
              onClick={() => router.push(`/dashboard/base-recipes/${createdRecipeId}`)}
              className="px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
            >
              Отвори Рецепта
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Нова Базова Рецепта</h1>
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
                    onChange={(name, qty, unit, id) => updateIngredient(index, name, qty, unit, id)}
                    onSelect={(ingOption) => updateIngredient(index, ingOption.name_bg, ing.quantity, ing.unit || 'g', ingOption.id)}
                    onRemove={() => removeIngredient(index)}
                  />
                ))}
              </div>
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
            <h2 className="text-xl font-semibold mb-4">Хранителна Информация (Общо)</h2>
            
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
              <button
                type="button"
                onClick={addStep}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                + Добави Стъпка
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-3 items-start">
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
              ))}
            </div>
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
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Запазване...' : 'Създай Рецепта'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
