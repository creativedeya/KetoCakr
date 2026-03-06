// ===========================================================
// FILE: admin/app/(dashboard)/base-recipes/new/page.tsx
// ===========================================================
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClientComponentClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ImageUpload';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Ingredient } from '../../../../../../shared/types';

const baseRecipeSchema = z.object({
  category: z.enum(['crust', 'cream', 'filling', 'decoration']),
  name_en: z.string().min(1, 'English name is required'),
  name_bg: z.string().optional(),
  description_en: z.string().optional(),
  description_bg: z.string().optional(),
  prep_time_minutes: z.number().min(0).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

type FormData = z.infer<typeof baseRecipeSchema>;

export default function NewBaseRecipePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', amount: 0, unit: 'g' },
  ]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    servings: 8,
  });
  const [suitableTypes, setSuitableTypes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(baseRecipeSchema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    try {
      const { error } = await supabase.from('base_recipes').insert({
        ...data,
        image_url: imageUrl,
        ingredients,
        steps: steps.filter((s) => s.trim()),
        nutrition,
        suitable_for_dessert_types: suitableTypes,
      });

      if (error) throw error;

      alert('Base recipe created successfully!');
      router.push('/base-recipes');
    } catch (err: any) {
      alert('Failed to create recipe: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: 0, unit: 'g' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: any
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const toggleDessertType = (type: string) => {
    if (suitableTypes.includes(type)) {
      setSuitableTypes(suitableTypes.filter((t) => t !== type));
    } else {
      setSuitableTypes([...suitableTypes, type]);
    }
  };

  const dessertTypes = [
    { value: 'cake', label: '🎂 Cake' },
    { value: 'cheesecake', label: '🍰 Cheesecake' },
    { value: 'tart', label: '🥧 Tart' },
    { value: 'muffin', label: '🧁 Muffin' },
    { value: 'roll', label: '🌯 Roll' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Base Recipe
          </h1>
          <p className="text-gray-600 mt-1">
            Add a new recipe component (crust, cream, filling, or decoration)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Category *"
              {...register('category')}
              error={errors.category?.message}
              options={[
                { value: '', label: 'Select category' },
                { value: 'crust', label: 'Crust' },
                { value: 'cream', label: 'Cream' },
                { value: 'filling', label: 'Filling' },
                { value: 'decoration', label: 'Decoration' },
              ]}
            />

            <Select
              label="Difficulty"
              {...register('difficulty')}
              options={[
                { value: '', label: 'Select difficulty' },
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
            />

            <Input
              label="English Name *"
              {...register('name_en')}
              error={errors.name_en?.message}
              placeholder="e.g., Almond Flour Crust"
            />

            <Input
              label="Bulgarian Name"
              {...register('name_bg')}
              placeholder="e.g., Блат от бадемово брашно"
            />

            <Input
              label="Prep Time (minutes)"
              type="number"
              {...register('prep_time_minutes', { valueAsNumber: true })}
              placeholder="e.g., 25"
            />
          </div>

          <div className="mt-6">
            <Textarea
              label="English Description"
              {...register('description_en')}
              rows={3}
              placeholder="Brief description in English..."
            />
          </div>

          <div className="mt-6">
            <Textarea
              label="Bulgarian Description"
              {...register('description_bg')}
              rows={3}
              placeholder="Brief description in Bulgarian..."
            />
          </div>
        </div>

        {/* Image */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Image</h2>
          <ImageUpload value={imageUrl || undefined} onChange={setImageUrl} />
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Ingredients</h2>
            <Button type="button" onClick={addIngredient} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Ingredient
            </Button>
          </div>

          <div className="space-y-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) =>
                      updateIngredient(index, 'name', e.target.value)
                    }
                    placeholder="Ingredient name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    step="0.1"
                    value={ingredient.amount}
                    onChange={(e) =>
                      updateIngredient(index, 'amount', parseFloat(e.target.value) || 0)
                    }
                    placeholder="Amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                </div>
                <div className="w-32">
                  <select
                    value={ingredient.unit}
                    onChange={(e) =>
                      updateIngredient(index, 'unit', e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="cup">cup</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Preparation Steps</h2>
            <Button type="button" onClick={addStep} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <textarea
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                  rows={2}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeStep(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Nutrition (for entire recipe)
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calories
              </label>
              <input
                type="number"
                value={nutrition.calories}
                onChange={(e) =>
                  setNutrition({ ...nutrition, calories: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={nutrition.protein}
                onChange={(e) =>
                  setNutrition({ ...nutrition, protein: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fat (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={nutrition.fat}
                onChange={(e) =>
                  setNutrition({ ...nutrition, fat: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Carbs (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={nutrition.carbs}
                onChange={(e) =>
                  setNutrition({ ...nutrition, carbs: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fiber (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={nutrition.fiber}
                onChange={(e) =>
                  setNutrition({ ...nutrition, fiber: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Servings
              </label>
              <input
                type="number"
                value={nutrition.servings}
                onChange={(e) =>
                  setNutrition({
                    ...nutrition,
                    servings: parseInt(e.target.value) || 8,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Suitable Dessert Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Suitable For Dessert Types
          </h2>

          <div className="flex flex-wrap gap-3">
            {dessertTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => toggleDessertType(type.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  suitableTypes.includes(type.value)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Recipe'}
          </Button>
        </div>
      </form>
    </div>
  );
}