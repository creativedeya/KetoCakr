# Fix: Admin Simple Recipes + Mobile Home Filter

**Scope:** Admin panel (2 fixes) + Mobile Tab1 (1 fix)  
**Time:** ~30 min

---

## FIX 1 — Admin: Show avatar in Simple Recipes list

**File:** `admin/app/dashboard/simple-recipes/page.tsx` (or similar path — check `admin/app/dashboard/`)

Find the recipe list/table/grid where simple recipes are shown.
Find each recipe row/card. It currently shows name, status, etc.

Add avatar before the recipe name:

```typescript
// Before the recipe name text, add:
{recipe.image_url ? (
  <img
    src={recipe.image_url}
    alt={recipe.name}
    style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', marginRight: 12 }}
  />
) : (
  <div style={{
    width: 40, height: 40, borderRadius: 8, marginRight: 12,
    backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20
  }}>
    🍰
  </div>
)}
```

The image comes from `base_recipes.image_url` (simple recipes are stored in base_recipes with `is_simple_recipe = true`).

---

## FIX 2 — Admin: Published status badge shows wrong value

**File:** Same simple recipes list page as Fix 1.

The status badge reads from `ready_recipes.is_published` but simple recipes live in `base_recipes` — there is no `is_published` on `base_recipes`.

**Read the page file carefully first** to understand what field is being used for the Draft/Published badge.

If the badge reads `recipe.is_published` and simple recipes don't have this field:
- Option A: The badge should be removed entirely for simple recipes (they don't have a publish workflow)
- Option B: If `base_recipes` has an `is_published` or `status` column, use that

Check DB: run this query in Supabase SQL Editor to see available columns:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'base_recipes' ORDER BY column_name;
```

**Most likely fix:** Remove the Draft/Published badge from simple recipes list, or show it only if the column actually exists on the record. Do NOT show "Draft" when the field is undefined/null — show nothing instead:

```typescript
// Replace current badge with:
{recipe.is_published !== undefined && recipe.is_published !== null && (
  <span style={{
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    backgroundColor: recipe.is_published ? '#dcfce7' : '#f3f4f6',
    color: recipe.is_published ? '#16a34a' : '#6b7280'
  }}>
    {recipe.is_published ? 'Published' : 'Draft'}
  </span>
)}
```

---

## FIX 3 — Mobile Tab1: Show only published ready_recipes

**File:** `Mobile/app/(tabs)/home/index.tsx`

Find the query that fetches `ready_recipes` for the Home tab grid.

It currently looks like:
```typescript
supabase.from('ready_recipes').select('...')
```

Add `.eq('is_published', true)` filter:

```typescript
supabase
  .from('ready_recipes')
  .select('...')
  .eq('is_published', true)   // ← ADD THIS
  .order('created_at', { ascending: false })
```

This applies to the main recipe grid AND the Daily Delight query if it also reads from `ready_recipes`.

**Check all queries in home/index.tsx** that touch `ready_recipes` and add the filter to each one.

---

## Rules
- Surgical edits only
- Do NOT change table schema or DB triggers
- Do NOT rewrite page components

---

## Verification

**Admin:**
1. Open `/dashboard/simple-recipes`
2. Each recipe row shows 40×40 avatar (or 🍰 fallback)
3. Status badge: shows only if field exists; shows correct Published/Draft value

**Mobile:**
1. `npx expo start --clear`
2. Tab1 Home → recipe grid shows only published recipes
3. Unpublished recipes (draft) do NOT appear
