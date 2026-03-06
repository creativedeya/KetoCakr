// ===========================================================
// FILE: admin/app/(dashboard)/ready-recipes/page.tsx
// ===========================================================
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@/lib/supabase';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReadyRecipe } from '../../../../../shared/types';
import Image from 'next/image';

export default function ReadyRecipesPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  // Fetch ready recipes
  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['ready-recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ready_recipes')
        .select(
          `
          *,
          dessert_type:dessert_types(*)
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReadyRecipe[];
    },
  });

  // Publish/Unpublish mutation
  const publishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase
        .from('ready_recipes')
        .update({ published_at: published ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ready-recipes'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ready_recipes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ready-recipes'] });
      alert('Recipe deleted successfully');
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ready Recipes</h1>
          <p className="text-gray-600 mt-1">
            Manage curated recipes for the app
          </p>
        </div>
        <Button onClick={() => router.push('/ready-recipes/new')}>
          <Plus className="w-5 h-5 mr-2" />
          New Recipe
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">Loading...</div>
        ) : recipes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No recipes found</p>
            <Button onClick={() => router.push('/ready-recipes/new')}>
              Create First Recipe
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recipes.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {recipe.hero_image_url && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden mr-3">
                          <Image
                            src={recipe.hero_image_url}
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
                      {recipe.dessert_type?.name_en}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {recipe.published_at ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        publishMutation.mutate({
                          id: recipe.id,
                          published: !recipe.published_at,
                        })
                      }
                      className="mr-2"
                    >
                      {recipe.published_at ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/ready-recipes/${recipe.id}/edit`)
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