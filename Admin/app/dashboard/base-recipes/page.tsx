'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface BaseRecipe {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  prep_time_minutes: number | null;
  difficulty_level: string | null;
  recipe_role_id: number | null;
  assembly_template_id: number | null;
  image_url: string | null;
  is_visible_to_users: boolean;
  is_free: boolean;
  created_at: string;
  stepCount?: number;
  ingredientCount?: number;
  assembly_template?: {
    id: number;
    name: string;
    template_key: string;
  };
}

interface RecipeRole {
  id: number;
  name: string;
  name_en: string;
}

export default function BaseRecipesPage() {
  const [recipes, setRecipes] = useState<BaseRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<BaseRecipe[]>([]);
  const [recipeRoles, setRecipeRoles] = useState<RecipeRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [filterRole, setFilterRole] = useState<number | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadRecipes();
    loadRecipeRoles();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [searchQuery, filterStatus, filterRole, recipes]);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    }
  }

  async function loadRecipes() {
    try {
      setLoading(true);

      // Get all recipes with assembly template info
      const { data: recipesData, error: recipesError } = await supabase
        .from('base_recipes')
        .select(`
          *,
          assembly_template:assembly_templates(id, name, template_key)
        `)
        .order('name');

      if (recipesError) throw recipesError;

      // Get step counts for each recipe
      const recipesWithCounts = await Promise.all(
        (recipesData || []).map(async (recipe) => {
          // Count steps
          const { count: stepCount } = await supabase
            .from('recipe_instruction_steps')
            .select('*', { count: 'exact', head: true })
            .eq('recipe_id', recipe.id);

          // Count ingredients
          const { count: ingredientCount } = await supabase
            .from('recipe_ingredients')
            .select('*', { count: 'exact', head: true })
            .eq('recipe_id', recipe.id);

          return {
            ...recipe,
            stepCount: stepCount || 0,
            ingredientCount: ingredientCount || 0,
          };
        })
      );

      setRecipes(recipesWithCounts);
    } catch (error) {
      console.error('Error loading recipes:', error);
      alert('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }

  async function loadRecipeRoles() {
    try {
      const { data, error } = await supabase
        .from('recipe_roles')
        .select('*')
        .order('id');

      if (error) throw error;
      setRecipeRoles(data || []);
    } catch (error) {
      console.error('Error loading recipe roles:', error);
    }
  }

  function filterRecipes() {
    let filtered = [...recipes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.name_en?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === 'complete') {
      filtered = filtered.filter(
       (recipe) => (recipe.stepCount ?? 0) > 0 && (recipe.ingredientCount ?? 0) > 0
      );
    } else if (filterStatus === 'incomplete') {
      filtered = filtered.filter(
        (recipe) => (recipe.stepCount ?? 0) > 0 && (recipe.ingredientCount ?? 0) > 0
      );
    }

    // Role filter
    if (filterRole !== null) {
      filtered = filtered.filter((recipe) => recipe.recipe_role_id === filterRole);
    }

    setFilteredRecipes(filtered);
  }

  async function handleDuplicateRecipe(recipeId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Duplicate this recipe?')) return;
    setDuplicating(recipeId);
    try {
      const res = await fetch('/api/base-recipes/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed');
      router.push(`/dashboard/base-recipes/${data.newRecipe.id}`);
    } catch (err: any) {
      alert('Error duplicating recipe: ' + err.message);
    } finally {
      setDuplicating(null);
    }
  }

  async function handleDeleteRecipe(recipeId: string, recipeName: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Изтрий "${recipeName}"?\n\nТова ще изтрие и всички стъпки и съставки на рецептата. Действието е необратимо!`)) return;
    setDeleting(recipeId);
    try {
      const res = await fetch(`/api/base-recipes/delete?id=${recipeId}&force=true`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed');
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
    } catch (err: any) {
      alert('❌ Грешка при изтриване: ' + err.message);
    } finally {
      setDeleting(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  function getDifficultyBadge(level: string | null) {
    if (!level) return null;
    
    const colors: Record<string, { bg: string, text: string, dot: string }> = {
      easy: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
      hard: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
    };

    const style = colors[level] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full ${style.bg} ${style.text}`}>
        <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
        {level}
      </span>
    );
  }

 const stats = {
  total: recipes.length,
  complete: recipes.filter((r) => (r.stepCount ?? 0) > 0 && (r.ingredientCount ?? 0) > 0).length,
  incomplete: recipes.filter((r) => (r.stepCount ?? 0) === 0 || (r.ingredientCount ?? 0) === 0).length,
  withSteps: recipes.filter((r) => (r.stepCount ?? 0) > 0).length,
};
 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                <button className="text-purple-600 font-semibold">
                  Base Recipes
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Base Recipes</h2>
              <p className="text-gray-600 mt-1">
                Manage recipe components (crusts, creams, fillings, decorations)
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/base-recipes/new')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium shadow-lg flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Create New Recipe
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Total Recipes</div>
              <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Complete</div>
              <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Incomplete</div>
              <div className="text-2xl font-bold text-orange-600">{stats.incomplete}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">With Instructions</div>
              <div className="text-2xl font-bold text-blue-600">{stats.withSteps}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 self-center mr-2">Status:</span>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filterStatus === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setFilterStatus('complete')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filterStatus === 'complete'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Complete ({stats.complete})
                </button>
                <button
                  onClick={() => setFilterStatus('incomplete')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filterStatus === 'incomplete'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Incomplete ({stats.incomplete})
                </button>
              </div>

              {/* Role Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 self-center mr-2">Category:</span>
                <button
                  onClick={() => setFilterRole(null)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filterRole === null
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {recipeRoles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setFilterRole(role.id)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      filterRole === role.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {role.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recipes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow p-8 text-center text-gray-500">
                {searchQuery || filterStatus !== 'all'
                  ? 'No recipes match your filters'
                  : 'No recipes yet'}
              </div>
            ) : (
              filteredRecipes.map((recipe) => {
                console.log('Recipe ID:', recipe.id, 'Type:', typeof recipe.id);
                return (
                <div
                  key={recipe.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => {
                    console.log('Navigating to:', `/dashboard/base-recipes/${recipe.id}`);
                    router.push(`/dashboard/base-recipes/${recipe.id}`);
                  }}
                >
                  {/* Recipe Image */}
                  {recipe.image_url && (
                    <div className="w-full h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={recipe.image_url} 
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {recipe.name}
                        </h3>
                        {recipe.name_en && (
                          <p className="text-sm text-gray-500">{recipe.name_en}</p>
                        )}
                      </div>
                      {recipe.difficulty_level && getDifficultyBadge(recipe.difficulty_level)}
                    </div>

                    {recipe.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">📝</span>
                        <span className={(recipe.stepCount ?? 0) > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                          {recipe.stepCount} steps
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">🥚</span>
                        <span className={(recipe.ingredientCount ?? 0) > 0  ? 'text-green-600 font-medium' : 'text-gray-400'}>
                          {recipe.ingredientCount} ingredients
                        </span>
                      </div>
                      {recipe.prep_time_minutes && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">⏱️</span>
                          <span className="text-gray-600">{recipe.prep_time_minutes}m</span>
                        </div>
                      )}
                    </div>

                    {recipe.assembly_template && (
                      <div className="mt-3 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
                        <span>📋</span>
                        <span>{recipe.assembly_template.name}</span>
                      </div>
                    )}

                    {/* Visibility & Access Badges */}
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {!recipe.is_visible_to_users && (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          <span>🔒</span>
                          <span>Admin only</span>
                        </span>
                      )}
                      {recipe.is_free && (
                        <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          <span>🎁</span>
                          <span>Free</span>
                        </span>
                      )}
                      {!recipe.is_free && (
                        <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          <span>💎</span>
                          <span>Premium</span>
                        </span>
                      )}
                    </div>

                    {(recipe.stepCount === 0 || recipe.ingredientCount === 0) && (
                      <div className="mt-3 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        ⚠️ Incomplete - missing {recipe.stepCount === 0 ? 'steps' : ''}{recipe.stepCount === 0 && recipe.ingredientCount === 0 ? ' & ' : ''}{recipe.ingredientCount === 0 ? 'ingredients' : ''}
                      </div>
                    )}

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={(e) => handleDuplicateRecipe(recipe.id, e)}
                        disabled={duplicating === recipe.id}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 transition"
                        title="Duplicate recipe"
                      >
                        {duplicating === recipe.id ? '⟳ Копиране...' : '⎘ Копирай'}
                      </button>
                      <button
                        onClick={(e) => handleDeleteRecipe(recipe.id, recipe.name, e)}
                        disabled={deleting === recipe.id}
                        className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50 transition"
                        title="Delete recipe"
                      >
                        {deleting === recipe.id ? '⟳ Изтриване...' : '🗑 Изтрий'}
                      </button>
                    </div>
                  </div>
                </div>
              );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
