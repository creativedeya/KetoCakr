# Fix: Base Recipes List — Add Delete Button

**File:** `admin/app/dashboard/base-recipes/page.tsx`  
**Time:** 10 min

---

## Step 1 — Add deleting state

Find:
```typescript
  const [duplicating, setDuplicating] = useState<string | null>(null);
```

Add after:
```typescript
  const [deleting, setDeleting] = useState<string | null>(null);
```

---

## Step 2 — Add handleDeleteRecipe function

Add after `handleDuplicateRecipe` function:

```typescript
  async function handleDeleteRecipe(recipeId: string, recipeName: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Изтрий "${recipeName}"?\n\nТова ще изтрие и всички стъпки и съставки на рецептата. Действието е необратимо!`)) return;
    setDeleting(recipeId);
    try {
      const res = await fetch(`/api/base-recipes/${recipeId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed');
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
    } catch (err: any) {
      alert('❌ Грешка при изтриване: ' + err.message);
    } finally {
      setDeleting(null);
    }
  }
```

---

## Step 3 — Add Delete button next to Копирай

Find the buttons div at the bottom of each recipe card:
```typescript
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={(e) => handleDuplicateRecipe(recipe.id, e)}
                        disabled={duplicating === recipe.id}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 transition"
                        title="Duplicate recipe"
                      >
                        {duplicating === recipe.id ? '⟳ Копиране...' : '⎘ Копирай'}
                      </button>
                    </div>
```

Replace with:
```typescript
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={(e) => handleDuplicateRecipe(recipe.id, e)}
                        disabled={duplicating === recipe.id}
                        className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 transition"
                        title="Duplicate recipe"
                      >
                        {duplicating === recipe.id ? '⟳ Копиране...' : '⎘ Копирай'}
                      </button>
                      <button
                        onClick={(e) => handleDeleteRecipe(recipe.id, recipe.name, e)}
                        disabled={deleting === recipe.id}
                        className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50 transition"
                        title="Delete recipe"
                      >
                        {deleting === recipe.id ? '⟳ Изтриване...' : '🗑 Изтрий'}
                      </button>
                    </div>
```

---

## Step 4 — Create API route for delete

**File:** `admin/app/api/base-recipes/[id]/route.ts` (create if not exists, or add DELETE handler)

Check if file exists:
```bash
Get-ChildItem -Path "C:\Dev\KetoCakR\admin\app\api\base-recipes" -Recurse -Filter "route.ts"
```

If file exists — add DELETE handler to it.
If not — create new file:

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete related data first (no FK cascades)
    await supabase.from('recipe_instruction_steps').delete().eq('recipe_id', id);
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
    await supabase.from('recipe_equipment').delete().eq('recipe_id', id);

    // Delete the recipe
    const { error } = await supabase
      .from('base_recipes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## Rules
- `e.stopPropagation()` — prevents card click navigation when deleting
- Confirm dialog with recipe name before delete
- Removes from local state immediately after success (no reload needed)
- API uses SERVICE_ROLE_KEY — bypasses RLS

---

## Verification
1. Admin → Base Recipes list
2. Each card shows "⎘ Копирай" + "🗑 Изтрий" buttons
3. Click Изтрий → confirm dialog with recipe name
4. Confirm → recipe disappears from list
5. Check DB → record deleted
