// ===========================================================
// FILE: admin/app/(dashboard)/ready-recipes/new/page.tsx
// ===========================================================
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ImageUpload';
import { ArrowLeft } from 'lucide-react';
import { DessertType, BaseRecipe } from '../../../../../../shared/types';

export default function NewReadyRecipePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [dessertTypes, setDessertTypes] = useState<DessertType[]>([]);
  const [crusts, setCrusts] = useState<BaseRecipe[]>([]);
  const [creams, setCreams] = useState<BaseRecipe[]>([]);
  const [fillings, setFillings] = useState<BaseRecipe[]>([]);
  const [decorations, setDecorations] = useState<BaseRecipe[]>([]);

  const [formData, setFormData] = useState({
    dessert_type_id: '',
    name_en: '',
    name_bg: '',
    description_en: '',
    description_bg: '',
    crust_id: '',
    cream_id: '',
    filling_id: '',
    decoration_id: '',
    is_featured: false,
  });
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [typesRes, crustsRes, creamsRes, fillingsRes, decorationsRes] =
      await Promise.all([
        supabase.from('dessert_types').select('*'),
        supabase.from('base_recipes').select('*').eq('category', 'crust'),
        supabase.from('base_recipes').select('*').eq('category', 'cream'),
        supabase.from('base_recipes').select('*').eq('category', 'filling'),
        supabase.from('base_recipes').select('*').eq('category', 'decoration'),
      ]);

    setDessertTypes(typesRes.data || []);
    setCrusts(crustsRes.data || []);
    setCreams(creamsRes.data || []);
    setFillings(fillingsRes.data || []);
    setDecorations(decorationsRes.data || []);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from('ready_recipes').insert({
        ...formData,
        hero_image_url: heroImage,
      });

      if (error) throw error;

      alert('Recipe created successfully!');
      router.push('/ready-recipes');
    } catch (err: any) {
      alert('Failed to create recipe: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Ready Recipe
          </h1>
          <p className="text-gray-600 mt-1">
            Combine base recipes into a complete dessert
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Dessert Type *"
              value={formData.dessert_type_id}
              onChange={(e) =>
                setFormData({ ...formData, dessert_type_id: e.target.value })
              }
              options={[
                { value: '', label: 'Select type' },
                ...dessertTypes.map((t) => ({ value: t.id, label: t.name_en })),
              ]}
            />

            <div>
              <label className="flex items-center space-x-2 mt-8">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData({ ...formData, is_featured: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Featured Recipe
                </span>
              </label>
            </div>

            <Input
              label="English Name *"
              value={formData.name_en}
              onChange={(e) =>
                setFormData({ ...formData, name_en: e.target.value })
              }
              required
            />

            <Input
              label="Bulgarian Name"
              value={formData.name_bg}
              onChange={(e) =>
                setFormData({ ...formData, name_bg: e.target.value })
              }
            />
          </div>

          <div className="mt-6">
            <Textarea
              label="English Description"
              value={formData.description_en}
              onChange={(e) =>
                setFormData({ ...formData, description_en: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="mt-6">
            <Textarea
              label="Bulgarian Description"
              value={formData.description_bg}
              onChange={(e) =>
                setFormData({ ...formData, description_bg: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>

        {/* Hero Image */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Hero Image</h2>
          <ImageUpload value={heroImage || undefined} onChange={setHeroImage} />
        </div>

        {/* Components */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Recipe Components
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Crust *"
              value={formData.crust_id}
              onChange={(e) =>
                setFormData({ ...formData, crust_id: e.target.value })
              }
              options={[
                { value: '', label: 'Select crust' },
                ...crusts.map((c) => ({ value: c.id, label: c.name_en })),
              ]}
            />

            <Select
              label="Cream *"
              value={formData.cream_id}
              onChange={(e) =>
                setFormData({ ...formData, cream_id: e.target.value })
              }
              options={[
                { value: '', label: 'Select cream' },
                ...creams.map((c) => ({ value: c.id, label: c.name_en })),
              ]}
            />

            <Select
              label="Filling *"
              value={formData.filling_id}
              onChange={(e) =>
                setFormData({ ...formData, filling_id: e.target.value })
              }
              options={[
                { value: '', label: 'Select filling' },
                ...fillings.map((f) => ({ value: f.id, label: f.name_en })),
              ]}
            />

            <Select
              label="Decoration *"
              value={formData.decoration_id}
              onChange={(e) =>
                setFormData({ ...formData, decoration_id: e.target.value })
              }
              options={[
                { value: '', label: 'Select decoration' },
                ...decorations.map((d) => ({ value: d.id, label: d.name_en })),
              ]}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
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