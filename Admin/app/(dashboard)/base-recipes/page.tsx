// ===========================================================
// FILE: admin/app/(dashboard)/base-recipes/page.tsx
// ===========================================================
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@/lib/supabase';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BaseRecipe } from '../../../../../shared/types';
import Image from 'next/image';

export default function BaseRecipesPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch base recipes
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['base-recipes', categoryFilter],
    queryFn: async () => {
      let query = supabase.from('base_recipes').select('*').order('name_en');

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BaseRecipe[];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('base_recipes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['base-recipes'] });
      alert('Recipe deleted successfully');
    },
    onError: (error: any) => {
      alert('Failed to delete recipe: ' + error.message);
    },
  });

  // Filter recipes
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'crust', label: 'Crusts' },
    { value: 'cream', label: 'Creams' },
    { value: 'filling', label: 'Fillings' },
    { value: 'decoration', label: 'Decorations' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Base Recipes</h1>
          <p className="text-gray-600 mt-1">
            Manage recipe components (crusts, creams, fillings, decorations)
          </p>
        </div>
        <Button onClick={() => router.push('/base-recipes/new')}>
          <Plus className="w-5 h-5 mr-2" />
          New Recipe
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">Loading...</div>
        ) : filteredRecipes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No recipes found</p>
            <Button onClick={() => router.push('/base-recipes/new')}>
              Create First Recipe
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Prep Time
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecipes.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {recipe.image_url && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden mr-3">
                          <Image
                            src={recipe.image_url}
                            alt={recipe.name_en}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {recipe.name_en}
                        </div>
                        {recipe.name_bg && (
                          <div className="text-sm text-gray-600">
                            {recipe.name_bg}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                      {recipe.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize text-gray-600">
                    {recipe.difficulty || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {recipe.prep_time_minutes
                      ? `${recipe.prep_time_minutes} min`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/base-recipes/${recipe.id}/edit`)
                      }
                      className="mr-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(recipe.id, recipe.name_en)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}