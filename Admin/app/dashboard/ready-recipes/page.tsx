'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Pencil, Trash2, Plus, Eye, Star } from 'lucide-react';
import Link from 'next/link';

type ReadyRecipe = {
  id: string;
  name_en: string;
  name_bg: string;
  slug: string;
  dessert_type_id: number;
  hero_image_url: string;
  status: string;
  is_featured: boolean;
  is_free: boolean;
  difficulty_level: number;
  total_servings: number;
  total_calories: number;
  total_net_carbs: number;
  created_at: string;
  published_at: string;
  source_url?: string;
  selected_components?: any[];
};

type DessertType = {
  id: number;
  name: string;
};

export default function ReadyRecipesList() {
  const [recipes, setRecipes] = useState<ReadyRecipe[]>([]);
  const [dessertTypes, setDessertTypes] = useState<DessertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [filterDessertType, setFilterDessertType] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [filterStatus, filterDessertType]);

  async function loadData() {
    setLoading(true);
    
    // Load dessert types
    const { data: dtData } = await supabase
      .from('dessert_types')
      .select('*')
      .order('name');
    
    if (dtData) setDessertTypes(dtData);

    // Build query
    let query = supabase
      .from('ready_recipes')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }
    
    if (filterDessertType) {
      query = query.eq('dessert_type_id', filterDessertType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading recipes:', error);
    } else {
      setRecipes(data || []);
    }
    
    setLoading(false);
  }

  async function deleteRecipe(id: string, name: string) {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${name}"?`)) {
      return;
    }

    const { error } = await supabase
      .from('ready_recipes')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Грешка при изтриване: ' + error.message);
    } else {
      alert('Рецептата е изтрита успешно!');
      loadData();
    }
  }

  function getDessertTypeName(id: number): string {
    return dessertTypes.find(dt => dt.id === id)?.name || 'N/A';
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 font-medium">Ready Recipes</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Готови Рецепти</h1>
          <p className="text-gray-600">Управление на генерирани рецепти</p>
        </div>
        <Link 
          href="/dashboard/ready-recipes/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Нова Рецепта
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">Всички</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Тип Десерт</label>
            <select
              value={filterDessertType || ''}
              onChange={(e) => setFilterDessertType(Number(e.target.value) || null)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Всички типове</option>
              {dessertTypes.map(dt => (
                <option key={dt.id} value={dt.id}>{dt.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Общо Рецепти</p>
          <p className="text-2xl font-bold">{recipes.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600">
            {recipes.filter(r => r.status === 'published').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Drafts</p>
          <p className="text-2xl font-bold text-orange-600">
            {recipes.filter(r => r.status === 'draft').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Featured</p>
          <p className="text-2xl font-bold text-purple-600">
            {recipes.filter(r => r.is_featured).length}
          </p>
        </div>
      </div>

      {/* Recipes Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Зареждане...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">Няма рецепти</p>
          <Link 
            href="/dashboard/ready-recipes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Създай Първа Рецепта
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Рецепта
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nutrition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Създадена
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recipes.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-gray-50">
                  {/* Recipe Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {recipe.hero_image_url ? (
                        <img
                          src={recipe.hero_image_url}
                          alt={recipe.name_en}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{recipe.name_en}</p>
                        {recipe.name_bg && (
                          <p className="text-sm text-gray-500">{recipe.name_bg}</p>
                        )}
                        {(recipe as any).selected_components?.some((c: any) => c.role === 'simple') && (
                          <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-medium">
                            ⚡ Simple
                          </span>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {recipe.is_featured && (
                            <span className="flex items-center gap-1 text-xs text-purple-600">
                              <Star size={12} />
                              Featured
                            </span>
                          )}
                          {recipe.is_free && (
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                              Free
                            </span>
                          )}
                          {recipe.source_url && (
                            <a
                              href={recipe.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded hover:bg-red-100 transition"
                              title="Watch video"
                            >
                              ▶ Video
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Dessert Type */}
                  <td className="px-6 py-4">
                    <span className="text-sm">
                      {getDessertTypeName(recipe.dessert_type_id)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      recipe.status === 'published' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {recipe.status}
                    </span>
                  </td>

                  {/* Nutrition */}
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p>{Math.round(recipe.total_calories / recipe.total_servings)} kcal</p>
                      <p className="text-xs text-gray-500">
                        {recipe.total_net_carbs 
                          ? `${Math.round((recipe.total_net_carbs / recipe.total_servings) * 10) / 10}g net carbs`
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500">
                      {new Date(recipe.created_at).toLocaleDateString('bg-BG')}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/ready-recipes/${recipe.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Редактирай"
                      >
                        <Pencil size={18} />
                      </Link>
                      
                      <button
                        onClick={() => deleteRecipe(recipe.id, recipe.name_en)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Изтрий"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}