'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, X } from 'lucide-react';

export interface StepIngredient {
  ingredient_id: string;  // UUID
  ingredient_name: string;
  quantity: number;
  unit: string;
}

interface IngredientRow {
  id: string;
  name_bg: string;
  name_en: string | null;
  calories_per_100g: number | null;
}

const UNITS = ['g', 'ml', 'бр', 'с.л.', 'ч.л.', 'щипка'];

interface StepIngredientsSelectorProps {
  stepNumber: number;
  ingredients: StepIngredient[];
  onIngredientsChange: (ingredients: StepIngredient[]) => void;
}

export function StepIngredientsSelector({
  stepNumber,
  ingredients,
  onIngredientsChange,
}: StepIngredientsSelectorProps) {
  const [allIngredients, setAllIngredients] = useState<IngredientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadIngredients();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function loadIngredients() {
    try {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await supabase
        .from('ingredients_database')
        .select('id, name_bg, name_en, calories_per_100g')
        .order('name_bg', { ascending: true });

      if (error) throw error;
      setAllIngredients(data || []);
    } catch (err: any) {
      console.error('[StepIngredients] Load error:', err);
      setLoadError(err.message || 'Грешка при зареждане');
    } finally {
      setLoading(false);
    }
  }

  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allIngredients
      .filter(
        ing =>
          ing.name_bg.toLowerCase().includes(q) ||
          (ing.name_en && ing.name_en.toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [searchQuery, allIngredients]);

  function addIngredient(row: IngredientRow) {
    if (ingredients.some(i => i.ingredient_id === row.id)) return;
    onIngredientsChange([
      ...ingredients,
      { ingredient_id: row.id, ingredient_name: row.name_bg, quantity: 100, unit: 'g' },
    ]);
    setSearchQuery('');
    setShowDropdown(false);
  }

  function removeIngredient(id: string) {
    onIngredientsChange(ingredients.filter(i => i.ingredient_id !== id));
  }

  function updateField(id: string, field: 'quantity' | 'unit', value: string | number) {
    onIngredientsChange(
      ingredients.map(i =>
        i.ingredient_id === id ? { ...i, [field]: value } : i
      )
    );
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
        <button type="button" onClick={loadIngredients} className="ml-2 underline">
          Опитай пак
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-900">
        Съставки за Стъпка {stepNumber}
      </div>

      {/* Search / add */}
      <div ref={wrapperRef} className="relative">
        <input
          type="text"
          placeholder="Търси съставка (мука, яйце, захар...)..."
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
        />

        {showDropdown && searchQuery && filteredIngredients.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-56 overflow-y-auto">
            {filteredIngredients.map(ing => (
              <button
                key={ing.id}
                type="button"
                onMouseDown={e => { e.preventDefault(); addIngredient(ing); }}
                className="w-full text-left px-3 py-2 hover:bg-purple-50 border-b border-gray-100 last:border-b-0 text-sm"
              >
                <div className="font-medium text-gray-900">{ing.name_bg}</div>
                {ing.name_en && (
                  <div className="text-xs text-gray-400">{ing.name_en}</div>
                )}
              </button>
            ))}
          </div>
        )}

        {showDropdown && searchQuery.trim() && filteredIngredients.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg p-3 text-sm text-gray-500 z-20">
            Няма резултати
          </div>
        )}
      </div>

      {/* Selected list */}
      <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
        {ingredients.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            Добавете съставки за тази стъпка...
          </div>
        ) : (
          ingredients.map(ing => (
            <div
              key={ing.ingredient_id}
              className="bg-white p-2 rounded border border-gray-200 flex items-center gap-2"
            >
              <div className="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate">
                {ing.ingredient_name}
              </div>
              <input
                type="number"
                min={0}
                value={ing.quantity}
                onChange={e =>
                  updateField(ing.ingredient_id, 'quantity', parseFloat(e.target.value) || 0)
                }
                className="w-16 px-1.5 py-1 border border-gray-300 rounded text-xs text-center"
              />
              <select
                value={ing.unit}
                onChange={e => updateField(ing.ingredient_id, 'unit', e.target.value)}
                className="px-1.5 py-1 border border-gray-300 rounded text-xs"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeIngredient(ing.ingredient_id)}
                className="text-red-500 hover:text-red-700 p-0.5 shrink-0"
              >
                <X size={15} />
              </button>
            </div>
          ))
        )}
      </div>

      {ingredients.length > 0 && (
        <div className="text-xs text-gray-500">
          ✓ {ingredients.length} съставк{ingredients.length === 1 ? 'а' : 'и'}
        </div>
      )}
    </div>
  );
}
