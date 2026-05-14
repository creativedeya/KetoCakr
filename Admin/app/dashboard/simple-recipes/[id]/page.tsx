'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import SimpleRecipeForm from '../components/SimpleRecipeForm';
import { EnhancedStepImages } from './EnhancedStepImages';

export default function EditSimpleRecipePage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<any>(null);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/simple-recipes/${id}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setRecipe(data.data);
      setIngredients(data.data.ingredients || []);
      setSteps(data.data.steps || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reloadSteps = async () => {
    try {
      const res = await fetch(`/api/simple-recipes/${id}`);
      const data = await res.json();
      if (data.success) setSteps(data.data.steps || []);
    } catch {}
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-400">Loading recipe...</div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Recipe not found'}
          </div>
          <Link href="/dashboard/simple-recipes" className="mt-4 inline-block text-gray-500 hover:text-gray-700 text-sm">
            ← Back to list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/simple-recipes"
              className="text-gray-400 hover:text-gray-600 text-sm">
              ← Simple Recipes
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-xl font-bold text-gray-900">
              {recipe.name}
              {recipe.published_at && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-normal">
                  Published
                </span>
              )}
            </h1>
          </div>
          <div className="text-xs text-gray-400">
            ID: {id.slice(0, 8)}...
          </div>
        </div>

        {/* Edit form */}
        <SimpleRecipeForm
          recipeId={id}
          initialData={recipe}
          initialIngredients={ingredients}
          initialSteps={steps}
          onSaved={() => {}}
        />

        {/* Step Images — full enhanced workflow */}
        {steps.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">🎨 Step Images</h2>
            <EnhancedStepImages
              recipeId={id}
              steps={steps}
              onStepsUpdate={reloadSteps}
              recipeName={recipe.name_en || recipe.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}
