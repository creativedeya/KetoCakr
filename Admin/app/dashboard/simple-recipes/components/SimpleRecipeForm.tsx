'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';
import { IngredientAutocomplete } from '@/components/IngredientAutocomplete';
import { Wand2 } from 'lucide-react';
import AutoParseModal from './AutoParseModal';
import GenerateStepImageButton from './GenerateStepImageButton';

interface IngredientRow {
  ingredient_database_id: string | null;
  ingredient_name: string;
  quantity: number;
  unit: string;
  _calories?: number;
  _protein?: number;
  _fat?: number;
  _carbs?: number;
  _fiber?: number;
}

interface StepRow {
  step_description_bg: string;
  step_description_en: string;
  step_duration_minutes: number;
  step_image_url: string;
}

interface FormState {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  source_type: string;
  source_url: string;
  image_url: string;
  servings: number;
  published_at: string | null;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  total_net_carbs: number;
  total_weight_grams: number;
}

interface Props {
  recipeId?: string;
  initialData?: any;
  initialIngredients?: any[];
  initialSteps?: any[];
  onSaved: (id: string) => void;
}

const SOURCE_TYPES = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Website/Blog' },
  { value: 'manual', label: 'Manual' },
  { value: 'user_saved', label: 'User Saved' },
];

const UNITS = ['g', 'ml', 'tsp', 'tbsp', 'cup', 'piece', 'pkg'];

export default function SimpleRecipeForm({ recipeId, initialData, initialIngredients, initialSteps, onSaved }: Props) {
  const [tab, setTab] = useState<'basic' | 'ingredients' | 'steps' | 'publish'>('basic');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [showAutoParseModal, setShowAutoParseModal] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: initialData?.name || '',
    name_en: initialData?.name_en || '',
    description: initialData?.description || '',
    description_en: initialData?.description_en || '',
    source_type: initialData?.source_type || 'tiktok',
    source_url: initialData?.source_url || '',
    image_url: initialData?.image_url || '',
    servings: initialData?.servings || 1,
    published_at: initialData?.published_at || null,
    total_calories: initialData?.total_calories || 0,
    total_protein: initialData?.total_protein || 0,
    total_fat: initialData?.total_fat || 0,
    total_carbs: initialData?.total_carbs || 0,
    total_net_carbs: initialData?.total_net_carbs || 0,
    total_weight_grams: initialData?.total_weight_grams || 0,
  });

  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    (initialIngredients || []).map((ing: any) => ({
      ingredient_database_id: ing.ingredient_database_id || null,
      ingredient_name: ing.ingredient_name || '',
      quantity: Number(ing.quantity) || 0,
      unit: ing.unit || 'g',
      _calories: ing.ingredients_database?.calories_per_100g,
      _protein: ing.ingredients_database?.protein_per_100g,
      _fat: ing.ingredients_database?.fat_per_100g,
      _carbs: ing.ingredients_database?.carbs_per_100g,
      _fiber: ing.ingredients_database?.fiber_per_100g,
    }))
  );

  const [steps, setSteps] = useState<StepRow[]>(
    (initialSteps || []).map((s: any) => ({
      step_description_bg: s.step_description_bg || s.step_description || '',
      step_description_en: s.step_description_en || '',
      step_duration_minutes: Number(s.step_duration_minutes) || 5,
      step_image_url: s.step_image_url || '',
    }))
  );

  // Auto-calculate nutrition from ingredients
  useEffect(() => {
    let cal = 0, prot = 0, fat = 0, carbs = 0, fiber = 0, wt = 0;
    ingredients.forEach(ing => {
      const q = Number(ing.quantity) || 0;
      if (q > 0 && (ing.unit === 'g' || ing.unit === 'ml')) {
        wt += q;
        cal += (ing._calories || 0) * q / 100;
        prot += (ing._protein || 0) * q / 100;
        fat += (ing._fat || 0) * q / 100;
        carbs += (ing._carbs || 0) * q / 100;
        fiber += (ing._fiber || 0) * q / 100;
      }
    });
    const net = Math.max(0, carbs - fiber);
    setForm(prev => ({
      ...prev,
      total_calories: Math.round(cal * 10) / 10,
      total_protein: Math.round(prot * 10) / 10,
      total_fat: Math.round(fat * 10) / 10,
      total_carbs: Math.round(carbs * 10) / 10,
      total_net_carbs: Math.round(net * 10) / 10,
      total_weight_grams: Math.round(wt),
    }));
  }, [ingredients]);

  const addIngredient = async (ingredient: { id: string; name_bg: string; name_en: string }) => {
    const { data } = await supabase
      .from('ingredients_database')
      .select('calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g')
      .eq('id', ingredient.id)
      .single();

    setIngredients(prev => [...prev, {
      ingredient_database_id: ingredient.id,
      ingredient_name: ingredient.name_bg,
      quantity: 100,
      unit: 'g',
      _calories: data?.calories_per_100g,
      _protein: data?.protein_per_100g,
      _fat: data?.fat_per_100g,
      _carbs: data?.carbs_per_100g,
      _fiber: data?.fiber_per_100g,
    }]);
    setIngredientSearch('');
  };

  const updateIngredient = (i: number, field: keyof IngredientRow, value: any) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };
      return updated;
    });
  };

  const updateStep = (i: number, field: keyof StepRow, value: any) => {
    setSteps(prev => {
      const s = [...prev];
      s[i] = { ...s[i], [field]: value };
      return s;
    });
  };

  const moveStep = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    setSteps(prev => {
      const s = [...prev];
      [s[i], s[j]] = [s[j], s[i]];
      return s;
    });
  };

  const save = async (publish?: boolean) => {
    if (!form.name.trim()) { setMsg({ type: 'error', text: 'Името (BG) е задължително' }); return; }
    setSaving(true);
    setMsg(null);
    try {
      const payload = {
        ...form,
        is_simple_recipe: true,
        published_at: publish ? new Date().toISOString() : form.published_at,
        ingredients: ingredients.map((ing, i) => ({
          ingredient_database_id: ing.ingredient_database_id,
          ingredient_name: ing.ingredient_name,
          quantity: ing.quantity,
          unit: ing.unit,
          order_index: i,
        })),
        steps: steps.map((s, i) => ({
          step_number: i + 1,
          step_description_bg: s.step_description_bg,
          step_description_en: s.step_description_en,
          step_duration_minutes: s.step_duration_minutes,
          step_image_url: s.step_image_url || null,
        })),
      };

      const url = recipeId ? `/api/simple-recipes/${recipeId}` : '/api/simple-recipes';
      const method = recipeId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      if (publish) setForm(prev => ({ ...prev, published_at: data.data.published_at }));
      setMsg({ type: 'success', text: publish ? '✅ Публикувано!' : '✅ Записано!' });
      onSaved(data.data.id);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const unpublish = async () => {
    if (!recipeId) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/simple-recipes/${recipeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published_at: null }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setForm(prev => ({ ...prev, published_at: null }));
      setMsg({ type: 'success', text: 'Скрито от потребителите.' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500';
  const lbl = 'block text-sm font-medium text-gray-700 mb-1';
  const tabBtn = (t: string) =>
    tab === t
      ? 'px-4 py-2 bg-rose-600 text-white rounded-t-lg text-sm font-medium'
      : 'px-4 py-2 bg-gray-100 text-gray-600 rounded-t-lg text-sm font-medium hover:bg-gray-200 transition';

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-6 border-b border-gray-200">
        <button type="button" className={tabBtn('basic')} onClick={() => setTab('basic')}>📝 Basic Info</button>
        <button type="button" className={tabBtn('ingredients')} onClick={() => setTab('ingredients')}>
          🥚 Ingredients ({ingredients.length})
        </button>
        <button type="button" className={tabBtn('steps')} onClick={() => setTab('steps')}>
          📋 Steps ({steps.length})
        </button>
        <button type="button" className={tabBtn('publish')} onClick={() => setTab('publish')}>🚀 Publishing</button>
      </div>

      <div className="p-6">
        {/* Messages */}
        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {msg.text}
          </div>
        )}

        {/* ─── BASIC INFO ─── */}
        {tab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Име (BG) *</label>
                <input className={inp} value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Шоколадов кекс в чаша" />
              </div>
              <div>
                <label className={lbl}>Name (EN)</label>
                <input className={inp} value={form.name_en}
                  onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))}
                  placeholder="Chocolate mug cake" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Описание (BG)</label>
                <textarea className={inp} rows={3} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className={lbl}>Description (EN)</label>
                <textarea className={inp} rows={3} value={form.description_en}
                  onChange={e => setForm(p => ({ ...p, description_en: e.target.value }))} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAutoParseModal(true)}
                disabled={!form.description_en?.trim() && !form.description?.trim()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-rose-300 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Wand2 size={15} />
                Auto-Parse with AI
              </button>
              <span className="text-xs text-gray-400">Extracts ingredients &amp; steps from the description above</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Source Type</label>
                <select className={inp} value={form.source_type}
                  onChange={e => setForm(p => ({ ...p, source_type: e.target.value }))}>
                  {SOURCE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Source URL</label>
                <input className={inp} type="url" value={form.source_url}
                  onChange={e => setForm(p => ({ ...p, source_url: e.target.value }))}
                  placeholder="https://tiktok.com/..." />
              </div>
              <div>
                <label className={lbl}>Servings (порции)</label>
                <input className={inp} type="number" min={1} value={form.servings}
                  onChange={e => setForm(p => ({ ...p, servings: parseInt(e.target.value) || 1 }))} />
              </div>
            </div>

            <div>
              <label className={lbl}>Hero Image</label>
              <ImageUpload
                value={form.image_url}
                onChange={url => setForm(p => ({ ...p, image_url: url }))}
                recipeId={recipeId}
                bucket="recipe-images"
                pathPrefix="simple-recipes"
              />
            </div>
          </div>
        )}

        {/* ─── INGREDIENTS ─── */}
        {tab === 'ingredients' && (
          <div className="space-y-4">
            {/* Nutrition summary */}
            <div className="grid grid-cols-5 gap-3 p-4 bg-rose-50 rounded-lg text-center">
              {[
                { val: form.total_calories, label: 'Cal' },
                { val: `${form.total_protein}g`, label: 'Protein' },
                { val: `${form.total_fat}g`, label: 'Fat' },
                { val: `${form.total_carbs}g`, label: 'Carbs' },
                { val: `${form.total_net_carbs}g`, label: 'Net Carbs' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div className="text-lg font-bold text-rose-600">{val}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            {form.servings > 1 && form.total_calories > 0 && (
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                <strong>Per serving ({form.servings}x):</strong>{' '}
                {Math.round(form.total_calories / form.servings)} cal ·{' '}
                {(form.total_net_carbs / form.servings).toFixed(1)}g NC ·{' '}
                {(form.total_protein / form.servings).toFixed(1)}g prot
              </div>
            )}

            {/* Ingredient search */}
            <div>
              <label className={lbl}>Add Ingredient</label>
              <IngredientAutocomplete
                value={ingredientSearch}
                onChange={setIngredientSearch}
                onSelect={addIngredient}
                placeholder="Търси съставка..."
              />
            </div>

            {/* Ingredient list */}
            {ingredients.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Няма добавени съставки.</p>
            ) : (
              <div className="space-y-2">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="flex-1 text-sm font-medium text-gray-700 truncate">{ing.ingredient_name}</span>
                    <input
                      type="number" min={0} step={0.1} value={ing.quantity}
                      onChange={e => updateIngredient(i, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <select value={ing.unit}
                      onChange={e => updateIngredient(i, 'unit', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm">
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <span className="text-xs text-gray-400 w-16 text-right">
                      {ing._calories && ing.unit === 'g' ? `${Math.round(ing._calories * ing.quantity / 100)} cal` : ''}
                    </span>
                    <button type="button"
                      onClick={() => setIngredients(prev => prev.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 px-1 text-lg leading-none">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── STEPS ─── */}
        {tab === 'steps' && (
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-600 text-sm">Стъпка {i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveStep(i, -1)} disabled={i === 0}
                      className="px-2 py-1 text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30">▲</button>
                    <button type="button" onClick={() => moveStep(i, 1)} disabled={i === steps.length - 1}
                      className="px-2 py-1 text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30">▼</button>
                    <button type="button" onClick={() => setSteps(prev => prev.filter((_, j) => j !== i))}
                      className="px-2 py-1 text-xs text-red-400 hover:text-red-600">✕ Изтрий</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Описание (BG)</label>
                    <textarea className={inp} rows={3} value={step.step_description_bg}
                      onChange={e => updateStep(i, 'step_description_bg', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description (EN)</label>
                    <textarea className={inp} rows={3} value={step.step_description_en}
                      onChange={e => updateStep(i, 'step_description_en', e.target.value)} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Duration (min)</label>
                    <input type="number" min={1} value={step.step_duration_minutes}
                      onChange={e => updateStep(i, 'step_duration_minutes', parseInt(e.target.value) || 1)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Step Image URL</label>
                    <input type="url" value={step.step_image_url}
                      onChange={e => updateStep(i, 'step_image_url', e.target.value)}
                      className={inp} placeholder="https://..." />
                  </div>
                </div>
                {/* Image generation */}
                <div className="mt-3 flex items-center gap-3">
                  <GenerateStepImageButton
                    recipe_id={recipeId}
                    step_number={i + 1}
                    step_description={step.step_description_en || step.step_description_bg}
                    recipe_name={form.name_en || form.name}
                    onImageGenerated={(url) => updateStep(i, 'step_image_url', url)}
                  />
                  {step.step_image_url && (
                    <>
                      <img
                        src={step.step_image_url}
                        alt={`Стъпка ${i + 1}`}
                        className="h-12 w-12 object-cover rounded border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => updateStep(i, 'step_image_url', '')}
                        className="text-xs text-red-400 hover:text-red-600 transition"
                      >
                        Remove image
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            <button type="button"
              onClick={() => setSteps(prev => [...prev, {
                step_description_bg: '',
                step_description_en: '',
                step_duration_minutes: 5,
                step_image_url: '',
              }])}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:border-rose-400 hover:text-rose-500 transition">
              + Добави стъпка
            </button>
          </div>
        )}

        {/* ─── PUBLISHING ─── */}
        {tab === 'publish' && (
          <div className="space-y-4 max-w-lg">
            <div className={`p-4 rounded-lg border ${form.published_at ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${form.published_at ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="font-medium text-gray-700">
                  {form.published_at ? '🟢 Published' : '⚫ Draft'}
                </span>
              </div>
              {form.published_at && (
                <p className="text-xs text-gray-500">
                  {new Date(form.published_at).toLocaleString('bg-BG')}
                </p>
              )}
            </div>

            {form.total_calories > 0 && (
              <div className="p-4 bg-white border rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3 text-sm">Nutrition Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Calories: <strong>{form.total_calories}</strong></div>
                  <div>Protein: <strong>{form.total_protein}g</strong></div>
                  <div>Fat: <strong>{form.total_fat}g</strong></div>
                  <div>Net Carbs: <strong>{form.total_net_carbs}g</strong></div>
                  <div>Total Weight: <strong>{form.total_weight_grams}g</strong></div>
                  <div>Servings: <strong>{form.servings}</strong></div>
                </div>
                {form.servings > 1 && (
                  <div className="mt-2 pt-2 border-t text-sm text-gray-500">
                    Per serving: <strong>{Math.round(form.total_calories / form.servings)} cal</strong> ·{' '}
                    <strong>{(form.total_net_carbs / form.servings).toFixed(1)}g NC</strong>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-400 space-y-1">
              <p>• Draft → рецептата се вижда само в admin панела</p>
              <p>• Published → показва се на всички потребители</p>
            </div>
          </div>
        )}
      </div>

      {/* Auto-Parse Modal */}
      <AutoParseModal
        isOpen={showAutoParseModal}
        onClose={() => setShowAutoParseModal(false)}
        description={form.description_en || form.description || ''}
        onIngredientsFound={(parsed) => {
          setIngredients(parsed.map(ing => ({
            ingredient_database_id: null,
            ingredient_name: ing.name_bg || ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
          })));
        }}
        onStepsFound={(parsed) => {
          setSteps(parsed.map(s => ({
            step_description_bg: s.step_description_bg || s.step_description,
            step_description_en: s.step_description_en || s.step_description,
            step_duration_minutes: s.step_duration_minutes || 5,
            step_image_url: '',
          })));
        }}
      />

      {/* Action buttons */}
      <div className="px-6 pb-6 pt-2 border-t border-gray-100 flex items-center gap-3">
        <button type="button" onClick={() => save(false)}
          disabled={saving || !form.name.trim()}
          className="px-5 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition">
          {saving ? 'Saving...' : '💾 Save Draft'}
        </button>

        {!form.published_at ? (
          <button type="button" onClick={() => save(true)}
            disabled={saving || !form.name.trim()}
            className="px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition">
            {saving ? 'Publishing...' : '🚀 Publish'}
          </button>
        ) : (
          <button type="button" onClick={unpublish}
            disabled={saving}
            className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition">
            Unpublish
          </button>
        )}

        {form.published_at && (
          <button type="button" onClick={() => save(false)}
            disabled={saving || !form.name.trim()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        )}
      </div>
    </div>
  );
}
