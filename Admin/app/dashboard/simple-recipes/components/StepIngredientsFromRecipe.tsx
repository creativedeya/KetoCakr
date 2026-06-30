'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface RecipeIngredient {
  id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  ingredient_database_id?: number;
}

interface StepIngredientsFromRecipeProps {
  stepNumber: number;
  recipeId: string;
  selectedIngredientIds: number[];
  onIngredientsChange: (ingredientIds: number[]) => void;
}

export function StepIngredientsFromRecipe({
  stepNumber,
  recipeId,
  selectedIngredientIds,
  onIngredientsChange,
}: StepIngredientsFromRecipeProps) {
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadRecipeIngredients();
  }, [recipeId]);

  async function loadRecipeIngredients() {
    try {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .select('id, ingredient_name, quantity, unit, ingredient_database_id')
        .eq('recipe_id', recipeId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setRecipeIngredients(data || []);
    } catch (err: any) {
      console.error('[StepIngredientsFromRecipe] Load error:', err);
      setLoadError(err.message || 'Грешка при зареждане');
    } finally {
      setLoading(false);
    }
  }

  function toggleIngredient(ingredientId: number) {
    if (selectedIngredientIds.includes(ingredientId)) {
      onIngredientsChange(selectedIngredientIds.filter(id => id !== ingredientId));
    } else {
      onIngredientsChange([...selectedIngredientIds, ingredientId]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Loader2 className="animate-spin" size={16} />
        <span>Зарежда съставки...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
        {loadError}
        <button type="button" onClick={loadRecipeIngredients} className="ml-2 underline">
          Опитай пак
        </button>
      </div>
    );
  }

  if (recipeIngredients.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-900">
        ⚠️ Няма съставки в тази рецепта. Добавете ги от основната форма.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-900">
        Кои съставки се използват в Стъпка {stepNumber}?
      </div>

      <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
        {recipeIngredients.map(ing => (
          <label
            key={ing.id}
            className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded transition"
          >
            <input
              type="checkbox"
              checked={selectedIngredientIds.includes(ing.id)}
              onChange={() => toggleIngredient(ing.id)}
              className="w-4 h-4 rounded text-purple-600 cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-sm">{ing.ingredient_name}</div>
              <div className="text-xs text-gray-500">
                {ing.quantity} {ing.unit}
              </div>
            </div>
          </label>
        ))}
      </div>

      {selectedIngredientIds.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 p-2 rounded text-xs text-purple-900">
          ✓ {selectedIngredientIds.length}/{recipeIngredients.length} съставки избрани за Стъпка {stepNumber}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs text-blue-900">
        💡 Чекирайте съставките, които влизат в тази конкретна стъпка.
        Помага за визуално представяне и shopping list в мобилното приложение.
      </div>
    </div>
  );
}
