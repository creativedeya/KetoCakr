'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, CheckCircle, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface Ingredient {
  id: string;
  name_bg: string;
  name_en: string;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  fat_per_100g: number | null;
  carbs_per_100g: number | null;
  fiber_per_100g: number | null;
  sodium_per_100g: number | null;
  calcium_per_100g: number | null;
  iron_per_100g: number | null;
  magnesium_per_100g: number | null;
  potassium_per_100g: number | null;
  sugar_per_100g: number | null;
  cholesterol_per_100g: number | null;
  saturated_fat_per_100g: number | null;
  usda_fdc_id: number | null;
  fatsecret_food_id: string | null;
  nutrition_source: string | null;
  nutrition_verified: boolean | null;
  nutrition_verified_at: string | null;
}

interface UsdaResult {
  fdcId: number;
  description: string;
  dataType: string;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  fat_per_100g: number | null;
  carbs_per_100g: number | null;
  fiber_per_100g: number | null;
  net_carbs_per_100g: number | null;
  sodium_per_100g: number | null;
  calcium_per_100g: number | null;
  iron_per_100g: number | null;
  magnesium_per_100g: number | null;
  potassium_per_100g: number | null;
  zinc_per_100g: number | null;
  sugar_per_100g: number | null;
  cholesterol_per_100g: number | null;
  saturated_fat_per_100g: number | null;
  vitamin_a_per_100g: number | null;
  vitamin_c_per_100g: number | null;
  vitamin_d_per_100g: number | null;
}

type FilterType = 'all' | 'unverified' | 'verified' | 'differences';
type SearchSource = 'usda' | 'fatsecret' | 'openfoodfacts' | 'compare';

interface OFFNutrients {
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  fiber: number | null;
  sugar: number | null;
  sugarAlcohol: number | null;
  saturatedFat: number | null;
  cholesterol: number | null;
  sodium: number | null;
  calcium: number | null;
  iron: number | null;
  magnesium: number | null;
  potassium: number | null;
  zinc: number | null;
  vitaminA: number | null;
  vitaminC: number | null;
  vitaminD: number | null;
}

interface FatSecretSearchItem {
  id: string;
  name: string;
  brand: string | null;
  description: string;
  type: string;
}

interface FatSecretFoodDetail {
  id: string;
  name: string;
  brand: string | null;
  nutrients: OFFNutrients;
}

interface OFFResult {
  name: string;
  brand: string | null;
  imageUrl: string | null;
  confidence: number;
  nutrients: OFFNutrients;
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

const SWEETENER_KEYWORDS = [
  'erythritol', 'xylitol', 'allulose', 'stevia', 'monk fruit', 'inulin', 'sorbitol',
  'maltitol', 'isomalt', 'lactitol', 'mannitol',
  'еритритол', 'ксилитол', 'алулоза', 'стевия',
];

function isSweetener(name_en: string, name_bg: string): boolean {
  const lower = (name_en + ' ' + name_bg).toLowerCase();
  return SWEETENER_KEYWORDS.some(kw => lower.includes(kw));
}

function diffPct(current: number | null, usda: number | null): number | null {
  if (current === null || usda === null) return null;
  if (current === 0 && usda === 0) return 0;
  if (current === 0) return 100;
  return Math.abs(((usda - current) / current) * 100);
}

function diffColor(pct: number | null): string {
  if (pct === null) return 'text-gray-400';
  if (pct > 20) return 'text-red-600 font-semibold';
  if (pct > 10) return 'text-amber-600 font-semibold';
  return 'text-green-600';
}

function diffIcon(pct: number | null) {
  if (pct !== null && pct > 10) return <AlertTriangle className="inline w-3.5 h-3.5 ml-1" />;
  return null;
}

function fmt(v: number | null, decimals = 1): string {
  if (v === null) return '—';
  return v.toFixed(decimals);
}

function fmtDiff(current: number | null, usda: number | null): string {
  if (current === null || usda === null) return '—';
  const d = usda - current;
  return (d >= 0 ? '+' : '') + d.toFixed(1);
}

// ─── Multi-source helpers ──────────────────────────────────────────

function usdaToNutrients(usda: UsdaResult): OFFNutrients {
  return {
    calories:     usda.calories_per_100g,
    protein:      usda.protein_per_100g,
    fat:          usda.fat_per_100g,
    carbs:        usda.carbs_per_100g,
    fiber:        usda.fiber_per_100g,
    sugar:        usda.sugar_per_100g,
    sugarAlcohol: null,
    saturatedFat: usda.saturated_fat_per_100g,
    cholesterol:  usda.cholesterol_per_100g,
    sodium:       usda.sodium_per_100g,
    calcium:      usda.calcium_per_100g,
    iron:         usda.iron_per_100g,
    magnesium:    usda.magnesium_per_100g,
    potassium:    usda.potassium_per_100g,
    zinc:         usda.zinc_per_100g,
    vitaminA:     usda.vitamin_a_per_100g,
    vitaminC:     usda.vitamin_c_per_100g,
    vitaminD:     usda.vitamin_d_per_100g,
  };
}

function mergeNutrients(
  usda: UsdaResult | null,
  fs: FatSecretFoodDetail | null
): { nutrients: OFFNutrients; sourcesMap: Record<string, 'usda' | 'fs'> } {
  const u = usda ? usdaToNutrients(usda) : null;
  const f = fs ? fs.nutrients : null;
  const sourcesMap: Record<string, 'usda' | 'fs'> = {};

  function pick(key: keyof OFFNutrients, preferUsda: boolean): number | null {
    const uv = u?.[key] ?? null;
    const fv = f?.[key] ?? null;
    if (preferUsda) {
      if (uv != null) { sourcesMap[key] = 'usda'; return uv; }
      if (fv != null) { sourcesMap[key] = 'fs';   return fv; }
    } else {
      if (fv != null) { sourcesMap[key] = 'fs';   return fv; }
      if (uv != null) { sourcesMap[key] = 'usda'; return uv; }
    }
    return null;
  }

  const macros: (keyof OFFNutrients)[]   = ['calories', 'protein', 'fat', 'carbs', 'fiber'];
  const vitamins: (keyof OFFNutrients)[] = ['vitaminA', 'vitaminC', 'vitaminD'];
  const rest: (keyof OFFNutrients)[]     = ['sugar', 'sugarAlcohol', 'saturatedFat', 'cholesterol', 'sodium', 'calcium', 'iron', 'magnesium', 'potassium', 'zinc'];

  const nutrients: OFFNutrients = {
    calories: null, protein: null, fat: null, carbs: null, fiber: null,
    sugar: null, sugarAlcohol: null, saturatedFat: null, cholesterol: null,
    sodium: null, calcium: null, iron: null, magnesium: null, potassium: null,
    zinc: null, vitaminA: null, vitaminC: null, vitaminD: null,
  };

  for (const k of macros)   nutrients[k] = pick(k, true)  as any;
  for (const k of vitamins)  nutrients[k] = pick(k, false) as any;
  for (const k of rest)      nutrients[k] = pick(k, true)  as any;

  return { nutrients, sourcesMap };
}

function nutrientsToDbFields(n: OFFNutrients) {
  return {
    calories_per_100g:     n.calories,
    protein_per_100g:      n.protein,
    fat_per_100g:          n.fat,
    carbs_per_100g:        n.carbs,
    fiber_per_100g:        n.fiber,
    sugar_per_100g:        n.sugar,
    sugar_alcohol_per_100g: n.sugarAlcohol,
    saturated_fat_per_100g: n.saturatedFat,
    cholesterol_per_100g:  n.cholesterol,
    sodium_per_100g:       n.sodium,
    calcium_per_100g:      n.calcium,
    iron_per_100g:         n.iron,
    magnesium_per_100g:    n.magnesium,
    potassium_per_100g:    n.potassium,
    zinc_per_100g:         n.zinc,
    vitamin_a_per_100g:    n.vitaminA,
    vitamin_c_per_100g:    n.vitaminC,
    vitamin_d_per_100g:    n.vitaminD,
  };
}

// ─── NutrientList sub-component ───────────────────────────────────

const NUTRIENT_ROWS: { key: keyof OFFNutrients; label: string; unit: string }[] = [
  { key: 'calories',     label: 'Калории',     unit: 'kcal' },
  { key: 'protein',      label: 'Протеин',     unit: 'g' },
  { key: 'fat',          label: 'Мазнини',     unit: 'g' },
  { key: 'carbs',        label: 'Въглехидрати',unit: 'g' },
  { key: 'fiber',        label: 'Фибри',       unit: 'g' },
  { key: 'sugar',        label: 'Захар',        unit: 'g' },
  { key: 'saturatedFat', label: 'Наситени',     unit: 'g' },
  { key: 'cholesterol',  label: 'Холестерол',  unit: 'mg' },
  { key: 'sodium',       label: 'Натрий',       unit: 'mg' },
  { key: 'calcium',      label: 'Калций',       unit: 'mg' },
  { key: 'iron',         label: 'Желязо',       unit: 'mg' },
  { key: 'magnesium',    label: 'Магнезий',     unit: 'mg' },
  { key: 'potassium',    label: 'Калий',        unit: 'mg' },
  { key: 'zinc',         label: 'Цинк',         unit: 'mg' },
  { key: 'vitaminA',     label: 'Вит. A',       unit: 'mcg' },
  { key: 'vitaminC',     label: 'Вит. C',       unit: 'mg' },
  { key: 'vitaminD',     label: 'Вит. D',       unit: 'mcg' },
];

function NutrientList({ data, sourcesMap }: { data: OFFNutrients; sourcesMap?: Record<string, 'usda' | 'fs'> }) {
  return (
    <div className="space-y-0.5 text-xs">
      {NUTRIENT_ROWS.map(({ key, label, unit }) => {
        const val = data[key];
        const src = sourcesMap?.[key];
        return (
          <div key={key} className="flex justify-between items-center py-0.5 border-b border-gray-50">
            <span className="text-gray-600">{label}</span>
            <div className="flex items-center gap-1">
              {val != null ? (
                <>
                  <span className="font-medium text-gray-800">{fmt(val)} {unit}</span>
                  {src && (
                    <span className={`text-[10px] px-1 rounded ${src === 'usda' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {src === 'usda' ? 'U' : 'FS'}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-gray-300">—</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Nutrition Recalculation Helpers
// ─────────────────────────────────────────────────────────────────

interface RecipeIngredient {
  ingredient_name: string;
  quantity: number;
  unit: string;
}

interface NutritionTotals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  net_carbs: number;
}

function convertToGrams(quantity: number, unit: string, unitWeightGrams: number | null): number {
  const u = unit.toLowerCase().trim();
  if (u === 'g' || u === 'гр' || u === 'гр.') return quantity;
  if (u === 'kg' || u === 'кг') return quantity * 1000;
  if (u === 'ml' || u === 'мл') return quantity;
  if (u === 'l' || u === 'л') return quantity * 1000;
  if (u === 'бр' || u === 'бр.' || u === 'piece' || u === 'pieces' || u === 'pcs' || u === 'pc') return quantity * (unitWeightGrams || 0);
  if (u === 'ч.л.' || u === 'ч.л' || u === 'tsp') return quantity * 5;
  if (u === 'с.л.' || u === 'с.л' || u === 'tbsp') return quantity * 15;
  console.warn(`Непозната мерна единица: ${unit} — приемаме грамове`);
  return quantity;
}

async function calculateRecipeNutrition(
  recipeIngredients: RecipeIngredient[]
): Promise<NutritionTotals> {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let totalFiber = 0;

  for (const ing of recipeIngredients) {
    const { data: dbIng, error } = await supabase
      .from('ingredients_database')
      .select('calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, unit_weight_grams')
      .or(`name_en.ilike.%${ing.ingredient_name}%,name_bg.ilike.%${ing.ingredient_name}%`)
      .limit(1)
      .maybeSingle();

    if (error || !dbIng) {
      console.warn(`Липсва в DB: ${ing.ingredient_name}`);
      continue;
    }

    const grams = convertToGrams(ing.quantity, ing.unit, dbIng.unit_weight_grams);
    const factor = grams / 100;

    totalCalories += (dbIng.calories_per_100g || 0) * factor;
    totalProtein  += (dbIng.protein_per_100g  || 0) * factor;
    totalFat      += (dbIng.fat_per_100g      || 0) * factor;
    totalCarbs    += (dbIng.carbs_per_100g    || 0) * factor;
    totalFiber    += (dbIng.fiber_per_100g    || 0) * factor;
  }

  return {
    calories:  Math.round(totalCalories),
    protein:   Math.round(totalProtein),
    fat:       Math.round(totalFat),
    carbs:     Math.round(totalCarbs),
    net_carbs: Math.round(totalCarbs - totalFiber),
  };
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export default function UsdaImportPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [usdaData, setUsdaData] = useState<Record<string, UsdaResult | null>>({});
  const [loadingUsda, setLoadingUsda] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<Record<string, UsdaResult[]>>({});
  const [searchOpen, setSearchOpen] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchStats, setBatchStats] = useState<{ auto: number; manual: number; notFound: string[] } | null>(null);
  const [recalcRunning, setRecalcRunning] = useState(false);
  const [recalcDone, setRecalcDone] = useState(false);
  const [recalcProgress, setRecalcProgress] = useState({ current: 0, total: 0 });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [fatSecretSearchList, setFatSecretSearchList] = useState<Record<string, FatSecretSearchItem[]>>({});
  const [fatSecretData, setFatSecretData] = useState<Record<string, FatSecretFoodDetail | null>>({});
  const [loadingFatSecret, setLoadingFatSecret] = useState<Record<string, boolean>>({});
  const [loadingFatSecretDetail, setLoadingFatSecretDetail] = useState<Record<string, boolean>>({});
  const [fatSecretSearchOpen, setFatSecretSearchOpen] = useState<Record<string, boolean>>({});
  const [offData, setOffData] = useState<Record<string, OFFResult | null>>({});
  const [loadingOff, setLoadingOff] = useState<Record<string, boolean>>({});
  const [offSearchResults, setOffSearchResults] = useState<Record<string, OFFResult[]>>({});
  const [offSearchOpen, setOffSearchOpen] = useState<Record<string, boolean>>({});
  const [ingredientSource, setIngredientSource] = useState<Record<string, SearchSource>>({});

  // ── Load ingredients ──────────────────────────────────────────

  async function loadIngredients() {
    setLoading(true);
    const { data, error } = await supabase
      .from('ingredients_database')
      .select(`
        id, name_bg, name_en,
        calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g,
        sodium_per_100g, calcium_per_100g, iron_per_100g, magnesium_per_100g,
        potassium_per_100g, sugar_per_100g, cholesterol_per_100g, saturated_fat_per_100g,
        usda_fdc_id, fatsecret_food_id, nutrition_source, nutrition_verified, nutrition_verified_at
      `)
      .order('name_en');

    if (error) {
      showToast('Грешка при зареждане: ' + error.message, 'error');
    } else {
      setIngredients(data || []);
    }
    setLoading(false);
  }

  useEffect(() => { loadIngredients(); }, []);

  // ── Toast ─────────────────────────────────────────────────────

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  // ── USDA fetch for one ingredient ─────────────────────────────

  const fetchUsda = useCallback(async (ingredient: Ingredient, query?: string) => {
    const q = query || ingredient.name_en;
    if (!q) return;

    setLoadingUsda(prev => ({ ...prev, [ingredient.id]: true }));
    try {
      const res = await fetch(`/api/usda-search?query=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`USDA API error: ${res.status}`);
      const json = await res.json();
      const results: UsdaResult[] = json.results || [];

      if (query) {
        setSearchResults(prev => ({ ...prev, [ingredient.id]: results }));
      } else {
        setUsdaData(prev => ({ ...prev, [ingredient.id]: results[0] || null }));
      }
    } catch (err: any) {
      console.error('USDA fetch error:', err?.message);
      if (!query) setUsdaData(prev => ({ ...prev, [ingredient.id]: null }));
    }
    setLoadingUsda(prev => ({ ...prev, [ingredient.id]: false }));
  }, []);

  // ── Accept USDA data ──────────────────────────────────────────

  async function acceptUsda(ingredient: Ingredient) {
    const usda = usdaData[ingredient.id];
    if (!usda) return;

    setSaving(prev => ({ ...prev, [ingredient.id]: true }));
    const { error } = await supabase
      .from('ingredients_database')
      .update({
        calories_per_100g: usda.calories_per_100g,
        protein_per_100g: usda.protein_per_100g,
        fat_per_100g: usda.fat_per_100g,
        carbs_per_100g: usda.carbs_per_100g,
        fiber_per_100g: usda.fiber_per_100g,
        sodium_per_100g: usda.sodium_per_100g,
        calcium_per_100g: usda.calcium_per_100g,
        iron_per_100g: usda.iron_per_100g,
        magnesium_per_100g: usda.magnesium_per_100g,
        potassium_per_100g: usda.potassium_per_100g,
        zinc_per_100g: usda.zinc_per_100g,
        sugar_per_100g: usda.sugar_per_100g,
        cholesterol_per_100g: usda.cholesterol_per_100g,
        saturated_fat_per_100g: usda.saturated_fat_per_100g,
        vitamin_a_per_100g: usda.vitamin_a_per_100g,
        vitamin_c_per_100g: usda.vitamin_c_per_100g,
        vitamin_d_per_100g: usda.vitamin_d_per_100g,
        usda_fdc_id: usda.fdcId,
        nutrition_source: 'usda',
        nutrition_verified_at: new Date().toISOString(),
      })
      .eq('id', ingredient.id);

    if (error) {
      showToast('Грешка при запис: ' + error.message, 'error');
    } else {
      showToast(`✅ ${ingredient.name_bg} обновен от USDA`, 'success');
      await loadIngredients();
      setExpandedId(null);
    }
    setSaving(prev => ({ ...prev, [ingredient.id]: false }));
  }

  // ── Keep current (mark as reviewed) ──────────────────────────

  async function keepCurrent(ingredient: Ingredient) {
    setSaving(prev => ({ ...prev, [ingredient.id]: true }));
    await supabase
      .from('ingredients_database')
      .update({
        nutrition_source: 'manual_verified',
        nutrition_verified_at: new Date().toISOString(),
      })
      .eq('id', ingredient.id);

    showToast(`${ingredient.name_bg} маркиран като прегледан`, 'success');
    await loadIngredients();
    setExpandedId(null);
    setSaving(prev => ({ ...prev, [ingredient.id]: false }));
  }

  // ── Accept merged data (USDA + FatSecret) ────────────────────

  async function acceptMerged(ingredient: Ingredient) {
    const usda = usdaData[ingredient.id];
    const fs   = fatSecretData[ingredient.id];
    if (!usda && !fs) return;
    const { nutrients } = mergeNutrients(usda ?? null, fs ?? null);
    setSaving(prev => ({ ...prev, [ingredient.id]: true }));
    const { error } = await supabase
      .from('ingredients_database')
      .update({
        ...nutrientsToDbFields(nutrients),
        usda_fdc_id: usda?.fdcId ?? null,
        fatsecret_food_id: fs?.id ?? null,
        nutrition_source: usda && fs ? 'hybrid' : usda ? 'usda' : 'fatsecret',
        nutrition_verified_at: new Date().toISOString(),
      })
      .eq('id', ingredient.id);
    if (error) {
      showToast('Грешка при запис: ' + error.message, 'error');
    } else {
      showToast(`✅ ${ingredient.name_bg} обновен (обединени данни)`, 'success');
      await loadIngredients();
      setExpandedId(null);
    }
    setSaving(prev => ({ ...prev, [ingredient.id]: false }));
  }

  // ── FatSecret fetch ───────────────────────────────────────────

  const fetchFatSecretSearch = useCallback(async (ingredient: Ingredient, query?: string) => {
    const q = query || ingredient.name_en;
    if (!q) return;
    setLoadingFatSecret(prev => ({ ...prev, [ingredient.id]: true }));
    try {
      const res = await fetch(`/api/fatsecret-search?query=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`FatSecret API error: ${res.status}`);
      const json = await res.json();
      setFatSecretSearchList(prev => ({ ...prev, [ingredient.id]: json.results || [] }));
    } catch (err: any) {
      console.error('FatSecret fetch error:', err?.message);
      setFatSecretSearchList(prev => ({ ...prev, [ingredient.id]: [] }));
    }
    setLoadingFatSecret(prev => ({ ...prev, [ingredient.id]: false }));
  }, []);

  async function fetchFatSecretDetail(ingredientId: string, foodId: string) {
    setLoadingFatSecretDetail(prev => ({ ...prev, [ingredientId]: true }));
    try {
      const res = await fetch(`/api/fatsecret-search?food_id=${encodeURIComponent(foodId)}`);
      const json = await res.json();
      setFatSecretData(prev => ({ ...prev, [ingredientId]: json.id ? json : null }));
    } catch {
      setFatSecretData(prev => ({ ...prev, [ingredientId]: null }));
    }
    setLoadingFatSecretDetail(prev => ({ ...prev, [ingredientId]: false }));
  }

  // ── Accept FatSecret data ─────────────────────────────────────

  async function acceptFatSecret(ingredient: Ingredient) {
    const detail = fatSecretData[ingredient.id];
    if (!detail) return;
    setSaving(prev => ({ ...prev, [ingredient.id]: true }));
    const { error } = await supabase
      .from('ingredients_database')
      .update({
        ...nutrientsToDbFields(detail.nutrients),
        fatsecret_food_id: detail.id,
        nutrition_source: 'fatsecret',
        nutrition_verified_at: new Date().toISOString(),
      })
      .eq('id', ingredient.id);
    if (error) {
      showToast('Грешка при запис: ' + error.message, 'error');
    } else {
      showToast(`✅ ${ingredient.name_bg} обновен от FatSecret`, 'success');
      await loadIngredients();
      setExpandedId(null);
    }
    setSaving(prev => ({ ...prev, [ingredient.id]: false }));
  }

  // ── OFF fetch ─────────────────────────────────────────────────

  const fetchOFF = useCallback(async (ingredient: Ingredient, query?: string) => {
    const q = query || ingredient.name_en;
    if (!q) return;
    setLoadingOff(prev => ({ ...prev, [ingredient.id]: true }));
    try {
      const res = await fetch(`/api/openfoodfacts-search?query=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`OFF API error: ${res.status}`);
      const json = await res.json();
      const results: OFFResult[] = json.results || [];
      if (query) {
        setOffSearchResults(prev => ({ ...prev, [ingredient.id]: results }));
      } else {
        setOffData(prev => ({ ...prev, [ingredient.id]: results[0] || null }));
      }
    } catch (err: any) {
      console.error('OFF fetch error:', err?.message);
      if (!query) setOffData(prev => ({ ...prev, [ingredient.id]: null }));
    }
    setLoadingOff(prev => ({ ...prev, [ingredient.id]: false }));
  }, []);

  // ── Accept OFF data ───────────────────────────────────────────

  async function acceptOFF(ingredient: Ingredient) {
    const off = offData[ingredient.id];
    if (!off) return;
    setSaving(prev => ({ ...prev, [ingredient.id]: true }));
    const { error } = await supabase
      .from('ingredients_database')
      .update({
        ...nutrientsToDbFields(off.nutrients),
        nutrition_source: 'openfoodfacts',
        nutrition_verified_at: new Date().toISOString(),
      })
      .eq('id', ingredient.id);
    if (error) {
      showToast('Грешка при запис: ' + error.message, 'error');
    } else {
      showToast(`✅ ${ingredient.name_bg} обновен от Open Food Facts`, 'success');
      await loadIngredients();
      setExpandedId(null);
    }
    setSaving(prev => ({ ...prev, [ingredient.id]: false }));
  }

  // ── Batch import ──────────────────────────────────────────────

  async function runBatchImport() {
    const unverified = ingredients.filter(i => i.nutrition_source === 'manual' || !i.nutrition_source);
    if (unverified.length === 0) {
      showToast('Всички съставки вече са верифицирани', 'success');
      return;
    }

    setBatchRunning(true);
    setBatchTotal(unverified.length);
    setBatchProgress(0);
    setBatchStats(null);

    let auto = 0;
    let manual = 0;
    const notFound: string[] = [];

    for (let i = 0; i < unverified.length; i++) {
      const ingredient = unverified[i];
      setBatchProgress(i + 1);

      // Skip sweeteners — mark for manual review
      if (isSweetener(ingredient.name_en || '', ingredient.name_bg || '')) {
        manual++;
        await supabase
          .from('ingredients_database')
          .update({ nutrition_source: 'sweetener_manual' })
          .eq('id', ingredient.id);
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      try {
        const res = await fetch(`/api/usda-search?query=${encodeURIComponent(ingredient.name_en || ingredient.name_bg)}`);
        const json = await res.json();
        const results: UsdaResult[] = json.results || [];

        if (results.length === 0) {
          notFound.push(ingredient.name_en || ingredient.name_bg);
          manual++;
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        const usda = results[0];
        const pct = diffPct(ingredient.calories_per_100g, usda.calories_per_100g);

        if (pct !== null && pct <= 15) {
          // Auto-accept
          await supabase
            .from('ingredients_database')
            .update({
              calories_per_100g: usda.calories_per_100g,
              protein_per_100g: usda.protein_per_100g,
              fat_per_100g: usda.fat_per_100g,
              carbs_per_100g: usda.carbs_per_100g,
              fiber_per_100g: usda.fiber_per_100g,
              sodium_per_100g: usda.sodium_per_100g,
              calcium_per_100g: usda.calcium_per_100g,
              iron_per_100g: usda.iron_per_100g,
              magnesium_per_100g: usda.magnesium_per_100g,
              potassium_per_100g: usda.potassium_per_100g,
              zinc_per_100g: usda.zinc_per_100g,
              sugar_per_100g: usda.sugar_per_100g,
              cholesterol_per_100g: usda.cholesterol_per_100g,
              saturated_fat_per_100g: usda.saturated_fat_per_100g,
              vitamin_a_per_100g: usda.vitamin_a_per_100g,
              vitamin_c_per_100g: usda.vitamin_c_per_100g,
              vitamin_d_per_100g: usda.vitamin_d_per_100g,
              usda_fdc_id: usda.fdcId,
              nutrition_source: 'usda',
              nutrition_verified_at: new Date().toISOString(),
            })
            .eq('id', ingredient.id);
          auto++;
        } else {
          // Mark for manual review
          await supabase
            .from('ingredients_database')
            .update({ nutrition_source: 'manual_review_needed' })
            .eq('id', ingredient.id);
          manual++;
        }
      } catch {
        notFound.push(ingredient.name_en || ingredient.name_bg);
        manual++;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setBatchStats({ auto, manual, notFound });
    setBatchRunning(false);
    await loadIngredients();
  }

  // ── Recalculate recipes ───────────────────────────────────────

  async function recalculateAllRecipes() {
    setRecalcRunning(true);
    setRecalcDone(false);
    setRecalcProgress({ current: 0, total: 0 });

    try {
      const { data: recipes, error: recipesError } = await supabase
        .from('base_recipes')
        .select('id, name');

      if (recipesError) throw recipesError;
      if (!recipes || recipes.length === 0) {
        showToast('Няма рецепти за преизчисляване', 'error');
        setRecalcRunning(false);
        return;
      }

      setRecalcProgress({ current: 0, total: recipes.length });
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < recipes.length; i++) {
        const recipe = recipes[i];

        try {
          const { data: ings, error: ingError } = await supabase
            .from('recipe_ingredients')
            .select('ingredient_name, quantity, unit')
            .eq('recipe_id', recipe.id);

          if (ingError) throw ingError;
          if (!ings || ings.length === 0) {
            console.warn(`${recipe.name} — няма съставки`);
            errorCount++;
            setRecalcProgress({ current: i + 1, total: recipes.length });
            continue;
          }

          const nutrition = await calculateRecipeNutrition(ings);

          const { error: updateError } = await supabase
            .from('base_recipes')
            .update({
              total_calories:  nutrition.calories,
              total_protein:   nutrition.protein,
              total_fat:       nutrition.fat,
              total_carbs:     nutrition.carbs,
              total_net_carbs: nutrition.net_carbs,
            })
            .eq('id', recipe.id);

          if (updateError) throw updateError;
          successCount++;
        } catch (err) {
          console.error(`Грешка при ${recipe.name}:`, err);
          errorCount++;
        }

        setRecalcProgress({ current: i + 1, total: recipes.length });
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setRecalcDone(true);
      showToast(
        `✅ Преизчислени ${successCount} рецепти${errorCount > 0 ? ` (${errorCount} грешки)` : ''}`,
        successCount > 0 ? 'success' : 'error'
      );
    } catch (error) {
      console.error('Грешка при преизчисляване:', error);
      showToast('Грешка при преизчисляване на рецепти', 'error');
    } finally {
      setRecalcRunning(false);
    }
  }

  // ── Filter ────────────────────────────────────────────────────

  const filteredIngredients = ingredients.filter(i => {
    if (filter === 'verified') return i.nutrition_source === 'usda';
    if (filter === 'unverified') return i.nutrition_source === 'manual' || !i.nutrition_source;
    if (filter === 'differences') return i.nutrition_source === 'manual_review_needed';
    return true;
  });

  const verifiedCount = ingredients.filter(i => i.nutrition_source === 'usda').length;

  // ── Row component ─────────────────────────────────────────────

  function IngredientRow({ ingredient }: { ingredient: Ingredient }) {
    const isExpanded = expandedId === ingredient.id;
    const usda   = usdaData[ingredient.id] ?? null;
    const off    = offData[ingredient.id]  ?? null;
    const source: SearchSource = ingredientSource[ingredient.id] || 'usda';
    const isVerified   = ['usda', 'openfoodfacts', 'hybrid', 'fatsecret'].includes(ingredient.nutrition_source || '');
    const needsReview  = ingredient.nutrition_source === 'manual_review_needed';
    const isSweetenerItem = isSweetener(ingredient.name_en || '', ingredient.name_bg || '');
    const isLoadingAny = loadingUsda[ingredient.id] || loadingFatSecret[ingredient.id] || loadingOff[ingredient.id];
    const fsDetail = fatSecretData[ingredient.id] ?? null;
    const fsList   = fatSecretSearchList[ingredient.id] ?? [];

    const { nutrients: merged, sourcesMap } = mergeNutrients(usda, fsDetail);

    function toggle() {
      if (isExpanded) {
        setExpandedId(null);
      } else {
        setExpandedId(ingredient.id);
        const src = ingredientSource[ingredient.id] || 'usda';
        if ((src === 'usda' || src === 'compare') && !usdaData[ingredient.id] && !loadingUsda[ingredient.id]) fetchUsda(ingredient);
        if ((src === 'fatsecret' || src === 'compare') && !fsList.length && !loadingFatSecret[ingredient.id]) fetchFatSecretSearch(ingredient);
        if ((src === 'openfoodfacts' || src === 'compare') && !offData[ingredient.id] && !loadingOff[ingredient.id]) fetchOFF(ingredient);
      }
    }

    function changeSource(src: SearchSource) {
      setIngredientSource(prev => ({ ...prev, [ingredient.id]: src }));
      if ((src === 'usda' || src === 'compare') && !usdaData[ingredient.id] && !loadingUsda[ingredient.id]) fetchUsda(ingredient);
      if ((src === 'fatsecret' || src === 'compare') && !fatSecretSearchList[ingredient.id]?.length && !loadingFatSecret[ingredient.id]) fetchFatSecretSearch(ingredient);
      if ((src === 'openfoodfacts' || src === 'compare') && !offData[ingredient.id] && !loadingOff[ingredient.id]) fetchOFF(ingredient);
    }

    const srcLabel = ingredient.nutrition_source;

    return (
      <div className={`border rounded-lg overflow-hidden mb-3 ${
        isVerified ? 'border-green-200 bg-green-50' :
        needsReview ? 'border-amber-200 bg-amber-50' :
        'border-gray-200 bg-white'
      }`}>
        {/* Header */}
        <button onClick={toggle} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-black/5 transition-colors">
          <div className="flex items-center gap-3">
            {isVerified
              ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              : needsReview
              ? <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              : isSweetenerItem
              ? <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">🍬</span>
              : <AlertTriangle className="w-4 h-4 text-gray-300 flex-shrink-0" />
            }
            <div>
              <div className="font-medium text-gray-900">{ingredient.name_bg}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                {ingredient.name_en}
                {srcLabel && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    srcLabel === 'usda' ? 'bg-blue-100 text-blue-700' :
                    srcLabel === 'openfoodfacts' ? 'bg-green-100 text-green-700' :
                    srcLabel === 'hybrid' ? 'bg-purple-100 text-purple-700' :
                    srcLabel === 'fatsecret' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>{srcLabel}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{fmt(ingredient.calories_per_100g, 0)} kcal</span>
            <span>P: {fmt(ingredient.protein_per_100g)}</span>
            <span>F: {fmt(ingredient.fat_per_100g)}</span>
            <span>C: {fmt(ingredient.carbs_per_100g)}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Expanded */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            {/* Source selector */}
            <div className="mt-3 flex flex-wrap gap-1.5 pb-3 border-b border-gray-100">
              {(['usda', 'fatsecret', 'openfoodfacts', 'compare'] as SearchSource[]).map(s => (
                <button
                  key={s}
                  onClick={() => changeSource(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    source === s ? 'bg-[#A80048] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'usda' ? '🔬 USDA' : s === 'fatsecret' ? '🧬 FatSecret' : s === 'openfoodfacts' ? '🌍 Open Food Facts' : '⭐ Сравни всичко'}
                </button>
              ))}
            </div>

            {/* Loading */}
            {isLoadingAny && (
              <div className="py-3 text-center text-gray-500 text-sm">
                <RefreshCw className="inline w-4 h-4 animate-spin mr-2" />
                {[loadingUsda[ingredient.id] && 'USDA', loadingFatSecret[ingredient.id] && 'FatSecret', loadingOff[ingredient.id] && 'Open Food Facts']
                  .filter(Boolean).join(' + ')} {isLoadingAny ? '...' : ''}
              </div>
            )}

            {!isLoadingAny && (
              <>
                {/* ─── USDA mode ─── */}
                {source === 'usda' && (
                  <>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500 border-b">
                            <th className="text-left py-1.5 pr-4">Нутриент</th>
                            <th className="text-right py-1.5 pr-4">Текущо</th>
                            <th className="text-right py-1.5 pr-4">USDA</th>
                            <th className="text-right py-1.5">Разлика</th>
                          </tr>
                        </thead>
                        <tbody>
                          {([
                            ['Калории (kcal)', ingredient.calories_per_100g, usda?.calories_per_100g],
                            ['Протеин (g)',    ingredient.protein_per_100g,  usda?.protein_per_100g],
                            ['Мазнини (g)',    ingredient.fat_per_100g,      usda?.fat_per_100g],
                            ['Въглехидрати (g)', ingredient.carbs_per_100g, usda?.carbs_per_100g],
                            ['Фибри (g)',      ingredient.fiber_per_100g,   usda?.fiber_per_100g],
                            ['Net Carbs (g)',
                              ingredient.carbs_per_100g != null && ingredient.fiber_per_100g != null
                                ? Math.round(((ingredient.carbs_per_100g||0) - (ingredient.fiber_per_100g||0)) * 10) / 10
                                : null,
                              usda?.net_carbs_per_100g],
                          ] as [string, number | null, number | null | undefined][]).map(([label, cur, uv]) => {
                            const pct = diffPct(cur ?? null, uv ?? null);
                            return (
                              <tr key={label} className="border-b border-gray-50">
                                <td className="py-1.5 pr-4 text-gray-700">{label}</td>
                                <td className="text-right py-1.5 pr-4 text-gray-600">{fmt(cur ?? null)}</td>
                                <td className="text-right py-1.5 pr-4 font-medium">{fmt(uv ?? null)}</td>
                                <td className={`text-right py-1.5 ${diffColor(pct)}`}>
                                  {fmtDiff(cur ?? null, uv ?? null)}{diffIcon(pct)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {usda && (
                      <div className="mt-2 text-xs text-gray-500 bg-blue-50 rounded p-2">
                        <span className="font-medium text-blue-700">Мин./Витамини: </span>
                        Na:{fmt(usda.sodium_per_100g)}mg · Ca:{fmt(usda.calcium_per_100g)}mg · Fe:{fmt(usda.iron_per_100g)}mg · Mg:{fmt(usda.magnesium_per_100g)}mg · K:{fmt(usda.potassium_per_100g)}mg · Zn:{fmt(usda.zinc_per_100g)}mg · A:{fmt(usda.vitamin_a_per_100g)}mcg · C:{fmt(usda.vitamin_c_per_100g)}mg · D:{fmt(usda.vitamin_d_per_100g)}mcg
                      </div>
                    )}
                    {usda && <div className="mt-1 text-xs text-gray-400">USDA: &ldquo;{usda.description}&rdquo; ({usda.dataType}, FDC: {usda.fdcId})</div>}
                    {!usda && <div className="mt-3 text-sm text-amber-600 bg-amber-50 rounded p-2">USDA не намери съвпадение. Опитай ръчно търсене или превключи на 🌍 OFF.</div>}
                    <div className="mt-3">
                      <button onClick={() => setSearchOpen(prev => ({ ...prev, [ingredient.id]: !prev[ingredient.id] }))} className="text-sm text-[#A80048] hover:underline flex items-center gap-1">
                        <Search className="w-3.5 h-3.5" /> Търси друг USDA match
                      </button>
                      {searchOpen[ingredient.id] && (
                        <div className="mt-2 flex gap-2">
                          <input type="text" className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#A80048]" placeholder="Търси в USDA..."
                            value={searchQuery[ingredient.id] || ingredient.name_en || ''}
                            onChange={e => setSearchQuery(prev => ({ ...prev, [ingredient.id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') fetchUsda(ingredient, searchQuery[ingredient.id]); }} />
                          <button onClick={() => fetchUsda(ingredient, searchQuery[ingredient.id])} className="bg-[#A80048] text-white px-3 py-1.5 rounded text-sm hover:bg-[#8a003c]">Търси</button>
                        </div>
                      )}
                      {searchOpen[ingredient.id] && searchResults[ingredient.id]?.map(r => (
                        <div key={r.fdcId} className="mt-1.5 p-2 border rounded cursor-pointer hover:bg-gray-50 text-sm"
                          onClick={() => { setUsdaData(prev => ({ ...prev, [ingredient.id]: r })); setSearchOpen(prev => ({ ...prev, [ingredient.id]: false })); }}>
                          <div className="font-medium">{r.description}</div>
                          <div className="text-xs text-gray-500">{r.dataType} · {r.calories_per_100g} kcal · P {r.protein_per_100g}g · C {r.carbs_per_100g}g</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button disabled={!usda || saving[ingredient.id]} onClick={() => acceptUsda(ingredient)}
                        className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors">
                        <CheckCircle className="w-4 h-4" />{saving[ingredient.id] ? 'Записва...' : 'Приеми USDA'}
                      </button>
                      <button disabled={saving[ingredient.id]} onClick={() => keepCurrent(ingredient)}
                        className="flex items-center gap-1.5 bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300 transition-colors">
                        <X className="w-4 h-4" /> Запази текущо
                      </button>
                    </div>
                  </>
                )}

                {/* ─── Open Food Facts mode ─── */}
                {source === 'openfoodfacts' && (
                  <>
                    {off ? (
                      <div className="mt-3 border rounded-lg p-3 bg-green-50 border-green-200">
                        <div className="flex items-start gap-3 mb-3">
                          {off.imageUrl && <img src={off.imageUrl} alt={off.name} className="w-14 h-14 object-cover rounded border flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">{off.name}</div>
                            {off.brand && <div className="text-xs text-gray-600 truncate">🏷 {off.brand}</div>}
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${off.confidence >= 70 ? 'bg-green-500' : off.confidence >= 40 ? 'bg-yellow-500' : 'bg-red-400'}`}
                                  style={{ width: `${off.confidence}%` }} />
                              </div>
                              <span className="text-xs text-gray-500 flex-shrink-0">Confidence: {off.confidence}%</span>
                            </div>
                          </div>
                        </div>
                        <NutrientList data={off.nutrients} />
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-amber-600 bg-amber-50 rounded p-2">Open Food Facts не намери съвпадение. Опитай ръчно търсене.</div>
                    )}
                    <div className="mt-3">
                      <button onClick={() => setOffSearchOpen(prev => ({ ...prev, [ingredient.id]: !prev[ingredient.id] }))} className="text-sm text-[#A80048] hover:underline flex items-center gap-1">
                        <Search className="w-3.5 h-3.5" /> Търси в Open Food Facts
                      </button>
                      {offSearchOpen[ingredient.id] && (
                        <div className="mt-2 flex gap-2">
                          <input type="text" className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#A80048]" placeholder="Търси продукт..."
                            value={searchQuery[ingredient.id] || ingredient.name_en || ''}
                            onChange={e => setSearchQuery(prev => ({ ...prev, [ingredient.id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') fetchOFF(ingredient, searchQuery[ingredient.id]); }} />
                          <button onClick={() => fetchOFF(ingredient, searchQuery[ingredient.id])} className="bg-[#A80048] text-white px-3 py-1.5 rounded text-sm hover:bg-[#8a003c]">Търси</button>
                        </div>
                      )}
                      {offSearchOpen[ingredient.id] && offSearchResults[ingredient.id]?.map((r, i) => (
                        <div key={i} className="mt-1.5 p-2 border rounded cursor-pointer hover:bg-gray-50 text-sm flex items-center gap-2"
                          onClick={() => { setOffData(prev => ({ ...prev, [ingredient.id]: r })); setOffSearchOpen(prev => ({ ...prev, [ingredient.id]: false })); }}>
                          {r.imageUrl && <img src={r.imageUrl} alt="" className="w-8 h-8 object-cover rounded flex-shrink-0" />}
                          <div className="min-w-0">
                            <div className="font-medium truncate">{r.name}</div>
                            <div className="text-xs text-gray-500">{r.brand && `${r.brand} · `}{r.nutrients.calories} kcal · {r.confidence}% conf.</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button disabled={!off || saving[ingredient.id]} onClick={() => acceptOFF(ingredient)}
                        className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-40 transition-colors">
                        <CheckCircle className="w-4 h-4" />{saving[ingredient.id] ? 'Записва...' : 'Приеми OFF'}
                      </button>
                      <button disabled={saving[ingredient.id]} onClick={() => keepCurrent(ingredient)}
                        className="flex items-center gap-1.5 bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300 transition-colors">
                        <X className="w-4 h-4" /> Запази текущо
                      </button>
                    </div>
                  </>
                )}

                {/* ─── FatSecret mode ─── */}
                {source === 'fatsecret' && (
                  <>
                    {/* Search results list */}
                    {!fsDetail && fsList.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <p className="text-xs text-gray-500 mb-2">Избери храна от FatSecret:</p>
                        {fsList.map(r => (
                          <div
                            key={r.id}
                            className="border rounded p-2.5 cursor-pointer hover:bg-orange-50 hover:border-orange-200 text-sm transition-colors"
                            onClick={() => fetchFatSecretDetail(ingredient.id, r.id)}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-medium truncate">{r.name}</div>
                                {r.brand && <div className="text-xs text-gray-500 truncate">🏷 {r.brand}</div>}
                                <div className="text-xs text-gray-400 truncate">{r.description}</div>
                              </div>
                              <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded ${
                                r.type === 'Brand' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                              }`}>{r.type}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Loading detail */}
                    {loadingFatSecretDetail[ingredient.id] && (
                      <div className="mt-3 py-3 text-center text-gray-500 text-sm">
                        <RefreshCw className="inline w-4 h-4 animate-spin mr-2" />
                        Зарежда нутриенти...
                      </div>
                    )}

                    {/* Selected food detail */}
                    {fsDetail && !loadingFatSecretDetail[ingredient.id] && (
                      <div className="mt-3 border rounded-lg p-3 bg-orange-50 border-orange-200">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <div className="font-medium text-sm text-gray-900">{fsDetail.name}</div>
                            {fsDetail.brand && <div className="text-xs text-gray-600">🏷 {fsDetail.brand}</div>}
                            <div className="text-[10px] text-orange-600 mt-0.5">ID: {fsDetail.id}</div>
                          </div>
                          <button
                            onClick={() => setFatSecretData(prev => ({ ...prev, [ingredient.id]: null }))}
                            className="text-gray-400 hover:text-gray-600 text-xs flex-shrink-0"
                          >
                            ↩ Назад
                          </button>
                        </div>
                        <NutrientList data={fsDetail.nutrients} />
                      </div>
                    )}

                    {/* No results */}
                    {!fsList.length && !loadingFatSecret[ingredient.id] && !fsDetail && (
                      <div className="mt-3 text-sm text-amber-600 bg-amber-50 rounded p-2">
                        FatSecret не намери съвпадение. Опитай ръчно търсене.
                      </div>
                    )}

                    {/* Manual re-search */}
                    <div className="mt-3">
                      <button
                        onClick={() => setFatSecretSearchOpen(prev => ({ ...prev, [ingredient.id]: !prev[ingredient.id] }))}
                        className="text-sm text-[#A80048] hover:underline flex items-center gap-1"
                      >
                        <Search className="w-3.5 h-3.5" /> Търси в FatSecret
                      </button>
                      {fatSecretSearchOpen[ingredient.id] && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#A80048]"
                            placeholder="Търси в FatSecret..."
                            value={searchQuery[ingredient.id] || ingredient.name_en || ''}
                            onChange={e => setSearchQuery(prev => ({ ...prev, [ingredient.id]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                setFatSecretData(prev => ({ ...prev, [ingredient.id]: null }));
                                fetchFatSecretSearch(ingredient, searchQuery[ingredient.id]);
                                setFatSecretSearchOpen(prev => ({ ...prev, [ingredient.id]: false }));
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              setFatSecretData(prev => ({ ...prev, [ingredient.id]: null }));
                              fetchFatSecretSearch(ingredient, searchQuery[ingredient.id]);
                              setFatSecretSearchOpen(prev => ({ ...prev, [ingredient.id]: false }));
                            }}
                            className="bg-[#A80048] text-white px-3 py-1.5 rounded text-sm hover:bg-[#8a003c]"
                          >
                            Търси
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        disabled={!fsDetail || saving[ingredient.id]}
                        onClick={() => acceptFatSecret(ingredient)}
                        className="flex items-center gap-1.5 bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-700 disabled:opacity-40 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />{saving[ingredient.id] ? 'Записва...' : 'Приеми FatSecret'}
                      </button>
                      <button
                        disabled={saving[ingredient.id]}
                        onClick={() => keepCurrent(ingredient)}
                        className="flex items-center gap-1.5 bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" /> Запази текущо
                      </button>
                    </div>
                  </>
                )}

                {/* ─── Compare All 3 mode ─── */}
                {source === 'compare' && (
                  <>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {/* USDA column */}
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-blue-700">🔬 USDA</span>
                          {usda && <span className="text-xs text-gray-400">FDC: {usda.fdcId}</span>}
                        </div>
                        {usda ? (
                          <>
                            <div className="text-xs text-gray-500 mb-2 truncate" title={usda.description}>{usda.description}</div>
                            <NutrientList data={usdaToNutrients(usda)} />
                            <button disabled={saving[ingredient.id]} onClick={() => acceptUsda(ingredient)}
                              className="mt-2 w-full px-2 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-40">
                              Приеми USDA
                            </button>
                          </>
                        ) : (
                          <div className="text-xs text-gray-400 py-3 text-center">Няма резултат от USDA</div>
                        )}
                      </div>

                      {/* FatSecret column */}
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-orange-700">🧬 FatSecret</span>
                          {fsDetail && <span className="text-xs text-gray-400">ID: {fsDetail.id}</span>}
                        </div>
                        {loadingFatSecretDetail[ingredient.id] ? (
                          <div className="text-xs text-gray-400 py-3 text-center">
                            <RefreshCw className="inline w-3 h-3 animate-spin mr-1" />Зарежда...
                          </div>
                        ) : fsDetail ? (
                          <>
                            <div className="text-xs text-gray-600 mb-2 truncate">{fsDetail.name}{fsDetail.brand ? ` · ${fsDetail.brand}` : ''}</div>
                            <NutrientList data={fsDetail.nutrients} />
                            <button disabled={saving[ingredient.id]} onClick={() => acceptFatSecret(ingredient)}
                              className="mt-2 w-full px-2 py-1.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 disabled:opacity-40">
                              Приеми FatSecret
                            </button>
                          </>
                        ) : fsList.length > 0 ? (
                          <div className="space-y-1">
                            {fsList.slice(0, 4).map(r => (
                              <div key={r.id} className="p-1.5 border rounded cursor-pointer hover:bg-orange-50 text-xs transition-colors"
                                onClick={() => fetchFatSecretDetail(ingredient.id, r.id)}>
                                <div className="font-medium truncate">{r.name}</div>
                                {r.brand && <div className="text-gray-400 truncate">{r.brand}</div>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 py-3 text-center">Няма резултат от FatSecret</div>
                        )}
                      </div>

                      {/* Open Food Facts column */}
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-green-700">🌍 Open Food Facts</span>
                          {off && <span className="text-xs text-gray-400">{off.confidence}%</span>}
                        </div>
                        {off ? (
                          <>
                            <div className="flex items-center gap-1.5 mb-2">
                              {off.imageUrl && <img src={off.imageUrl} alt="" className="w-8 h-8 object-cover rounded flex-shrink-0" />}
                              <div className="min-w-0">
                                <div className="text-xs text-gray-600 truncate">{off.name}</div>
                                {off.brand && <div className="text-[10px] text-gray-400 truncate">{off.brand}</div>}
                              </div>
                            </div>
                            <NutrientList data={off.nutrients} />
                            <button disabled={saving[ingredient.id]} onClick={() => acceptOFF(ingredient)}
                              className="mt-2 w-full px-2 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-40">
                              Приеми OFF
                            </button>
                          </>
                        ) : (
                          <div className="text-xs text-gray-400 py-3 text-center">Няма резултат от OFF</div>
                        )}
                      </div>
                    </div>

                    {/* Merge section */}
                    {(usda || fsDetail) && (
                      <div className="mt-3 border-2 border-purple-200 rounded-lg p-3 bg-purple-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-purple-800">⭐ Обединени данни</span>
                          <span className="text-xs text-gray-500">USDA макроси · FS витамини</span>
                        </div>
                        <NutrientList data={merged} sourcesMap={sourcesMap} />
                        <button disabled={saving[ingredient.id]} onClick={() => acceptMerged(ingredient)}
                          className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 disabled:opacity-40 transition-colors">
                          <CheckCircle className="w-4 h-4" />
                          {saving[ingredient.id] ? 'Записва...' : 'Приеми обединените данни'}
                        </button>
                      </div>
                    )}

                    {/* Manual re-search */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={() => setSearchOpen(prev => ({ ...prev, [ingredient.id]: !prev[ingredient.id] }))} className="text-xs text-[#A80048] hover:underline flex items-center gap-1">
                        <Search className="w-3 h-3" /> Друг USDA match
                      </button>
                      <button onClick={() => {
                        setFatSecretData(prev => ({ ...prev, [ingredient.id]: null }));
                        setFatSecretSearchOpen(prev => ({ ...prev, [ingredient.id]: !prev[ingredient.id] }));
                      }} className="text-xs text-[#A80048] hover:underline flex items-center gap-1">
                        <Search className="w-3 h-3" /> Друг FatSecret match
                      </button>
                    </div>
                    {searchOpen[ingredient.id] && (
                      <div className="mt-2 flex gap-2">
                        <input type="text" className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:border-[#A80048]" placeholder="Търси в USDA..."
                          value={searchQuery[ingredient.id] || ingredient.name_en || ''}
                          onChange={e => setSearchQuery(prev => ({ ...prev, [ingredient.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') fetchUsda(ingredient, searchQuery[ingredient.id]); }} />
                        <button onClick={() => fetchUsda(ingredient, searchQuery[ingredient.id])} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">USDA</button>
                      </div>
                    )}
                    {searchOpen[ingredient.id] && searchResults[ingredient.id]?.map(r => (
                      <div key={r.fdcId} className="mt-1 p-1.5 border rounded cursor-pointer hover:bg-gray-50 text-xs"
                        onClick={() => { setUsdaData(prev => ({ ...prev, [ingredient.id]: r })); setSearchOpen(prev => ({ ...prev, [ingredient.id]: false })); }}>
                        {r.description} · {r.calories_per_100g} kcal
                      </div>
                    ))}
                    {fatSecretSearchOpen[ingredient.id] && (
                      <div className="mt-2 flex gap-2">
                        <input type="text" className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:border-[#A80048]" placeholder="Търси в FatSecret..."
                          value={searchQuery[ingredient.id] || ingredient.name_en || ''}
                          onChange={e => setSearchQuery(prev => ({ ...prev, [ingredient.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') { fetchFatSecretSearch(ingredient, searchQuery[ingredient.id]); setFatSecretSearchOpen(prev => ({ ...prev, [ingredient.id]: false })); } }} />
                        <button onClick={() => { fetchFatSecretSearch(ingredient, searchQuery[ingredient.id]); setFatSecretSearchOpen(prev => ({ ...prev, [ingredient.id]: false })); }} className="bg-orange-600 text-white px-2 py-1 rounded text-xs">FS</button>
                      </div>
                    )}

                    <div className="mt-3">
                      <button disabled={saving[ingredient.id]} onClick={() => keepCurrent(ingredient)}
                        className="flex items-center gap-1.5 bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300 transition-colors">
                        <X className="w-4 h-4" /> Запази текущо
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🔬 Multi-Source Nutrition Import</h1>
        <p className="text-gray-500 mt-1">USDA FoodData Central · FatSecret Platform · Open Food Facts · Сравни всичко</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Прогрес: <strong>{verifiedCount}</strong> / {ingredients.length} верифицирани
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={runBatchImport}
              disabled={batchRunning || recalcRunning}
              className="flex items-center gap-1.5 bg-[#A80048] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#8a003c] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${batchRunning ? 'animate-spin' : ''}`} />
              {batchRunning ? `Обработва... ${batchProgress}/${batchTotal}` : 'Batch Import All'}
            </button>
            <button
              onClick={recalculateAllRecipes}
              disabled={recalcRunning || batchRunning}
              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${recalcRunning ? 'animate-spin' : ''}`} />
              {recalcRunning
                ? `Преизчисляване... (${recalcProgress.current}/${recalcProgress.total})`
                : recalcDone
                ? <><CheckCircle className="w-4 h-4" /> Преизчислени ✓</>
                : '♻️ Преизчисли рецепти'}
            </button>
          </div>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#A80048] transition-all duration-500"
            style={{ width: ingredients.length ? `${(verifiedCount / ingredients.length) * 100}%` : '0%' }}
          />
        </div>
        {batchRunning && batchTotal > 0 && (
          <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all duration-300"
              style={{ width: `${(batchProgress / batchTotal) * 100}%` }}
            />
          </div>
        )}

        {batchStats && (
          <div className="mt-3 text-sm">
            <span className="text-green-600 font-medium">✅ Автоматично обновени: {batchStats.auto}</span>
            {' · '}
            <span className="text-amber-600 font-medium">⚠️ За ръчен преглед: {batchStats.manual}</span>
            {batchStats.notFound.length > 0 && (
              <div className="mt-1 text-xs text-gray-500">
                Не намерени в USDA: {batchStats.notFound.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {([
          ['all', 'Всички', ingredients.length],
          ['unverified', 'Неверифицирани', ingredients.filter(i => i.nutrition_source === 'manual' || !i.nutrition_source).length],
          ['differences', 'За преглед', ingredients.filter(i => i.nutrition_source === 'manual_review_needed').length],
          ['verified', 'Верифицирани', verifiedCount],
        ] as [FilterType, string, number][]).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-[#A80048] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Ingredient list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <RefreshCw className="inline w-5 h-5 animate-spin mr-2" />
          Зарежда съставки...
        </div>
      ) : filteredIngredients.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Няма съставки за показване</div>
      ) : (
        filteredIngredients.map(ingredient => (
          <IngredientRow key={ingredient.id} ingredient={ingredient} />
        ))
      )}
    </div>
  );
}
