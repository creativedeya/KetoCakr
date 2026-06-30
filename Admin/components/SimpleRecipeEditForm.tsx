'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { IngredientAutocomplete } from '@/components/IngredientAutocomplete';
import LabNotesManager from '@/components/LabNotesManager';

interface IngredientRow {
  id: number;
  ingredient_database_id: string | null;
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
}

export default function SimpleRecipeEditForm({ recipeId }: { recipeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [dessertTypes, setDessertTypes] = useState<any[]>([]);
  const [compatibleDessertTypes, setCompatibleDessertTypes] = useState<number[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [recipeId]);

  async function loadData() {
    setLoading(true);
    try {
      const [{ data: r }, { data: ings }, { data: types }] = await Promise.all([
        supabase.from('base_recipes').select('*').eq('id', recipeId).maybeSingle(),
        supabase.from('recipe_ingredients').select('*').eq('recipe_id', recipeId).order('order_index'),
        supabase.from('dessert_types').select('*').order('name'),
      ]);
      setRecipe(r || null);
      setIngredients((ings || []).map((i: any) => ({
        id: i.id,
        ingredient_database_id: i.ingredient_database_id,
        ingredient_name: i.ingredient_name,
        quantity: i.quantity,
        unit: i.unit,
      })));
      setDessertTypes(types || []);
      setCompatibleDessertTypes((r?.compatible_dessert_types) || []);
    } catch (err) {
      console.error('SimpleRecipeEditForm load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddIngredient(ing: any) {
    try {
      const { data, error } = await supabase.from('recipe_ingredients').insert([{
        recipe_id: recipeId,
        ingredient_database_id: ing.id,
        ingredient_name: ing.name_bg || ing.name_en || '',
        quantity: 0,
        unit: 'g',
        order_index: ingredients.length,
      }]).select().single();
      if (error) throw error;
      setIngredients(prev => [...prev, {
        id: data.id,
        ingredient_database_id: data.ingredient_database_id,
        ingredient_name: data.ingredient_name,
        quantity: data.quantity,
        unit: data.unit,
      }]);
      setIngredientSearch('');
    } catch (err) {
      console.error('Add ingredient error:', err);
      alert('Error adding ingredient');
    }
  }

  async function handleUpdateIngredient(id: number, updates: Partial<IngredientRow>) {
    try {
      const { error } = await supabase.from('recipe_ingredients').update(updates).eq('id', id);
      if (error) throw error;
      setIngredients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (err) {
      console.error('Update ingredient error:', err);
      alert('Error updating ingredient');
    }
  }

  async function handleDeleteIngredient(id: number) {
    try {
      const { error } = await supabase.from('recipe_ingredients').delete().eq('id', id);
      if (error) throw error;
      setIngredients(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Delete ingredient error:', err);
      alert('Error deleting ingredient');
    }
  }

  async function handleSaveBasic() {
    if (!recipe) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('base_recipes').update({
        name: recipe.name,
        name_en: recipe.name_en,
        description: recipe.description,
        description_en: recipe.description_en,
        prep_time_minutes: recipe.prep_time_minutes,
        servings: recipe.servings,
        difficulty_level: recipe.difficulty_level,
        is_visible_to_users: recipe.is_visible_to_users,
        is_free: recipe.is_free,
        total_calories: recipe.total_calories,
        total_protein: recipe.total_protein,
        total_carbs: recipe.total_carbs,
        total_fat: recipe.total_fat,
        total_net_carbs: recipe.total_net_carbs,

      }).eq('id', recipeId);
      if (error) throw error;
      alert('Saved');
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving');
    } finally {
      setSaving(false);
    }
  }

  const toggleDessertType = (typeId: number) => {
    const current = compatibleDessertTypes || [];
    if (current.includes(typeId)) setCompatibleDessertTypes(current.filter((i: number) => i !== typeId));
    else setCompatibleDessertTypes([...current, typeId]);
  };

  async function saveCompatibleTypes() {
    try {
      const { error } = await supabase.from('base_recipes').update({ compatible_dessert_types: compatibleDessertTypes }).eq('id', recipeId);
      if (error) throw error;
      alert('Saved dessert types');
    } catch (err) {
      console.error('Save dessert types error:', err);
      alert('Error saving');
    }
  }

  if (loading) return <div className="p-8 text-center">Зареждане...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Редактирай Простa Рецепта</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Име (BG)</label>
            <input value={recipe?.name || ''} onChange={e => setRecipe({ ...recipe, name: e.target.value })} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Име (EN)</label>
            <input value={recipe?.name_en || ''} onChange={e => setRecipe({ ...recipe, name_en: e.target.value })} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Prep Time</label>
              <input type="number" value={recipe?.prep_time_minutes || 0} onChange={e => setRecipe({ ...recipe, prep_time_minutes: Number(e.target.value) })} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Servings</label>
              <input type="number" value={recipe?.servings || 1} onChange={e => setRecipe({ ...recipe, servings: Number(e.target.value) })} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Съставки</h3>
            <div className="space-y-2 mt-2">
              {ingredients.map((ing, idx) => (
                <div key={ing.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input value={ing.ingredient_name} onChange={e => handleUpdateIngredient(ing.id, { ingredient_name: e.target.value })} className="w-full px-2 py-1 border rounded" />
                  </div>
                  <input type="number" value={ing.quantity ?? 0} onChange={e => handleUpdateIngredient(ing.id, { quantity: Number(e.target.value) })} className="w-24 px-2 py-1 border rounded" />
                  <input value={ing.unit || 'g'} onChange={e => handleUpdateIngredient(ing.id, { unit: e.target.value })} className="w-20 px-2 py-1 border rounded" />
                  <button type="button" onClick={() => handleDeleteIngredient(ing.id)} className="px-3 py-1 bg-red-50 text-red-700 rounded">Delete</button>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700">Добави съставка</label>
              <IngredientAutocomplete value={ingredientSearch} onChange={setIngredientSearch} onSelect={handleAddIngredient} placeholder="Търси съставка..." />
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Dessert Types</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {dessertTypes.map(dt => (
                <label key={dt.id} className="flex items-center space-x-2">
                  <input type="checkbox" checked={compatibleDessertTypes.includes(dt.id)} onChange={() => toggleDessertType(dt.id)} className="rounded text-purple-600" />
                  <span className="text-sm">{dt.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-2">
              <button type="button" onClick={saveCompatibleTypes} className="px-4 py-2 bg-purple-600 text-white rounded">Save Types</button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => router.push('/dashboard/base-recipes')} className="px-4 py-2 bg-gray-200 rounded">Back</button>
            <button type="button" onClick={handleSaveBasic} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
          </div>
        </div>
      </main>
    </div>
  );
}
