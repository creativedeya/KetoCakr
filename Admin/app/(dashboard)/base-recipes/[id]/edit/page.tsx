// ===========================================================
// FILE: admin/app/(dashboard)/base-recipes/[id]/edit/page.tsx
// ===========================================================
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Ingredient, BaseRecipe } from '../../../../../../../shared/types';

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

export default function EditBaseRecipePage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
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
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(baseRecipeSchema),
  });

  useEffect(() => {
    loadRecipe();
  }, [params.id]);

  async function loadRecipe() {
    try {
      const { data, error } = await supabase
        .from('base_recipes')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;

      const recipe = data as BaseRecipe;

      setValue('category', recipe.category);
      setValue('name_en', recipe.name_en);
      setValue('name_bg', recipe.name_bg || '');
      setValue('description_en', recipe.description_en || '');
      setValue('description_bg', recipe.description_bg || '');
      setValue('prep_time_minutes', recipe.prep_time_minutes);
      setValue('difficulty', recipe.difficulty);

      setImageUrl(recipe.image_url || null);
      setIngredients(recipe.ingredients || []);
      setSteps(recipe.steps || []);
      setNutrition(recipe.nutrition);
      setSuitableTypes(recipe.suitable_for_dessert_types || []);
    } catch (err: any) {
      alert('Failed to load recipe: ' + err.message);
      router.push('/base-recipes');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('base_recipes')
        .update({
          ...data,
          image_url: imageUrl,
          ingredients,
          steps: steps.filter((s) => s.trim()),
          nutrition,
          suitable_for_dessert_types: suitableTypes,
        })
        .eq('id', params.id);

      if (error) throw error;

      alert('Base recipe updated successfully!');
      router.push('/base-recipes');
    } catch (err: any) {
      alert('Failed to update recipe: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Same helper functions as in new page
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Base Recipe</h1>
          <p className="text-gray-600 mt-1">Update recipe component details</p>
        </div>
      </div>

      {/* Form - Same structure as create page */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* All the same sections as in new page */}
        {/* ... (copy the entire form structure) */}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Recipe'}
          </Button>
        </div>
      </form>
    </div>
  );
}