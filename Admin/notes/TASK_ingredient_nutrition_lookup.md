# TASK: Single-Ingredient Nutrition Lookup in Ingredients CRUD Form

**File:** `C:\Dev\KetoCakR\Admin\app\dashboard\ingredients\page.tsx`

## Goal
Add a nutrition database lookup (USDA / FatSecret / Open Food Facts) directly inside the add/edit ingredient form. The user searches, picks a source and a specific result, and the form's nutrition fields are auto-filled. Reuses the existing API routes already used by the batch USDA-import page:
- `/api/usda-search?query=...`
- `/api/fatsecret-search?query=...` and `/api/fatsecret-search?food_id=...`
- `/api/openfoodfacts-search?query=...`

**Hard rules:**
- Do NOT remove or change any existing functionality (CSV import, duplicates merge, usage linking, image upload all stay intact).
- Surgical `str_replace` edits only — no full file rewrite.
- Verify each anchor exists exactly once before editing.

---

## EDIT 1 — Add lookup types (after `IngredientWithCount` interface)

**Anchor (old_str):**
```ts
interface IngredientWithCount extends Ingredient {
  recipeCount: number;
}
```

**Append after it:**
```ts
type LookupSource = 'usda' | 'fatsecret' | 'openfoodfacts';

interface LookupNutrients {
  calories: number | null; protein: number | null; fat: number | null;
  carbs: number | null; fiber: number | null; sugar: number | null;
  sugarAlcohol: number | null; saturatedFat: number | null; cholesterol: number | null;
  sodium: number | null; calcium: number | null; iron: number | null;
  magnesium: number | null; potassium: number | null; zinc: number | null;
  vitaminA: number | null; vitaminC: number | null; vitaminD: number | null;
}

interface LookupResult {
  id: string;
  label: string;
  sublabel: string;
  nutrients: LookupNutrients | null; // null for FatSecret search items (need detail fetch)
  usdaFdcId?: number;
  fatsecretFoodId?: string;
}
```

---

## EDIT 2 — Add lookup state (after the link-ingredient state)

**Anchor (old_str):**
```ts
  const [linkingUsageId, setLinkingUsageId] = useState<number | null>(null);
  const [linkSearch, setLinkSearch] = useState('');
```

**Append after it:**
```ts
  // Nutrition lookup (single ingredient, in-form)
  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupSource, setLookupSource] = useState<LookupSource>('usda');
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResults, setLookupResults] = useState<LookupResult[]>([]);
```

---

## EDIT 3 — Add lookup functions (before image upload functions)

**Anchor (old_str):**
```ts
  // ─── Existing Image Upload Functions ─────────────────────────
```

**Insert before it:**
```ts
  // ─── Nutrition Lookup (single ingredient) ─────────────────────
  async function lookupNutrition() {
    const q = (lookupQuery.trim() || formData.name_en.trim());
    if (!q) { alert('Въведете име (EN) или заявка за търсене'); return; }
    setLookupLoading(true);
    setLookupResults([]);
    try {
      if (lookupSource === 'usda') {
        const res = await fetch(`/api/usda-search?query=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error(`USDA API error: ${res.status}`);
        const json = await res.json();
        setLookupResults((json.results || []).map((r: any) => ({
          id: String(r.fdcId),
          label: r.description,
          sublabel: `${r.dataType} · ${r.calories_per_100g ?? '—'} kcal · C ${r.carbs_per_100g ?? '—'}g`,
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
        })));
      } else if (lookupSource === 'fatsecret') {
        const res = await fetch(`/api/fatsecret-search?query=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error(`FatSecret API error: ${res.status}`);
        const json = await res.json();
        setLookupResults((json.results || []).map((r: any) => ({
          id: r.id,
          label: r.name,
          sublabel: r.brand ? `🏷 ${r.brand}` : (r.description || r.type || ''),
          nutrients: null,
          fatsecretFoodId: r.id,
        })));
      } else {
        const res = await fetch(`/api/openfoodfacts-search?query=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error(`OFF API error: ${res.status}`);
        const json = await res.json();
        setLookupResults((json.results || []).map((r: any, i: number) => ({
          id: `off-${i}`,
          label: r.name,
          sublabel: `${r.brand ? r.brand + ' · ' : ''}${r.nutrients?.calories ?? '—'} kcal · ${r.confidence}% conf.`,
          nutrients: r.nutrients,
        })));
      }
    } catch (e: any) {
      alert('Грешка при търсене: ' + (e?.message || e));
    }
    setLookupLoading(false);
  }

  async function applyLookupResult(result: LookupResult) {
    let nutrients = result.nutrients;
    // FatSecret: search items have no nutrients — fetch detail by food_id
    if (!nutrients && result.fatsecretFoodId) {
      setLookupLoading(true);
      try {
        const res = await fetch(`/api/fatsecret-search?food_id=${encodeURIComponent(result.fatsecretFoodId)}`);
        const json = await res.json();
        if (!json.id) throw new Error('No detail returned');
        nutrients = json.nutrients;
      } catch {
        alert('Не може да се зареди детайл от FatSecret');
        setLookupLoading(false);
        return;
      }
      setLookupLoading(false);
    }
    if (!nutrients) return;

    const s = (v: number | null | undefined) => (v != null ? String(v) : '');
    setFormData(prev => ({
      ...prev,
      calories_per_100g: nutrients!.calories ?? 0,
      protein_per_100g: nutrients!.protein ?? 0,
      fat_per_100g: nutrients!.fat ?? 0,
      carbs_per_100g: nutrients!.carbs ?? 0,
      fiber_per_100g: nutrients!.fiber ?? 0,
      sugar_per_100g: s(nutrients!.sugar),
      sugar_alcohol_per_100g: s(nutrients!.sugarAlcohol),
      saturated_fat_per_100g: s(nutrients!.saturatedFat),
      cholesterol_per_100g: s(nutrients!.cholesterol),
      sodium_per_100g: s(nutrients!.sodium),
      calcium_per_100g: s(nutrients!.calcium),
      iron_per_100g: s(nutrients!.iron),
      magnesium_per_100g: s(nutrients!.magnesium),
      potassium_per_100g: s(nutrients!.potassium),
      zinc_per_100g: s(nutrients!.zinc),
      vitamin_a_per_100g: s(nutrients!.vitaminA),
      vitamin_c_per_100g: s(nutrients!.vitaminC),
      vitamin_d_per_100g: s(nutrients!.vitaminD),
      usda_fdc_id: result.usdaFdcId ? String(result.usdaFdcId) : prev.usda_fdc_id,
      nutrition_source: lookupSource,
      nutrition_verified: true,
    }));
    setLookupResults([]);
    setLookupOpen(false);
  }
```

---

## EDIT 4 — Add lookup UI panel in the form

Place it between the sugar-alcohol checkbox and the "Детайлни нутриенти" box.

**Anchor (old_str):**
```tsx
                  {/* ── Детайлни нутриенти ── */}
```

**Insert before it:**
```tsx
                  {/* ── Nutrition Lookup ── */}
                  <div className="border border-purple-200 rounded-lg p-3 bg-purple-50/50 space-y-2">
                    <button
                      type="button"
                      onClick={() => { setLookupOpen(!lookupOpen); if (!lookupOpen) { setLookupQuery(formData.name_en); setLookupResults([]); } }}
                      className="text-sm font-semibold text-[#A80048] hover:underline"
                    >
                      🔍 {lookupOpen ? 'Скрий търсенето на нутриенти' : 'Попълни нутриенти от база данни'}
                    </button>

                    {lookupOpen && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {(['usda', 'fatsecret', 'openfoodfacts'] as LookupSource[]).map(src => (
                            <button
                              key={src}
                              type="button"
                              onClick={() => { setLookupSource(src); setLookupResults([]); }}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                lookupSource === src ? 'bg-[#A80048] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {src === 'usda' ? '🔬 USDA' : src === 'fatsecret' ? '🧬 FatSecret' : '🌍 Open Food Facts'}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={lookupQuery}
                            onChange={(e) => setLookupQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); lookupNutrition(); } }}
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#A80048]"
                            placeholder="Търсене (EN)..."
                          />
                          <button
                            type="button"
                            onClick={lookupNutrition}
                            disabled={lookupLoading}
                            className="bg-[#A80048] text-white px-3 py-1.5 rounded text-sm hover:bg-[#8a003c] disabled:opacity-50"
                          >
                            {lookupLoading ? '...' : 'Търси'}
                          </button>
                        </div>

                        {lookupResults.length > 0 && (
                          <div className="max-h-56 overflow-y-auto space-y-1">
                            {lookupResults.map(r => (
                              <div
                                key={r.id}
                                onClick={() => applyLookupResult(r)}
                                className="p-2 border border-gray-200 rounded bg-white cursor-pointer hover:bg-purple-50 text-sm"
                              >
                                <div className="font-medium text-gray-900">{r.label}</div>
                                <div className="text-xs text-gray-500">{r.sublabel}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!lookupLoading && lookupResults.length === 0 && (
                          <p className="text-xs text-gray-500">Избери източник, търси и кликни върху резултат — нутриентите ще се попълнят във формата.</p>
                        )}
                      </div>
                    )}
                  </div>

```

---

## EDIT 5 — Persist `usda_fdc_id` on save (currently missing from dataToSave)

**Anchor (old_str):**
```ts
      nutrition_source: formData.nutrition_source || 'manual',
      nutrition_verified: formData.nutrition_verified as boolean,
```

**Replace with:**
```ts
      usda_fdc_id: formData.usda_fdc_id ? parseInt(formData.usda_fdc_id as string) : null,
      nutrition_source: formData.nutrition_source || 'manual',
      nutrition_verified: formData.nutrition_verified as boolean,
```

> Note: verify the `ingredients_database` table accepts `usda_fdc_id` from the anon/client path. If RLS blocks it, skip EDIT 5 and leave the field display-only (it is already filled by the batch import via service role).

---

## Testing Checklist
- [ ] Form opens, lookup panel toggles, source pills switch
- [ ] USDA search → click result → macros + extended fields + FDC ID + source='usda' filled
- [ ] FatSecret search → click result triggers detail fetch → fields filled, source='fatsecret'
- [ ] OFF search → click result → fields filled, source='openfoodfacts'
- [ ] Manual edit of any filled field still works; save creates/updates correctly
- [ ] Existing flows untouched: CSV import, duplicates merge, usage linking, image upload
