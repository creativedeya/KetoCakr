# Fix: Base Recipe Edit — Save Ingredients Button + RLS Fix

**File:** `admin/app/dashboard/base-recipes/[id]/page.tsx`  
**Time:** 20 min

---

## Problem

1. No "Save" button directly after ingredients section
2. `handleSubmit` saves ingredients via direct Supabase client (anon key) → RLS may block silently

---

## Fix 1 — Add isSavingIngredients state

Find:
```typescript
  const [isDuplicating, setIsDuplicating] = useState(false);
```

Add after:
```typescript
  const [isSavingIngredients, setIsSavingIngredients] = useState(false);
```

---

## Fix 2 — Add saveIngredients function

Add after `handleDuplicate` function:

```typescript
  async function saveIngredients() {
    setIsSavingIngredients(true);
    try {
      const validIngredients = ingredients.filter(ing => ing.ingredient_name?.trim());
      
      const res = await fetch(`/api/base-recipes/${id}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: validIngredients.map((ing, idx) => ({
            ingredient_database_id: ing.ingredient_id || null,
            ingredient_name: ing.ingredient_name.trim(),
            quantity: ing.quantity || 0,
            unit: ing.unit || 'g',
            order_index: idx,
          })),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      alert('✅ Съставките са запазени!');
      await loadRecipe();
    } catch (err: any) {
      alert('❌ Грешка: ' + err.message);
    } finally {
      setIsSavingIngredients(false);
    }
  }
```

---

## Fix 3 — Add Save button after ingredients list

Find the closing of the Ingredients section — the `</div>` that closes the ingredients `bg-white rounded-lg border p-6` section. It ends with:

```typescript
            </div>
          </div>

          {/* Description */}
```

Add a save button just before `{/* Description */}`:

```typescript
            {/* Save Ingredients Button */}
            <div className="flex justify-end mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={saveIngredients}
                disabled={isSavingIngredients}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 text-white rounded-lg font-medium text-sm transition"
              >
                {isSavingIngredients ? '⟳ Запазване...' : '💾 Запази Съставките'}
              </button>
            </div>
```

---

## Fix 4 — Create API route for ingredients save

**File:** `admin/app/api/base-recipes/[id]/ingredients/route.ts` (create new)

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { ingredients } = await req.json();
    const recipeId = params.id;

    // Delete existing
    const { error: deleteError } = await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', recipeId);

    if (deleteError) throw deleteError;

    // Insert new
    if (ingredients && ingredients.length > 0) {
      const { error: insertError } = await supabase
        .from('recipe_ingredients')
        .insert(
          ingredients.map((ing: any) => ({
            recipe_id: recipeId,
            ingredient_database_id: ing.ingredient_database_id || null,
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity || 0,
            unit: ing.unit || 'g',
            order_index: ing.order_index,
          }))
        );
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## Rules
- API route uses SERVICE_ROLE_KEY — bypasses RLS
- Button is type="button" — does NOT submit the form
- After save: reloads recipe to show updated data

---

## Verification
1. Admin → base recipe edit → change "Цели яйца" to "Яйчни белтъци"
2. Click "💾 Запази Съставките"
3. Check DB:
```sql
SELECT ingredient_name, quantity, unit 
FROM recipe_ingredients 
WHERE recipe_id = '[id]'
ORDER BY order_index;
```
4. Shows updated ingredients
