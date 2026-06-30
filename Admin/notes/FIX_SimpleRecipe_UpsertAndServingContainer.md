# Fix: Simple Recipes — Duplicate ready_recipes + Serving Container

**Scope:** `admin/app/dashboard/simple-recipes/[id]/page.tsx`  
**Time:** 20 min

---

## Fix 1 — upsertReadyRecipe: prevent duplicate records

**Problem:** `upsert({ id: recipeId }, { onConflict: 'id' })` creates a NEW record when
a ready_recipes row exists with a DIFFERENT id (created during PDF import).

**Find `upsertReadyRecipe` function (~line 280). Replace entirely:**

```typescript
async function upsertReadyRecipe() {
  const estimatedCost = await calculateRecipeCost(recipeId);
  const slugName = recipe?.name_en || recipe?.name || recipe?.name_bg || '';

  // Check if a ready_recipe already exists for this base_recipe
  // It may have been created with a different id during PDF import
  const { data: existingByName } = await supabase
    .from('ready_recipes')
    .select('id')
    .eq('name_bg', recipe?.name_bg || recipe?.name || '')
    .maybeSingle();

  const targetId = existingByName?.id || recipeId;

  const payload = {
    id: targetId,
    name_en: recipe?.name_en || recipe?.name || '',
    name_bg: recipe?.name_bg || '',
    dessert_type_id: selectedDessertTypeId,
    serving_container_id: selectedServingContainerId || null,
    hero_image_url: recipe?.image_url || null,
    selected_components: [{
      base_recipe_id: recipeId,
      recipe_id: recipeId,
      role: 'simple',
      order_index: 0,
      multiplier: 1,
    }],
    total_calories: recipe?.total_calories ?? null,
    total_protein: recipe?.total_protein ?? null,
    total_fat: recipe?.total_fat ?? null,
    total_carbs: recipe?.total_carbs ?? null,
    total_net_carbs: recipe?.total_net_carbs ?? null,
    total_weight_grams: recipe?.total_weight_grams ?? null,
    total_servings: recipe?.servings ?? null,
    difficulty_level: difficultyLevel || 2,
    slug: await generateUniqueSlug(slugName, targetId) || `recipe-${recipeId}`,
    description_en: recipe?.description_en || null,
    description_bg: recipe?.description_bg || null,
    is_free: true,
    status: 'published',
    estimated_cost: estimatedCost,
    cost_calculated_at: new Date().toISOString(),
    cost_currency: 'EUR',
    published_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('ready_recipes')
    .upsert(payload, { onConflict: 'id' });

  if (error) throw error;
}
```

**Key change:** looks up existing record by `name_bg` first → uses its `id` for upsert → no duplicate.

---

## Fix 2 — serving_container_id not saved during upsert

**Problem:** Original `upsertReadyRecipe` was missing `serving_container_id` in the payload.
Fix 1 above already includes it. ✅

---

## Fix 3 — Serving container dropdown shows [undefined]

**Problem:** Dropdown renders `[sc.category]` but equipment table has no `category` column.
The correct column is `serving_container_type`.

Find the serving container dropdown (~line 490):

```typescript
{servingContainers.map(sc => (
  <option key={sc.id} value={sc.id}>
    {sc.name} {sc.name_en ? `/ ${sc.name_en}` : ''} [{sc.category}]
  </option>
))}
```

Replace `[sc.category]` with `[sc.serving_container_type]`:

```typescript
{servingContainers.map(sc => (
  <option key={sc.id} value={sc.id}>
    {sc.name} {sc.name_en ? `/ ${sc.name_en}` : ''} [{sc.serving_container_type || ''}]
  </option>
))}
```

---

## Fix 4 — Check API route returns serving_container_type

**File:** `admin/app/api/equipment/route.ts` (or similar)

Find the handler for `?serving_container=true`.
Make sure the select includes `serving_container_type`:

```typescript
.select('id, name, name_en, serving_container_type, is_serving_container')
.eq('is_serving_container', true)
```

---

## Fix 5 — Load serving_container_id correctly on page load

Find `loadRecipeAndSteps` (~line 155). The ready_recipes query:

```typescript
const { data: readyData } = await supabase
  .from('ready_recipes')
  .select('dessert_type_id, serving_container_id, difficulty_level')
  .eq('id', recipeId)
  .maybeSingle();
```

**Problem:** queries by `id = recipeId` (base_recipe id) but the ready_recipe may have a different id.

Replace with:

```typescript
const { data: readyData } = await supabase
  .from('ready_recipes')
  .select('dessert_type_id, serving_container_id, difficulty_level')
  .or(`id.eq.${recipeId},name_bg.eq.${recipe?.name_bg || recipe?.name || ''}`)
  .maybeSingle();
```

---

## Rules
- Surgical edits — only the functions mentioned above
- Do NOT change DB schema
- Do NOT touch mobile app

---

## After fix — cleanup duplicate in DB

After deploying the fix, delete the duplicate draft record manually:
```sql
DELETE FROM ready_recipes WHERE id = '5d90454e-1406-4952-9329-21a011708746';
```

## Verification
1. Open simple recipe → Публикувай
2. No new duplicate created in ready_recipes
3. Serving container dropdown shows correct type labels (pan, mold, etc.)
4. Selected serving container saves correctly
5. On page reload — correct serving container pre-selected
