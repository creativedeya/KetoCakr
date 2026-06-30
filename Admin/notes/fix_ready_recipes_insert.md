# Fix: simple-recipes POST route — ready_recipes insert schema mismatch

## File to edit
`Admin/app/api/simple-recipes/route.ts`

---

## The exact problems

1. `id: recipe.id` — ready_recipes generates its OWN uuid. Passing base_recipe id
   causes conflict or silent rejection. REMOVE the id field entirely.
2. `name_en` is NOT NULL in ready_recipes schema — if body.name_en is empty, insert fails.
   Fix: fallback to body.name (Bulgarian name).
3. `cost_currency` / `price_currency` — schema default is 'EUR', not 'BGN'. Minor but consistent.
4. No `is_simple_recipe` column in ready_recipes schema — remove that field.
5. No `total_fiber` in ready_recipes schema — do not send it.

---

## str_replace

### Replace the entire ready_recipes insert block

OLD:
```typescript
    // Mirror to ready_recipes (best-effort — base_recipes is source of truth)
    const { error: readyError } = await supabase
      .from('ready_recipes')
      .insert({
        id: recipe.id,
        name_bg: body.name,
        name_en: body.name_en || body.name,
        description_bg: body.description || '',
        description_en: body.description_en || '',
        hero_image_url: body.image_url || '',
        is_featured: false,
        is_free: body.is_free ?? false,
        difficulty_level: body.difficulty_level || 2,
        total_servings: body.servings || 1,
        total_weight_grams: body.total_weight_grams || 0,
        total_calories: body.total_calories || 0,
        total_protein: body.total_protein || 0,
        total_fat: body.total_fat || 0,
        total_carbs: body.total_carbs || 0,
        total_net_carbs: body.total_net_carbs || 0,
        published_at: body.published_at || null,
        status: body.published_at ? 'published' : 'draft',
        slug: generateSlug(body.name),
        cost_currency: 'BGN',
        price_currency: 'BGN',
        is_simple_recipe: true,
        selected_components: [{
          base_recipe_id: recipe.id,
          recipe_id: recipe.id,
          role: 'simple',
          order_index: 0,
          multiplier: 1,
        }],
      });
    if (readyError) console.error('[Simple Recipes API] ready_recipes insert failed:', readyError.message);
```

NEW:
```typescript
    // Mirror to ready_recipes (best-effort — base_recipes is source of truth)
    const { error: readyError } = await supabase
      .from('ready_recipes')
      .insert({
        // NOTE: no `id` field — ready_recipes generates its own uuid
        name_en: body.name_en || body.name,   // NOT NULL in schema — fallback to BG name
        name_bg: body.name || null,
        description_en: body.description_en || body.description || null,
        description_bg: body.description || null,
        hero_image_url: body.image_url || null,
        is_featured: false,
        is_free: body.is_free ?? false,
        difficulty_level: body.difficulty_level || 2,
        total_servings: body.servings || 1,
        total_weight_grams: body.total_weight_grams || null,
        total_calories: body.total_calories || null,
        total_protein: body.total_protein || null,
        total_fat: body.total_fat || null,
        total_carbs: body.total_carbs || null,
        total_net_carbs: body.total_net_carbs || null,
        published_at: body.published_at || null,
        status: body.published_at ? 'published' : 'draft',
        slug: generateSlug(body.name_en || body.name),
        selected_components: [{
          base_recipe_id: recipe.id,
          recipe_id: recipe.id,
          role: 'simple',
          order_index: 0,
          multiplier: 1,
        }],
      });
    if (readyError) {
      console.error('[Simple Recipes API] ready_recipes insert failed:', readyError.message, readyError.details, readyError.hint);
    } else {
      console.log('[Simple Recipes API] ready_recipes mirrored successfully for base_recipe:', recipe.id);
    }
```

---

## Also needed: PATCH handler in [id]/route.ts

Paste the content of `Admin/app/api/simple-recipes/[id]/route.ts` to get the PATCH fix too.
The same fields need to be synced on every update.

---

## Verify after fix
Run in Supabase SQL Editor after creating a new simple recipe:
```sql
SELECT 
  br.id as base_id,
  br.name,
  br.is_simple_recipe,
  rr.id as ready_id,
  rr.name_en,
  rr.status,
  rr.total_weight_grams
FROM base_recipes br
LEFT JOIN ready_recipes rr ON rr.selected_components @> jsonb_build_array(
  jsonb_build_object('base_recipe_id', br.id)
)
WHERE br.is_simple_recipe = true
ORDER BY br.created_at DESC
LIMIT 5;
```

Expected: every base_recipe row has a matching ready_recipes row.
