'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { TrendingUp, Package, Layers, Star, Eye, Users, Calendar } from 'lucide-react';

type AnalyticsData = {
  totalReadyRecipes: number;
  totalBaseRecipes: number;
  publishedReady: number;
  draftReady: number;
  featuredReady: number;
  freeReady: number;
  proReady: number;
  recipesByDessertType: { name: string; count: number }[];
  recipesByDifficulty: { level: number; count: number }[];
  componentsByRole: { role: string; count: number }[];
  recentRecipes: any[];
  baseRecipeUsage: { recipe_name: string; usage_count: number }[];
  avgNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    netCarbs: number;
  };
};

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    setLoading(true);
    
    try {
      // Basic counts
      const [readyRecipesRes, baseRecipesRes, dessertTypesRes] = await Promise.all([
        supabase.from('ready_recipes').select('*'),
        supabase.from('base_recipes').select('*'),
        supabase.from('dessert_types').select('*')
      ]);

      const readyRecipes = readyRecipesRes.data || [];
      const baseRecipes = baseRecipesRes.data || [];
      const dessertTypes = dessertTypesRes.data || [];

      // Calculate stats
      const totalReadyRecipes = readyRecipes.length;
      const publishedReady = readyRecipes.filter(r => r.status === 'published').length;
      const draftReady = readyRecipes.filter(r => r.status === 'draft').length;
      const featuredReady = readyRecipes.filter(r => r.is_featured).length;
      const freeReady = readyRecipes.filter(r => r.is_free).length;
      const proReady = readyRecipes.filter(r => !r.is_free).length;

      // Recipes by dessert type
      const recipesByDessertType = dessertTypes.map(dt => ({
        name: dt.name,
        count: readyRecipes.filter(r => r.dessert_type_id === dt.id).length
      })).filter(item => item.count > 0);

      // Recipes by difficulty
      const difficultyMap: Record<number, number> = {};
      readyRecipes.forEach(r => {
        if (r.difficulty_level) {
          difficultyMap[r.difficulty_level] = (difficultyMap[r.difficulty_level] || 0) + 1;
        }
      });
      const recipesByDifficulty = Object.entries(difficultyMap).map(([level, count]) => ({
        level: Number(level),
        count
      })).sort((a, b) => a.level - b.level);

      // Components by role
      const roleMap: Record<number, string> = {
        1: 'Блат',
        2: 'Крем',
        3: 'Плънка',
        4: 'Декорация'
      };
      const componentCounts: Record<string, number> = {};
      readyRecipes.forEach(recipe => {
        if (recipe.selected_components) {
          recipe.selected_components.forEach((comp: any) => {
            const roleName = roleMap[comp.recipe_role_id] || 'Unknown';
            componentCounts[roleName] = (componentCounts[roleName] || 0) + 1;
          });
        }
      });
      const componentsByRole = Object.entries(componentCounts).map(([role, count]) => ({
        role,
        count
      }));

      // Recent recipes (last 10)
      const recentRecipes = [...readyRecipes]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      // Base recipe usage in ready recipes
      const baseUsageMap: Record<string, { name: string; count: number }> = {};
      readyRecipes.forEach(recipe => {
        if (recipe.selected_components) {
          recipe.selected_components.forEach((comp: any) => {
            const baseRecipe = baseRecipes.find(br => br.id === comp.base_recipe_id);
            if (baseRecipe) {
              if (!baseUsageMap[baseRecipe.id]) {
                baseUsageMap[baseRecipe.id] = { name: baseRecipe.name, count: 0 };
              }
              baseUsageMap[baseRecipe.id].count++;
            }
          });
        }
      });
      const baseRecipeUsage = Object.values(baseUsageMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(item => ({
          recipe_name: item.name,
          usage_count: item.count
        }));

      // Average nutrition
      const totalCalories = readyRecipes.reduce((sum, r) => sum + (r.total_calories || 0), 0);
      const totalProtein = readyRecipes.reduce((sum, r) => sum + (r.total_protein || 0), 0);
      const totalCarbs = readyRecipes.reduce((sum, r) => sum + (r.total_carbs || 0), 0);
      const totalNetCarbs = readyRecipes.reduce((sum, r) => sum + (r.total_net_carbs || 0), 0);
      
      const avgNutrition = {
        calories: totalReadyRecipes > 0 ? Math.round(totalCalories / totalReadyRecipes) : 0,
        protein: totalReadyRecipes > 0 ? Math.round((totalProtein / totalReadyRecipes) * 10) / 10 : 0,
        carbs: totalReadyRecipes > 0 ? Math.round((totalCarbs / totalReadyRecipes) * 10) / 10 : 0,
        netCarbs: totalReadyRecipes > 0 ? Math.round((totalNetCarbs / totalReadyRecipes) * 10) / 10 : 0
      };

      setAnalytics({
        totalReadyRecipes,
        totalBaseRecipes: baseRecipes.length,
        publishedReady,
        draftReady,
        featuredReady,
        freeReady,
        proReady,
        recipesByDessertType,
        recipesByDifficulty,
        componentsByRole,
        recentRecipes,
        baseRecipeUsage,
        avgNutrition
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Зареждане на статистики...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-red-500">Грешка при зареждане на данни</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
          Dashboard
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600 font-medium">Analytics</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📊 Analytics Dashboard</h1>
        <p className="text-gray-600">Преглед на статистики и метрики</p>
      </div>

      {/* Time Range Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTimeRange('7d')}
          className={`px-4 py-2 rounded-lg ${
            timeRange === '7d'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Последни 7 дни
        </button>
        <button
          onClick={() => setTimeRange('30d')}
          className={`px-4 py-2 rounded-lg ${
            timeRange === '30d'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Последни 30 дни
        </button>
        <button
          onClick={() => setTimeRange('all')}
          className={`px-4 py-2 rounded-lg ${
            timeRange === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Всички
        </button>
      </div>

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Package size={24} />
            <span className="text-2xl font-bold">{analytics.totalReadyRecipes}</span>
          </div>
          <p className="text-blue-100">Готови Рецепти</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Layers size={24} />
            <span className="text-2xl font-bold">{analytics.totalBaseRecipes}</span>
          </div>
          <p className="text-purple-100">Базови Компоненти</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} />
            <span className="text-2xl font-bold">{analytics.publishedReady}</span>
          </div>
          <p className="text-green-100">Публикувани</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Star size={24} />
            <span className="text-2xl font-bold">{analytics.featuredReady}</span>
          </div>
          <p className="text-orange-100">Featured</p>
        </div>
      </div>

      {/* Stats Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4">📝 Статус</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Published:</span>
              <span className="font-bold text-green-600">{analytics.publishedReady}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Draft:</span>
              <span className="font-bold text-orange-600">{analytics.draftReady}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Featured:</span>
              <span className="font-bold text-purple-600">{analytics.featuredReady}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4">💎 Visibility</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Free:</span>
              <span className="font-bold text-green-600">{analytics.freeReady}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pro Only:</span>
              <span className="font-bold text-blue-600">{analytics.proReady}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Free %:</span>
                <span className="text-sm">
                  {analytics.totalReadyRecipes > 0
                    ? Math.round((analytics.freeReady / analytics.totalReadyRecipes) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4">🍽️ Средна Хранителна Стойност</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Калории:</span>
              <span className="font-medium">{analytics.avgNutrition.calories} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Протеини:</span>
              <span className="font-medium">{analytics.avgNutrition.protein}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Въглехидрати:</span>
              <span className="font-medium">{analytics.avgNutrition.carbs}g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-bold">Нетни:</span>
              <span className="font-bold text-green-600">{analytics.avgNutrition.netCarbs}g</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Recipes by Dessert Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4">🎂 Рецепти по Тип Десерт</h3>
          {analytics.recipesByDessertType.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Няма данни</p>
          ) : (
            <div className="space-y-3">
              {analytics.recipesByDessertType.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-bold">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(item.count / analytics.totalReadyRecipes) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recipes by Difficulty */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4">⭐ Рецепти по Сложност</h3>
          {analytics.recipesByDifficulty.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Няма данни</p>
          ) : (
            <div className="space-y-3">
              {analytics.recipesByDifficulty.map((item, idx) => {
                const difficultyLabel = ['Много лесно', 'Лесно', 'Средно', 'Трудно', 'Експертно'];
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {item.level} - {difficultyLabel[item.level - 1]}
                      </span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{
                          width: `${(item.count / analytics.totalReadyRecipes) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Components by Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4">🎭 Използвани Компоненти по Роля</h3>
          {analytics.componentsByRole.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Няма данни</p>
          ) : (
            <div className="space-y-3">
              {analytics.componentsByRole.map((item, idx) => {
                const total = analytics.componentsByRole.reduce((sum, i) => sum + i.count, 0);
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.role}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(item.count / total) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Base Recipes Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold mb-4">🏆 Най-Използвани Базови Рецепти</h3>
          {analytics.baseRecipeUsage.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Няма данни</p>
          ) : (
            <div className="space-y-2">
              {analytics.baseRecipeUsage.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs font-mono w-6">{idx + 1}.</span>
                    <span className="text-sm">{item.recipe_name}</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{item.usage_count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Recipes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-bold">📋 Последни Създадени Рецепти</h3>
        </div>
        {analytics.recentRecipes.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400">Няма рецепти</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Рецепта
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Калории
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Създадена
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.recentRecipes.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{recipe.name_en}</span>
                      {recipe.is_featured && (
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        recipe.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {recipe.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {recipe.total_calories
                      ? `${Math.round(recipe.total_calories / recipe.total_servings)} kcal`
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(recipe.created_at).toLocaleDateString('bg-BG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Забележка:</strong> Това е Analytics v1.0 базиран на съществуващи данни. 
          За по-детайлна статистика (recipe views, user activity) трябва да добавим tracking таблици.
        </p>
      </div>
    </div>
  );
}