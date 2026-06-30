# TASK: OFF 503 Hardening + "Compare All 3 Sources" Mode in Ingredient Form Lookup

**Files:**
1. `C:\Dev\KetoCakR\Admin\app\api\openfoodfacts-search\route.ts` (verify exact path before editing)
2. `C:\Dev\KetoCakR\Admin\app\dashboard\ingredients\page.tsx`

## Context
The in-form nutrition lookup (previous task) is live. Two issues:
1. OFF API route returns 503 — Open Food Facts throttles/blocks requests without a proper `User-Agent` and is sometimes overloaded. Add UA header + retry on 5xx, and friendly client error.
2. New feature: a **"Compare" mode** that fetches the top result from all 3 sources in parallel and lets the user choose which source's data to load into the form (per-source "Use" button + optional merged apply).

**Hard rules:** surgical `str_replace` only; verify each anchor exists exactly once (previous task's code is the anchor base — adapt if Claude Code modified it); do not remove existing functionality.

---

## PART 1 — API route hardening (`openfoodfacts-search/route.ts`)

Open the route file and apply:

**1a.** Add a retry helper near the top of the file:
```ts
async function fetchWithRetry(url: string, init: RequestInit, retries = 2): Promise<Response> {
  let lastRes: Response | null = null;
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, init);
    if (res.ok) return res;
    lastRes = res;
    if (res.status < 500) return res; // don't retry 4xx
    await new Promise(r => setTimeout(r, 600 * (i + 1)));
  }
  return lastRes!;
}
```

**1b.** Replace the outgoing `fetch(...)` call to the OFF API with `fetchWithRetry(...)` and add headers (OFF requires an identifying User-Agent — missing UA is a common cause of 503):
```ts
headers: {
  'User-Agent': 'KetoCakR-Admin/1.0 (https://ketocakelab.com; contact@ketocakelab.com)',
  'Accept': 'application/json',
},
```

**1c.** On final failure return clean JSON instead of leaking HTML:
```ts
return NextResponse.json(
  { results: [], error: `OFF unavailable (${res.status})` },
  { status: 503 }
);
```
Adapt names to the actual route code; keep its existing parsing/mapping logic untouched.

---

## PART 2 — Ingredients page (`dashboard/ingredients/page.tsx`)

### EDIT 1 — Extend types

**Anchor (old_str):**
```ts
type LookupSource = 'usda' | 'fatsecret' | 'openfoodfacts';
```

**Replace with:**
```ts
type LookupSource = 'usda' | 'fatsecret' | 'openfoodfacts';
type LookupMode = LookupSource | 'compare';

interface CompareEntry {
  result: LookupResult | null;
  error: string | null;
}
```

### EDIT 2 — Extend state

**Anchor (old_str):**
```ts
  const [lookupSource, setLookupSource] = useState<LookupSource>('usda');
```

**Replace with:**
```ts
  const [lookupSource, setLookupSource] = useState<LookupMode>('usda');
  const [compareData, setCompareData] = useState<Record<LookupSource, CompareEntry> | null>(null);
```

### EDIT 3 — Friendly 5xx error in `lookupNutrition`

**Anchor (old_str):**
```ts
    } catch (e: any) {
      alert('Грешка при търсене: ' + (e?.message || e));
    }
    setLookupLoading(false);
  }
```

**Replace with:**
```ts
    } catch (e: any) {
      const msg = String(e?.message || e);
      alert(/50[234]/.test(msg)
        ? 'Източникът е временно недостъпен (сървърна грешка 50x). Опитай отново след малко или избери друг източник.'
        : 'Грешка при търсене: ' + msg);
    }
    setLookupLoading(false);
  }
```

### EDIT 4 — `applyLookupResult` accepts source override (needed for compare mode)

**Anchor (old_str):**
```ts
  async function applyLookupResult(result: LookupResult) {
```

**Replace with:**
```ts
  async function applyLookupResult(result: LookupResult, sourceOverride?: LookupSource) {
```

**Anchor (old_str):**
```ts
      nutrition_source: lookupSource,
      nutrition_verified: true,
    }));
```

**Replace with:**
```ts
      nutrition_source: sourceOverride ?? (lookupSource as LookupSource),
      nutrition_verified: true,
    }));
```

### EDIT 5 — Add `lookupCompare()` (insert before the image upload section)

**Anchor (old_str):**
```ts
  // ─── Existing Image Upload Functions ─────────────────────────
```

**Insert before it:**
```ts
  // ─── Compare all 3 sources (top result each, in parallel) ─────
  function mapUsdaToLookup(r: any): LookupResult {
    return {
      id: String(r.fdcId),
      label: r.description,
      sublabel: r.dataType,
      usdaFdcId: r.fdcId,
      nutrients: {
        calories: r.calories_per_100g, protein: r.protein_per_100g, fat: r.fat_per_100g,
        carbs: r.carbs_per_100g, fiber: r.fiber_per_100g, sugar: r.sugar_per_100g,
        sugarAlcohol: null, saturatedFat: r.saturated_fat_per_100g,
        cholesterol: r.cholesterol_per_100g, sodium: r.sodium_per_100g,
        calcium: r.calcium_per_100g, iron: r.iron_per_100g, magnesium: r.magnesium_per_100g,
        potassium: r.potassium_per_100g, zinc: r.zinc_per_100g,
        vitaminA: r.vitamin_a_per_100g, vitaminC: r.vitamin_c_per_100g, vitaminD: r.vitamin_d_per_100g,
      },
    };
  }

  async function lookupCompare() {
    const q = (lookupQuery.trim() || formData.name_en.trim());
    if (!q) { alert('Въведете име (EN) или заявка за търсене'); return; }
    setLookupLoading(true);
    setLookupResults([]);
    setCompareData(null);

    const data: Record<LookupSource, CompareEntry> = {
      usda: { result: null, error: null },
      fatsecret: { result: null, error: null },
      openfoodfacts: { result: null, error: null },
    };

    await Promise.allSettled([
      // USDA — top result
      (async () => {
        try {
          const res = await fetch(`/api/usda-search?query=${encodeURIComponent(q)}`);
          if (!res.ok) throw new Error(String(res.status));
          const json = await res.json();
          const r = (json.results || [])[0];
          if (r) data.usda.result = mapUsdaToLookup(r);
        } catch (e: any) { data.usda.error = String(e?.message || e); }
      })(),
      // FatSecret — top search item + detail fetch
      (async () => {
        try {
          const res = await fetch(`/api/fatsecret-search?query=${encodeURIComponent(q)}`);
          if (!res.ok) throw new Error(String(res.status));
          const json = await res.json();
          const first = (json.results || [])[0];
          if (first) {
            const dres = await fetch(`/api/fatsecret-search?food_id=${encodeURIComponent(first.id)}`);
            if (!dres.ok) throw new Error(String(dres.status));
            const dj = await dres.json();
            if (dj.id) {
              data.fatsecret.result = {
                id: dj.id,
                label: dj.name,
                sublabel: dj.brand ? `🏷 ${dj.brand}` : '',
                fatsecretFoodId: dj.id,
                nutrients: dj.nutrients,
              };
            }
          }
        } catch (e: any) { data.fatsecret.error = String(e?.message || e); }
      })(),
      // Open Food Facts — top result
      (async () => {
        try {
          const res = await fetch(`/api/openfoodfacts-search?query=${encodeURIComponent(q)}`);
          if (!res.ok) throw new Error(String(res.status));
          const json = await res.json();
          const r = (json.results || [])[0];
          if (r) {
            data.openfoodfacts.result = {
              id: 'off-0',
              label: r.name,
              sublabel: `${r.brand ? r.brand + ' · ' : ''}${r.confidence}% conf.`,
              nutrients: r.nutrients,
            };
          }
        } catch (e: any) { data.openfoodfacts.error = String(e?.message || e); }
      })(),
    ]);

    setCompareData(data);
    setLookupLoading(false);
  }

  // Merge: field-by-field, priority USDA → FatSecret → OFF
  function applyMergedCompare() {
    if (!compareData) return;
    const order: LookupSource[] = ['usda', 'fatsecret', 'openfoodfacts'];
    const sources = order.map(s => compareData[s].result?.nutrients).filter(Boolean) as LookupNutrients[];
    if (sources.length === 0) return;
    const keys = Object.keys(sources[0]) as (keyof LookupNutrients)[];
    const merged = {} as LookupNutrients;
    for (const k of keys) {
      merged[k] = sources.find(n => n[k] != null)?.[k] ?? null;
    }
    const usdaRes = compareData.usda.result;
    applyLookupResult(
      { id: 'merged', label: 'merged', sublabel: '', nutrients: merged, usdaFdcId: usdaRes?.usdaFdcId },
      usdaRes ? 'usda' : (compareData.fatsecret.result ? 'fatsecret' : 'openfoodfacts')
    );
  }

```
> Note: if `nutrition_source` allows arbitrary strings, you may set `'hybrid'` for the merged apply instead (consistent with the batch import page). Check what values the batch page uses (`'hybrid'`) and prefer that — pass it by adjusting `applyLookupResult` only if trivial; otherwise keep the priority-source value.

### EDIT 6 — UI: add Compare pill

**Anchor (old_str):**
```tsx
                          {(['usda', 'fatsecret', 'openfoodfacts'] as LookupSource[]).map(src => (
                            <button
                              key={src}
                              type="button"
                              onClick={() => { setLookupSource(src); setLookupResults([]); }}
```

**Replace with:**
```tsx
                          {(['usda', 'fatsecret', 'openfoodfacts', 'compare'] as LookupMode[]).map(src => (
                            <button
                              key={src}
                              type="button"
                              onClick={() => { setLookupSource(src); setLookupResults([]); setCompareData(null); }}
```

**Anchor (old_str):**
```tsx
                              {src === 'usda' ? '🔬 USDA' : src === 'fatsecret' ? '🧬 FatSecret' : '🌍 Open Food Facts'}
```

**Replace with:**
```tsx
                              {src === 'usda' ? '🔬 USDA' : src === 'fatsecret' ? '🧬 FatSecret' : src === 'openfoodfacts' ? '🌍 Open Food Facts' : '⭐ Сравни 3-те'}
```

### EDIT 7 — UI: search triggers compare in compare mode

**Anchor (old_str):**
```tsx
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); lookupNutrition(); } }}
```

**Replace with:**
```tsx
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); lookupSource === 'compare' ? lookupCompare() : lookupNutrition(); } }}
```

**Anchor (old_str):**
```tsx
                            onClick={lookupNutrition}
```

**Replace with:**
```tsx
                            onClick={() => (lookupSource === 'compare' ? lookupCompare() : lookupNutrition())}
```

### EDIT 8 — UI: compare results panel

**Anchor (old_str):**
```tsx
                        {!lookupLoading && lookupResults.length === 0 && (
```

**Insert before it:**
```tsx
                        {lookupSource === 'compare' && compareData && !lookupLoading && (
                          <div className="space-y-2">
                            {(['usda', 'fatsecret', 'openfoodfacts'] as LookupSource[]).map(src => {
                              const entry = compareData[src];
                              const label = src === 'usda' ? '🔬 USDA' : src === 'fatsecret' ? '🧬 FatSecret' : '🌍 Open Food Facts';
                              const n = entry.result?.nutrients;
                              return (
                                <div key={src} className="p-2 border border-gray-200 rounded bg-white text-sm">
                                  <div className="flex justify-between items-center gap-2">
                                    <span className="font-semibold text-gray-800">{label}</span>
                                    {entry.result && (
                                      <button
                                        type="button"
                                        onClick={() => applyLookupResult(entry.result!, src)}
                                        className="bg-[#A80048] text-white px-2 py-1 rounded text-xs hover:bg-[#8a003c] flex-shrink-0"
                                      >
                                        Използвай
                                      </button>
                                    )}
                                  </div>
                                  {entry.result ? (
                                    <>
                                      <div className="text-xs text-gray-700 mt-1 truncate">{entry.result.label}{entry.result.sublabel ? ` · ${entry.result.sublabel}` : ''}</div>
                                      {n && (
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          {n.calories ?? '—'} kcal · P {n.protein ?? '—'} · F {n.fat ?? '—'} · C {n.carbs ?? '—'} · Фибри {n.fiber ?? '—'}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="text-xs text-amber-600 mt-1">
                                      {entry.error
                                        ? (/50[234]/.test(entry.error) ? 'Временно недостъпен (50x)' : 'Грешка: ' + entry.error)
                                        : 'Няма резултат'}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {Object.values(compareData).filter(e => e.result).length >= 2 && (
                              <button
                                type="button"
                                onClick={applyMergedCompare}
                                className="w-full bg-purple-600 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-700"
                              >
                                ⭐ Обедини (приоритет USDA → FS → OFF)
                              </button>
                            )}
                          </div>
                        )}

                        {!lookupLoading && lookupResults.length === 0 && (
```

### EDIT 9 — Hint text shouldn't show under compare results

**Anchor (old_str):**
```tsx
                        {!lookupLoading && lookupResults.length === 0 && (
                          <p className="text-xs text-gray-500">Избери източник, търси и кликни върху резултат — нутриентите ще се попълнят във формата.</p>
                        )}
```
(this is the SECOND occurrence after EDIT 8 — be careful; do EDIT 9 by adjusting the block kept at the bottom)

**Replace with:**
```tsx
                        {!lookupLoading && lookupResults.length === 0 && !compareData && (
                          <p className="text-xs text-gray-500">Избери източник, търси и кликни върху резултат — нутриентите ще се попълнят във формата.</p>
                        )}
```
> Tip: to keep `old_str` unique, perform EDIT 9 BEFORE EDIT 8.

---

## Testing Checklist
- [ ] OFF route: 503 from OFF now retries (check server logs), returns JSON not HTML; client shows friendly BG message
- [ ] Single-source modes still work (USDA / FatSecret / OFF)
- [ ] "⭐ Сравни 3-те": one search fires all 3 in parallel; failed source shows error card, others still render
- [ ] "Използвай" on each card fills the form with that source's data and correct `nutrition_source`
- [ ] Merged button appears with ≥2 results; fills field-by-field with USDA priority
- [ ] Save persists correctly; no existing functionality removed
