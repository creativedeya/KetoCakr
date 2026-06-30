# Fix: Simple Recipes — Dual-table sync (base_recipes ↔ ready_recipes)

## Context
Simple recipes are STANDALONE recipes — not part of the Puzzle Model.
They exist in BOTH tables simultaneously:
- `base_recipes` → stores nutrition, ingredients, steps (is_simple_recipe = true)
- `ready_recipes` → stores the publishable record shown to mobile users

Every write to `base_recipes` for a simple recipe MUST be mirrored to `ready_recipes`.

---

## Fields that must be synced: base_recipes → ready_recipes

| base_recipes field         | ready_recipes field         |
|----------------------------|-----------------------------|
| name                       | name                        |
| name_en                    | name_en                     |
| description                | description                 |
| description_en             | description_en              |
| image_url                  | image_url                   |
| servings                   | servings                    |
| total_calories             | total_calories              |
| total_protein              | total_protein               |
| total_fat                  | total_fat                   |
| total_carbs                | total_carbs                 |
| total_net_carbs            | total_net_carbs             |
| total_fiber                | total_fiber                 |
| total_weight_grams         | total_weight_grams          |
| published_at               | published_at (status logic) |
| is_simple_recipe = true    | (set on create only)        |

ready_recipes additional fields to set on CREATE:
- `status` = 'published' if published_at is set, else 'draft'
- `source_base_recipe_id` = base_recipe.id (if column exists, otherwise skip)

---

## File to edit
`Admin/app/api/simple-recipes/route.ts` — POST handler
`Admin/app/api/simple-recipes/[id]/route.ts` — PATCH handler

---

## Change 1: POST handler — create in both tables

After successfully inserting into `base_recipes`, add upsert into `ready_recipes`:

```typescript
// After base_recipe insert succeeds and you have baseRecipe.id:

const readyPayload = {
  name: payload.name,
  name_en: payload.name_en || null,
  description: payload.description || null,
  description_en: payload.description_en || null,
  image_url: payload.image_url || null,
  servings: payload.servings || 1,
  total_calories: payload.total_calories || 0,
  total_protein: payload.total_protein || 0,
  total_fat: payload.total_fat || 0,
  total_carbs: payload.total_carbs || 0,
  total_net_carbs: payload.total_net_carbs || 0,
  total_weight_grams: payload.total_weight_grams || 0,
  published_at: payload.published_at || null,
  status: payload.published_at ? 'published' : 'draft',
  is_simple_recipe: true,
  // Link back to base_recipe if column exists:
  // base_recipe_id: baseRecipe.id,
};

const { error: readyError } = await supabaseAdmin
  .from('ready_recipes')
  .insert(readyPayload);

if (readyError) {
  console.error('ready_recipes insert failed:', readyError);
  // Do NOT fail the whole request — log and continue
  // The base_recipe is the source of truth
}
```

---

## Change 2: PATCH handler — update both tables

After successfully updating `base_recipes`, find the matching `ready_recipes` record and sync:

```typescript
// After base_recipe update succeeds:

// Find ready_recipe linked to this base_recipe
// Strategy: match by name (since there may be no FK yet)
const { data: existingReady } = await supabaseAdmin
  .from('ready_recipes')
  .select('id')
  .eq('name', updatedBaseRecipe.name)  // or .eq('base_recipe_id', id) if FK exists
  .eq('is_simple_recipe', true)
  .single();

if (existingReady) {
  const syncPayload: Record<string, any> = {};

  // Only sync fields that were included in the PATCH payload
  const syncFields = [
    'name', 'name_en', 'description', 'description_en',
    'image_url', 'servings',
    'total_calories', 'total_protein', 'total_fat',
    'total_carbs', 'total_net_carbs', 'total_weight_grams',
    'published_at',
  ];

  for (const field of syncFields) {
    if (payload[field] !== undefined) {
      syncPayload[field] = payload[field];
    }
  }

  // Sync status from published_at
  if ('published_at' in payload) {
    syncPayload.status = payload.published_at ? 'published' : 'draft';
  }

  if (Object.keys(syncPayload).length > 0) {
    const { error: syncError } = await supabaseAdmin
      .from('ready_recipes')
      .update(syncPayload)
      .eq('id', existingReady.id);

    if (syncError) {
      console.error('ready_recipes sync failed:', syncError);
      // Log but do not fail — base_recipe is source of truth
    }
  }
}
```

---

## Change 3: Add base_recipe_id FK to ready_recipes (optional but recommended)

Run in Supabase SQL Editor to make sync reliable (no name matching needed):

```sql
-- Check if column already exists first
ALTER TABLE ready_recipes 
ADD COLUMN IF NOT EXISTS base_recipe_id uuid REFERENCES base_recipes(id);

CREATE INDEX IF NOT EXISTS idx_ready_recipes_base_recipe_id 
ON ready_recipes(base_recipe_id);

-- Backfill for existing simple recipes (run after adding column)
-- UPDATE ready_recipes rr
-- SET base_recipe_id = br.id
-- FROM base_recipes br
-- WHERE rr.name = br.name AND br.is_simple_recipe = true;
```

If you add this column, replace the name-match lookup in Change 2 with:
```typescript
.eq('base_recipe_id', id)  // id = base_recipe id from URL param
```

---

## Change 4: Verify existing simple recipes are in ready_recipes

Run in Supabase SQL Editor to check state:

```sql
-- How many simple recipes exist in base_recipes?
SELECT COUNT(*) FROM base_recipes WHERE is_simple_recipe = true;

-- How many have a matching ready_recipe?
SELECT 
  br.id,
  br.name,
  br.published_at as base_published,
  rr.id as ready_id,
  rr.status as ready_status
FROM base_recipes br
LEFT JOIN ready_recipes rr ON rr.name = br.name AND rr.is_simple_recipe = true
WHERE br.is_simple_recipe = true
ORDER BY br.created_at DESC;
```

If gaps exist — run manual INSERT for each missing one.

---

## Update PROJECT_STATUS.md

Add to "Known DB Issues":
```
7. simple recipes: base_recipes and ready_recipes must always be kept in sync.
   Fields: name, name_en, description, description_en, image_url, servings,
   nutrition totals, published_at/status.
   API routes /api/simple-recipes POST+PATCH handle this sync.
   ready_recipes.base_recipe_id FK recommended for reliable lookup.
```

Add to "Completed — Admin Panel" when done:
```
- [x] Simple recipes: dual-table sync (base_recipes ↔ ready_recipes on every save)
```

---

## Update CLAUDE.md (or equivalent project rules file)

Add section:

```markdown
## Simple Recipes — Dual-Table Rule

Simple recipes (is_simple_recipe = true) exist in BOTH:
- base_recipes — source of truth for nutrition, ingredients, steps
- ready_recipes — publishable record visible to mobile users

RULE: Every write to base_recipes for a simple recipe MUST be mirrored to ready_recipes.
This applies to: name, description, image_url, servings, all nutrition totals, published_at.

API routes that handle this:
- POST /api/simple-recipes → inserts into both tables
- PATCH /api/simple-recipes/[id] → updates both tables

Do NOT add UI fields that write to only one table without syncing the other.
The base_recipe_id FK on ready_recipes is the preferred join key.
```

---

## Verify after implementation
1. Create a new simple recipe → check ready_recipes has matching row
2. Change image_url in form → save → check ready_recipes.image_url updated
3. Change servings → save → check both tables
4. Publish → check ready_recipes.status = 'published' and published_at matches
5. Unpublish → check ready_recipes.status = 'draft' and published_at = null
