'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SimpleRecipeForm from '../components/SimpleRecipeForm';

export default function SimpleRecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [recipeData, setRecipeData] = useState<any>(null);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [labNotes, setLabNotes] = useState<any[]>([]);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isAutoPublishing, setIsAutoPublishing] = useState(false);
  const [autoPublishResult, setAutoPublishResult] = useState('');

  useEffect(() => {
    loadAll();
  }, [recipeId]);

  async function loadAll() {
    setLoading(true);
    try {
      const res = await fetch(`/api/simple-recipes/${recipeId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Load failed');

      // Merge ready_recipe fields into initialData with ready_ prefix so
      // SimpleRecipeForm can hydrate the Tab 4 dropdowns (dessert type, container, difficulty)
      const merged = {
        ...json.data,
        ready_dessert_type_id: json.ready_recipe?.dessert_type_id || null,
        ready_serving_container_id: json.ready_recipe?.serving_container_id || null,
        ready_difficulty_level: json.ready_recipe?.difficulty_level ?? 2,
      };
      setRecipeData(merged);
      setIngredients(json.ingredients || []);
      setSteps(json.steps || []);
      setEquipment(json.equipment || []);
      setLabNotes(json.lab_notes || []);
    } catch (err: any) {
      console.error('[Recipe Detail] Load error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDuplicate() {
    if (!confirm('Дублирай тази рецепта?')) return;
    setIsDuplicating(true);
    try {
      const res = await fetch('/api/base-recipes/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed');
      router.push(`/dashboard/simple-recipes/${data.newRecipe.id}`);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsDuplicating(false);
    }
  }

  async function handleAutoPublish() {
    setIsAutoPublishing(true);
    setAutoPublishResult('');
    try {
      const res = await fetch(`/api/simple-recipes/${recipeId}/publish`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) throw new Error(data.warning || data.error);
      const n = data.nutrition;
      setAutoPublishResult(`✅ ${n ? `${n.calories} кcal · ${n.protein}g · ${n.net_carbs}g NC` : 'Нутриентите са изчислени'}`);
      await loadAll();
    } catch (err: any) {
      setAutoPublishResult(`❌ ${err.message}`);
    } finally {
      setIsAutoPublishing(false);
    }
  }

  if (loading) return <div className="p-8 text-gray-400">Зареждане...</div>;
  if (!recipeData) return <div className="p-8 text-red-600">Рецептата не е намерена</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard/simple-recipes" className="text-sm text-gray-400 hover:text-gray-600 shrink-0">
              ← Simple Recipes
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {recipeData.name_en || recipeData.name}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {autoPublishResult && (
              <span className={`text-sm ${autoPublishResult.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {autoPublishResult}
              </span>
            )}
            <button
              onClick={handleAutoPublish}
              disabled={isAutoPublishing}
              className="px-3 py-1.5 bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 rounded-lg text-sm font-medium transition"
            >
              {isAutoPublishing ? '⟳' : '⚡'} Нутриенти
            </button>
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 rounded-lg text-sm font-medium transition"
            >
              {isDuplicating ? '⟳' : '⎘'} Копирай
            </button>
          </div>
        </div>

        {/* Main wizard — single write point for all recipe data */}
        <SimpleRecipeForm
          recipeId={recipeId}
          initialData={recipeData}
          initialIngredients={ingredients}
          initialSteps={steps}
          initialEquipment={equipment}
          initialLabNotes={labNotes}
          onSaved={() => loadAll()}
        />


      </div>
    </div>
  );
}
