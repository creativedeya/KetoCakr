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
  nutrition_source: string | null;
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
  sugar_per_100g: number | null;
  cholesterol_per_100g: number | null;
  saturated_fat_per_100g: number | null;
}

type FilterType = 'all' | 'unverified' | 'verified' | 'differences';

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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
        usda_fdc_id, nutrition_source, nutrition_verified_at
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
      const json = await res.json();
      const results: UsdaResult[] = json.results || [];

      if (query) {
        setSearchResults(prev => ({ ...prev, [ingredient.id]: results }));
      } else {
        setUsdaData(prev => ({ ...prev, [ingredient.id]: results[0] || null }));
      }
    } catch {
      if (!query) {
        setUsdaData(prev => ({ ...prev, [ingredient.id]: null }));
      }
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
        sugar_per_100g: usda.sugar_per_100g,
        cholesterol_per_100g: usda.cholesterol_per_100g,
        saturated_fat_per_100g: usda.saturated_fat_per_100g,
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
              sugar_per_100g: usda.sugar_per_100g,
              cholesterol_per_100g: usda.cholesterol_per_100g,
              saturated_fat_per_100g: usda.saturated_fat_per_100g,
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

  async function recalculateRecipes() {
    setRecalcRunning(true);
    setRecalcDone(false);

    const { data: recipes } = await supabase.from('base_recipes').select('id');
    if (!recipes) {
      setRecalcRunning(false);
      return;
    }

    for (const recipe of recipes) {
      const { data: ing } = await supabase
        .from('recipe_ingredients')
        .select('id, quantity')
        .eq('recipe_id', recipe.id)
        .limit(1)
        .single();

      if (ing) {
        await supabase
          .from('recipe_ingredients')
          .update({ quantity: ing.quantity })
          .eq('id', ing.id);
      }

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setRecalcRunning(false);
    setRecalcDone(true);
    showToast(`Преизчислени ${recipes.length} рецепти`, 'success');
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
    const usda = usdaData[ingredient.id];
    const isVerified = ingredient.nutrition_source === 'usda';
    const needsReview = ingredient.nutrition_source === 'manual_review_needed';
    const isSweetenerItem = isSweetener(ingredient.name_en || '', ingredient.name_bg || '');

    function toggle() {
      if (isExpanded) {
        setExpandedId(null);
      } else {
        setExpandedId(ingredient.id);
        if (!usdaData[ingredient.id] && !loadingUsda[ingredient.id]) {
          fetchUsda(ingredient);
        }
      }
    }

    return (
      <div className={`border rounded-lg overflow-hidden mb-3 ${
        isVerified ? 'border-green-200 bg-green-50' :
        needsReview ? 'border-amber-200 bg-amber-50' :
        'border-gray-200 bg-white'
      }`}>
        {/* Header row */}
        <button
          onClick={toggle}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-black/5 transition-colors"
        >
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
              <div className="text-xs text-gray-500">{ingredient.name_en}</div>
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

        {/* Expanded details */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            {loadingUsda[ingredient.id] && (
              <div className="py-4 text-center text-gray-500 text-sm">
                <RefreshCw className="inline w-4 h-4 animate-spin mr-2" />
                Търсене в USDA...
              </div>
            )}

            {!loadingUsda[ingredient.id] && (
              <>
                {/* Comparison table */}
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
                        ['Калории (kcal)', ingredient.calories_per_100g, usda?.calories_per_100g, 0],
                        ['Протеин (g)', ingredient.protein_per_100g, usda?.protein_per_100g],
                        ['Мазнини (g)', ingredient.fat_per_100g, usda?.fat_per_100g],
                        ['Въглехидрати (g)', ingredient.carbs_per_100g, usda?.carbs_per_100g],
                        ['Фибри (g)', ingredient.fiber_per_100g, usda?.fiber_per_100g],
                        ['Net Carbs (g)',
                          ingredient.carbs_per_100g !== null && ingredient.fiber_per_100g !== null
                            ? Math.round(((ingredient.carbs_per_100g || 0) - (ingredient.fiber_per_100g || 0)) * 10) / 10
                            : null,
                          usda?.net_carbs_per_100g],
                      ] as [string, number | null, number | null | undefined, number?][]).map(([label, cur, usdaVal]) => {
                        const pct = diffPct(cur ?? null, usdaVal ?? null);
                        return (
                          <tr key={label} className="border-b border-gray-50">
                            <td className="py-1.5 pr-4 text-gray-700">{label}</td>
                            <td className="text-right py-1.5 pr-4 text-gray-600">{fmt(cur ?? null)}</td>
                            <td className="text-right py-1.5 pr-4 font-medium">{fmt(usdaVal ?? null)}</td>
                            <td className={`text-right py-1.5 ${diffColor(pct)}`}>
                              {fmtDiff(cur ?? null, usdaVal ?? null)}
                              {diffIcon(pct)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* New nutrients from USDA */}
                {usda && (
                  <div className="mt-2 text-xs text-gray-500 bg-blue-50 rounded p-2">
                    <span className="font-medium text-blue-700">Нови нутриенти от USDA: </span>
                    Sodium: {fmt(usda.sodium_per_100g)}mg · Ca: {fmt(usda.calcium_per_100g)}mg ·
                    Fe: {fmt(usda.iron_per_100g)}mg · Mg: {fmt(usda.magnesium_per_100g)}mg ·
                    K: {fmt(usda.potassium_per_100g)}mg · Захари: {fmt(usda.sugar_per_100g)}g ·
                    Холестерол: {fmt(usda.cholesterol_per_100g)}mg · Sat.Fat: {fmt(usda.saturated_fat_per_100g)}g
                  </div>
                )}

                {usda && (
                  <div className="mt-1 text-xs text-gray-400">
                    USDA: &ldquo;{usda.description}&rdquo; ({usda.dataType}, FDC ID: {usda.fdcId})
                  </div>
                )}

                {!usda && !loadingUsda[ingredient.id] && (
                  <div className="mt-3 text-sm text-amber-600 bg-amber-50 rounded p-2">
                    USDA не намери съвпадение по &ldquo;{ingredient.name_en}&rdquo;. Опитай ръчно търсене.
                  </div>
                )}

                {/* Manual search */}
                <div className="mt-3">
                  <button
                    onClick={() => setSearchOpen(prev => ({ ...prev, [ingredient.id]: !prev[ingredient.id] }))}
                    className="text-sm text-[#A80048] hover:underline flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Търси друг USDA match
                  </button>

                  {searchOpen[ingredient.id] && (
                    <div className="mt-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#A80048]"
                          placeholder="Търси в USDA..."
                          value={searchQuery[ingredient.id] || ingredient.name_en || ''}
                          onChange={e => setSearchQuery(prev => ({ ...prev, [ingredient.id]: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === 'Enter') fetchUsda(ingredient, searchQuery[ingredient.id]);
                          }}
                        />
                        <button
                          onClick={() => fetchUsda(ingredient, searchQuery[ingredient.id])}
                          className="bg-[#A80048] text-white px-3 py-1.5 rounded text-sm hover:bg-[#8a003c] transition-colors"
                        >
                          Търси
                        </button>
                      </div>

                      {searchResults[ingredient.id]?.map(r => (
                        <div
                          key={r.fdcId}
                          className="mt-1.5 p-2 border rounded cursor-pointer hover:bg-gray-50 text-sm"
                          onClick={() => {
                            setUsdaData(prev => ({ ...prev, [ingredient.id]: r }));
                            setSearchOpen(prev => ({ ...prev, [ingredient.id]: false }));
                          }}
                        >
                          <div className="font-medium">{r.description}</div>
                          <div className="text-xs text-gray-500">
                            {r.dataType} · {r.calories_per_100g} kcal · P {r.protein_per_100g}g · F {r.fat_per_100g}g · C {r.carbs_per_100g}g
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    disabled={!usda || saving[ingredient.id]}
                    onClick={() => acceptUsda(ingredient)}
                    className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 disabled:opacity-40 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {saving[ingredient.id] ? 'Записва...' : 'Приеми USDA'}
                  </button>
                  <button
                    disabled={saving[ingredient.id]}
                    onClick={() => keepCurrent(ingredient)}
                    className="flex items-center gap-1.5 bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Запази текущо
                  </button>
                </div>
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
        <h1 className="text-2xl font-bold text-gray-900">🔬 USDA Nutrition Import</h1>
        <p className="text-gray-500 mt-1">Верифициране на нутриенти от USDA FoodData Central</p>
      </div>

      {/* Progress bar */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Прогрес: <strong>{verifiedCount}</strong> / {ingredients.length} верифицирани
          </span>
          <button
            onClick={runBatchImport}
            disabled={batchRunning}
            className="flex items-center gap-1.5 bg-[#A80048] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#8a003c] disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${batchRunning ? 'animate-spin' : ''}`} />
            {batchRunning ? `Обработва... ${batchProgress}/${batchTotal}` : 'Batch Import All'}
          </button>
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

      {/* Recalculate recipes button */}
      <div className="bg-white border rounded-lg p-4 mb-4 flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">Преизчисли нутриенти на рецепти</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Trigger-ва обновяване на total_net_carbs за всички base_recipes
          </div>
        </div>
        <button
          onClick={recalculateRecipes}
          disabled={recalcRunning}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${recalcRunning ? 'animate-spin' : ''}`} />
          {recalcRunning ? 'Преизчислява...' : recalcDone ? '✅ Готово' : 'Преизчисли рецепти'}
        </button>
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
