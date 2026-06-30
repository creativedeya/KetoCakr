# Task: Bulk Parse за съставки в SimpleRecipeForm

## Overview
Add a toggle in the Ingredients tab of SimpleRecipeForm (and simple-recipes/[id]/page.tsx)
that lets the user paste raw ingredient text and have Claude parse it into
structured ingredient rows, matched against ingredients_database.

Same pattern as the existing Bulk Parse for steps.

---

## STEP 1: New API route

### Create file
`Admin/app/api/simple-recipes/parse-ingredients/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text?.trim()) {
      return NextResponse.json({ success: false, error: 'No text provided' }, { status: 400 });
    }

    // Step 1: Parse text into structured list with Claude
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Parse this ingredient list into structured JSON.
Input text:
${text}

Respond ONLY with a JSON array, no markdown, no explanation:
[
  {
    "ingredient_name": "Бадемово брашно",
    "ingredient_name_en": "Almond flour",
    "quantity": 100,
    "unit": "g"
  }
]

Rules:
- ingredient_name: Bulgarian name (translate if needed)
- ingredient_name_en: English name (translate if needed)  
- quantity: numeric value only
- unit: normalize to one of: g, г, ml, мл, бр, tsp, ч.л., tbsp, с.л., cup, kg, l
- If unit is unclear, default to "g"
- If quantity is unclear, default to 100
- Split combined entries into separate items`
      }],
    });

    const raw = (message.content[0] as any).text.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) throw new Error('Response is not an array');

    // Step 2: Try to match each ingredient against ingredients_database
    const results = await Promise.all(parsed.map(async (item: any) => {
      // Search by Bulgarian name first, then English
      const { data: matches } = await supabase
        .from('ingredients_database')
        .select('id, name, name_en, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, is_sugar_alcohol, default_piece_weight_grams')
        .or(`name.ilike.%${item.ingredient_name}%,name_en.ilike.%${item.ingredient_name_en || item.ingredient_name}%`)
        .limit(1);

      const match = matches?.[0] || null;

      return {
        ingredient_name: match?.name || item.ingredient_name,
        ingredient_name_en: match?.name_en || item.ingredient_name_en || '',
        ingredient_database_id: match?.id || null,
        quantity: item.quantity,
        unit: item.unit,
        matched: !!match,
        _calories: match?.calories_per_100g || null,
        _protein: match?.protein_per_100g || null,
        _fat: match?.fat_per_100g || null,
        _carbs: match?.carbs_per_100g || null,
        _fiber: match?.fiber_per_100g || null,
        _is_sugar_alcohol: match?.is_sugar_alcohol || false,
        _piece_weight: match?.default_piece_weight_grams || null,
      };
    }));

    return NextResponse.json({ success: true, ingredients: results });
  } catch (err: any) {
    console.error('parse-ingredients error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
```

---

## STEP 2: Update SimpleRecipeForm.tsx — Ingredients tab

### File
`Admin/components/simple-recipes/SimpleRecipeForm.tsx`

### Change 1: Add state for bulk mode

Find existing state declarations near `ingredientSearch`. Add after:
```typescript
  const [ingredientSearch, setIngredientSearch] = useState('');
```
Add:
```typescript
  const [ingredientsMode, setIngredientsMode] = useState<'manual' | 'bulk'>('manual');
  const [bulkIngText, setBulkIngText] = useState('');
  const [bulkIngParsing, setBulkIngParsing] = useState(false);

  const parseBulkIngredients = async () => {
    if (!bulkIngText.trim()) return;
    setBulkIngParsing(true);
    try {
      const res = await fetch('/api/simple-recipes/parse-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bulkIngText }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setIngredients(data.ingredients.map((ing: any) => ({
        ingredient_database_id: ing.ingredient_database_id || null,
        ingredient_name: ing.ingredient_name,
        quantity: ing.quantity,
        unit: ing.unit,
        _calories: ing._calories,
        _protein: ing._protein,
        _fat: ing._fat,
        _carbs: ing._carbs,
        _fiber: ing._fiber,
        _is_sugar_alcohol: ing._is_sugar_alcohol || false,
        _piece_weight: ing._piece_weight || null,
      })));
      setBulkIngText('');
      setIngredientsMode('manual');
    } catch (err: any) {
      setMsg({ type: 'error', text: `Parse error: ${err.message}` });
    } finally {
      setBulkIngParsing(false);
    }
  };
```

### Change 2: Replace the Ingredients tab content

Find the start of the ingredients tab:
```tsx
        {tab === 'ingredients' && (
          <div className="space-y-4">
            {/* Nutrition summary */}
```

Replace the entire ingredients tab with:
```tsx
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

            {/* Mode toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIngredientsMode('manual')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  ingredientsMode === 'manual'
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ✍️ Ръчно въвеждане
              </button>
              <button
                type="button"
                onClick={() => setIngredientsMode('bulk')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  ingredientsMode === 'bulk'
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📋 Bulk Parse
              </button>
              {ingredients.length > 0 && (
                <span className="text-xs text-gray-400 ml-2">{ingredients.length} съставки</span>
              )}
            </div>

            {/* Bulk parse mode */}
            {ingredientsMode === 'bulk' && (
              <div className="border-2 border-dashed border-rose-300 rounded-xl p-4 space-y-3 bg-rose-50">
                <p className="text-sm text-rose-700 font-medium">
                  📋 Постави текст със съставки — AI ще ги раздели и свърже с базата
                </p>
                <p className="text-xs text-gray-500">
                  Може да е списък с тиренца, номерация или свободен текст.
                  Съществуващите съставки ще бъдат <strong>заменени</strong>.
                </p>
                <textarea
                  className="w-full px-3 py-2 border border-rose-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  rows={8}
                  value={bulkIngText}
                  onChange={e => setBulkIngText(e.target.value)}
                  placeholder={"- 3 яйца\n- 100г бадемово брашно\n- 70г еритритол\n- 50мл зехтин\n- 1 ч.л. бакпулвер"}
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={parseBulkIngredients}
                    disabled={bulkIngParsing || !bulkIngText.trim()}
                    className="px-5 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {bulkIngParsing ? <>⏳ Parsing...</> : <>✨ Parse Съставки</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBulkIngText(''); setIngredientsMode('manual'); }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition"
                  >
                    Откажи
                  </button>
                </div>
              </div>
            )}

            {/* Manual mode */}
            {ingredientsMode === 'manual' && (
              <>
                <div>
                  <label className={lbl}>Add Ingredient</label>
                  <IngredientAutocomplete
                    value={ingredientSearch}
                    onChange={setIngredientSearch}
                    onSelect={addIngredient}
                    placeholder="Търси съставка..."
                  />
                </div>

                {ingredients.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">Няма добавени съставки.</p>
                ) : (
                  <div className="space-y-2">
                    {ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <span className={`flex-1 text-sm font-medium truncate ${
                          ing.ingredient_database_id ? 'text-gray-700' : 'text-amber-600'
                        }`}>
                          {ing.ingredient_name}
                          {!ing.ingredient_database_id && (
                            <span className="ml-1 text-xs">⚠️ не е свързана</span>
                          )}
                        </span>
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
              </>
            )}
          </div>
        )}
```

---

## Verify after implementation

1. Open any simple recipe → Ingredients tab
2. Click "📋 Bulk Parse"
3. Paste: `- 3 яйца\n- 100г бадемово брашно\n- 70г еритритол`
4. Click "✨ Parse Съставки"
5. Expected: ingredients appear in the list, matched ones show normal text, unmatched show ⚠️
6. Switch back to manual mode — can still add/edit individually
7. Unmatched ingredients can be linked via IngredientAutocomplete
