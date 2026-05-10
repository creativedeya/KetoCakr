'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link, RefreshCw, AlertCircle } from 'lucide-react';

interface UnlinkedIngredient {
  id: string;
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
}

interface IngredientMatch {
  id: string;
  name: string;
  score: number;
}

interface IngredientRowProps {
  ingredient: UnlinkedIngredient;
  onLinked: () => void;
}

function IngredientRow({ ingredient, onLinked }: IngredientRowProps) {
  const [matches, setMatches] = useState<IngredientMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, [ingredient.id]);

  async function fetchMatches() {
    setLoading(true);
    try {
      const res = await fetch('/api/recipe-ingredients/suggest-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredientName: ingredient.ingredient_name }),
      });
      const data = await res.json();
      setMatches(data.matches || []);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLink(databaseId: string) {
    setLinking(databaseId);
    try {
      const { error } = await supabase
        .from('recipe_ingredients')
        .update({ ingredient_database_id: databaseId })
        .eq('id', ingredient.id);

      if (error) throw error;
      onLinked();
    } catch (err: any) {
      alert(`Failed to link: ${err.message}`);
      setLinking(null);
    }
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      {/* Ingredient name + quantity */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="font-medium text-gray-900">{ingredient.ingredient_name}</span>
          {ingredient.quantity && (
            <span className="text-gray-500 text-sm ml-2">
              — {ingredient.quantity} {ingredient.unit}
            </span>
          )}
        </div>
        <button
          onClick={fetchMatches}
          title="Retry matching"
          className="text-gray-400 hover:text-gray-600 p-1 rounded"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Matches */}
      {loading ? (
        <p className="text-xs text-gray-400 italic">Searching...</p>
      ) : matches.length === 0 ? (
        <p className="text-xs text-red-500 italic">No matches found (below 50% similarity)</p>
      ) : (
        <div className="space-y-1.5">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-700">{match.name}</span>
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    match.score >= 0.8
                      ? 'bg-green-100 text-green-700'
                      : match.score >= 0.6
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {Math.round(match.score * 100)}%
                </span>
              </div>
              <button
                onClick={() => handleLink(match.id)}
                disabled={linking !== null}
                className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Link className="h-3 w-3" />
                {linking === match.id ? 'Linking...' : 'Link'}
              </button>
            </div>
          ))}
        </div>
      )}
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
