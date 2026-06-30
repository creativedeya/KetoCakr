'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SimpleRecipe {
  id: string;
  name: string;
  name_en: string | null;
  source_type: string | null;
  source_url: string | null;
  servings: number | null;
  total_calories: number | null;
  total_net_carbs: number | null;
  published_at: string | null;
  created_at: string;
  image_url: string | null;
}

const SOURCE_LABELS: Record<string, string> = {
  tiktok: '🎵 TikTok',
  instagram: '📸 Instagram',
  website: '🌐 Website',
  manual: '✏️ Manual',
  user_saved: '👤 User',
  book: '📖 Book',
};

export default function SimpleRecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<SimpleRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sourceFilter) params.set('source_type', sourceFilter);
    if (statusFilter) params.set('status', statusFilter);

    try {
      const res = await fetch(`/api/simple-recipes?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setRecipes(data.data || []);
    } catch (err: any) {
      setLoadError(err.message);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, [search, sourceFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const duplicateRecipe = async (id: string) => {
    if (!confirm('Duplicate this recipe?')) return;
    setDuplicating(id);
    try {
      const res = await fetch('/api/base-recipes/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId: id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed');
      router.push(`/dashboard/simple-recipes/${data.newRecipe.id}`);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setDuplicating(null);
    }
  };

  const deleteRecipe = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?\n\nThis will also delete all ingredients and steps. Cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/simple-recipes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setRecipes(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const published = recipes.filter(r => r.published_at).length;
  const drafts = recipes.filter(r => !r.published_at).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Dashboard</Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">⚡ Simple Recipes</h1>
          <p className="text-sm text-gray-500 mt-1">TikTok / Instagram / Website recipes in base_recipes</p>
        </div>
        <Link
          href="/dashboard/simple-recipes/new"
          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium text-sm transition"
        >
          + Create New Recipe
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border text-center">
          <div className="text-2xl font-bold text-gray-900">{recipes.length}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <div className="text-2xl font-bold text-green-600">{published}</div>
          <div className="text-xs text-gray-500">Published</div>
        </div>
        <div className="bg-white rounded-lg p-4 border text-center">
          <div className="text-2xl font-bold text-gray-400">{drafts}</div>
          <div className="text-xs text-gray-500">Drafts</div>
        </div>
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <strong>Error loading recipes:</strong> {loadError}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
          <option value="">All Sources</option>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
          <option value="website">Website</option>
          <option value="manual">Manual</option>
          <option value="user_saved">User Saved</option>
          <option value="book">📖 Book</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : recipes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">⚡</div>
            <p className="text-gray-500 font-medium">No simple recipes yet.</p>
            <p className="text-gray-400 text-sm mt-1">Create your first TikTok/Instagram recipe.</p>
            <Link href="/dashboard/simple-recipes/new"
              className="inline-block mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 transition">
              + Create Recipe
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Recipe</th>
                <th className="px-4 py-3 font-medium text-gray-600">Source</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Servings</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Cal/serving</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Status</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(recipe => {
                const calPerServing = recipe.total_calories && recipe.servings
                  ? Math.round(recipe.total_calories / recipe.servings) : null;
                const ncPerServing = recipe.total_net_carbs && recipe.servings
                  ? (recipe.total_net_carbs / recipe.servings).toFixed(1) : null;

                return (
                  <tr key={recipe.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {recipe.image_url ? (
                          <img
                            src={recipe.image_url}
                            alt={recipe.name}
                            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                            backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 20
                          }}>
                            🍰
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{recipe.name}</div>
                          {recipe.name_en && <div className="text-xs text-gray-400">{recipe.name_en}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium">
                        {SOURCE_LABELS[recipe.source_type || ''] || recipe.source_type || '—'}
                      </span>
                      {recipe.source_url && (
                        <a href={recipe.source_url} target="_blank" rel="noopener noreferrer"
                          className="block text-xs text-blue-500 hover:underline truncate max-w-[150px]">
                          {recipe.source_url}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{recipe.servings ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {calPerServing ? (
                        <span className="text-rose-600 font-medium">
                          {calPerServing} cal{ncPerServing ? ` · ${ncPerServing}g NC` : ''}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {recipe.published_at ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          ✓ Published
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/dashboard/simple-recipes/${recipe.id}`}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition font-medium">
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => duplicateRecipe(recipe.id)}
                          disabled={duplicating === recipe.id}
                          className="px-3 py-1 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100 transition font-medium disabled:opacity-50">
                          {duplicating === recipe.id ? '...' : '⎘ Copy'}
                        </button>
                        <button
                          onClick={() => deleteRecipe(recipe.id, recipe.name)}
                          disabled={deleting === recipe.id}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition font-medium disabled:opacity-50">
                          {deleting === recipe.id ? '...' : '🗑 Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {recipes.length > 0 && (
        <p className="text-xs text-gray-400 mt-2 text-right">{recipes.length} recipe(s)</p>
      )}
    </div>
  );
}
