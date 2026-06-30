'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { IngredientAutocomplete } from '@/components/IngredientAutocomplete';

interface UnlinkedIngredient {
  id: string;
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
}

interface IngredientRowProps {
  ingredient: UnlinkedIngredient;
  onLinked: () => void;
}

function IngredientRow({ ingredient, onLinked }: IngredientRowProps) {
  const [name, setName] = useState(ingredient.ingredient_name);
  const [quantity, setQuantity] = useState<number | null>(ingredient.quantity);
  const [unit, setUnit] = useState(ingredient.unit ?? '');
  const [saving, setSaving] = useState(false);

  const isDirty =
    name !== ingredient.ingredient_name ||
    quantity !== ingredient.quantity ||
    unit !== (ingredient.unit ?? '');

  async function handleSelect(option: { id: string; name_bg: string; name_en: string }) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('recipe_ingredients')
        .update({
          ingredient_database_id: option.id,
          ingredient_name: option.name_bg,
          quantity,
          unit: unit || null,
        })
        .eq('id', ingredient.id);
      if (error) throw error;
      onLinked();
    } catch (err: any) {
      alert(`Failed to link: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('recipe_ingredients')
        .update({ ingredient_name: name.trim(), quantity, unit: unit || null })
        .eq('id', ingredient.id);
      if (error) throw error;
      onLinked();
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('id', ingredient.id);
      if (error) throw error;
      onLinked();
    } catch (err: any) {
      alert(`Failed to remove: ${err.message}`);
      setSaving(false);
    }
  }

  return (
    <div className="p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2">
        {/* Editable name with autocomplete */}
        <IngredientAutocomplete
          value={name}
          onChange={setName}
          onSelect={handleSelect}
          placeholder="Търси в базата..."
          className="flex-1"
        />

        {/* Quantity */}
        <input
          type="number"
          min={0}
          step={0.1}
          value={quantity ?? ''}
          onChange={e => setQuantity(e.target.value === '' ? null : parseFloat(e.target.value))}
          placeholder="qty"
          className="w-20 px-2 py-2 border border-gray-300 rounded-lg text-sm"
        />

        {/* Unit */}
        <input
          type="text"
          value={unit}
          onChange={e => setUnit(e.target.value)}
          placeholder="unit"
          className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-sm"
        />

        {/* Save button — visible when any field changed */}
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs bg-blue-600 text-white px-2 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap flex-shrink-0"
          >
            {saving ? '...' : 'Запази'}
          </button>
        )}

        {saving && !isDirty && (
          <RefreshCw className="h-3.5 w-3.5 text-gray-400 animate-spin flex-shrink-0" />
        )}

        {/* Remove */}
        <button
          onClick={handleRemove}
          disabled={saving}
          className="text-red-400 hover:text-red-600 disabled:opacity-50 px-1 text-lg leading-none flex-shrink-0"
        >
          ×
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Избери от менюто за автоматично свързване, или редактирай и натисни Запази
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface UnlinkedIngredientsProps {
  recipeId: string;
  onLinked: () => void;
}

export function UnlinkedIngredients({ recipeId, onLinked }: UnlinkedIngredientsProps) {
  const [unlinked, setUnlinked] = useState<UnlinkedIngredient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnlinked();
  }, [recipeId]);

  async function loadUnlinked() {
    setLoading(true);
    const { data } = await supabase
      .from('recipe_ingredients')
      .select('id, ingredient_name, quantity, unit')
      .eq('recipe_id', recipeId)
      .is('ingredient_database_id', null);

    setUnlinked(data || []);
    setLoading(false);
  }

  function handleLinked() {
    // Remove the linked ingredient from local list immediately for snappy UX,
    // then reload the parent's ingredient list (which recalculates nutrition)
    loadUnlinked();
    onLinked();
  }

  if (loading) return null;
  if (unlinked.length === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-800">
            Unlinked Ingredients ({unlinked.length})
          </h3>
        </div>
        <button
          onClick={loadUnlinked}
          className="flex items-center gap-1.5 text-xs text-yellow-700 hover:text-yellow-900 px-2 py-1 rounded hover:bg-yellow-100 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>
      <p className="text-sm text-yellow-700 mb-4">
        These ingredients are not linked to the database — nutrition cannot be calculated for them.
        Link each one to enable automatic nutrition tracking.
      </p>

      <div className="space-y-3">
        {unlinked.map((ing) => (
          <IngredientRow key={ing.id} ingredient={ing} onLinked={handleLinked} />
        ))}
      </div>
    </div>
  );
}
