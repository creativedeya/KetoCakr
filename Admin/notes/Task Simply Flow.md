# TASK: Simple Recipe Creation Flow — Single-Write-Point Architecture Fix

> Context: see CLAUDE.md / PROJECT_STATUS.md for dual-sync rule (Simple Recipes
> must exist in BOTH base_recipes and ready_recipes, exactly once each).
> This task fixes the recurring duplicate-record bug by removing all
> persistence from Tabs 1–3 and consolidating into a single write point at
> Tab 4 — not by patching individual save buttons.

---

## Confirmed Bug (reproduced, with evidence)

Creating "Pistachio Ice Cream" produced TWO completely separate rows in
BOTH `base_recipes` and `ready_recipes`, with two different UUID pairs:

- `08:01:45` — pressed the Save button on **Tab 2** → created
  `base_recipes.id = 5bdb1bfc-...` + `ready_recipes.id = 88a0f762-...`,
  status `draft`, `dessert_type_id = null`, `difficulty_level = 2`.
- `08:19:01` → `08:20:41` — completed Tab 4 and published → created a
  **second, independent** `base_recipes.id = e177976b-...` +
  `ready_recipes.id = 81a95fed-...`, status `published`,
  `dessert_type_id = 8`, `difficulty_level = 3`.

Root cause confirmed: Tab 2's Save button fires its own full POST
(creating a new row in both tables), completely independent from Tab 4's
later POST. There is no shared `recipeId` carried through the wizard — each
tab's save button is wired to its own "create" call. This is the structural
bug, and it will keep happening on Tab 1 and Tab 3 too, for the same reason.

Also confirmed separately: the API attempted to write `dessert_type_id`
into `base_recipes`, which has no such column (see Dual-Table Field
Mapping below — this must be fixed in the same pass).

---

## Required Architecture: No Persistence Until Tab 4

- **Tabs 1, 2, 3 make zero network calls.** Remove their Save buttons
  entirely. All field values the user enters are held in a single
  wizard-level state object (React state / context / Zustand — whatever
  the wizard already uses for cross-tab state), not written to Supabase.
- **Tab 4 is the only write point.** Its Save/Publish action takes the
  fully accumulated wizard state and performs exactly one sequence of
  writes: `base_recipes` → `ready_recipes` → `recipe_ingredients` →
  `recipe_instruction_steps`. This is the only place INSERT (or UPDATE,
  see below) happens for the whole flow.
- **Create vs. Edit is decided once, before the wizard opens** — not
  invented mid-flow. If the wizard was opened to create a new recipe,
  `recipeId` is `null` for the entire session and Tab 4 performs an
  INSERT. If the wizard was opened to edit an existing simple recipe,
  `recipeId` is passed in from the recipe list/detail page at mount time
  and Tab 4 performs an UPDATE on that id. No code path may decide
  mid-wizard to switch from insert to update or vice versa.
- Because nothing is written until Tab 4, **abandoning the wizard after
  Tab 1/2/3 leaves the database untouched** for new recipes — no cleanup
  needed. For edit mode, abandoning mid-wizard also leaves the original
  row untouched, since edits only ever existed in memory.
- Idempotency guard on Tab 4 itself: disable the Save/Publish button the
  instant it's pressed (request-in-flight state) to prevent a double-click
  from firing two POSTs. Server-side, if `recipeId` is present, the route
  must always UPDATE, never INSERT — even if called twice.

---

## Tab-by-Tab Behavior

### Tab 1 — Intro
Fields, in this order: `name_bg`, `name_en`, `total_servings`.
No Save button. "Next" only updates wizard state and advances the step;
no API call. Block "Next" until:
- `name_bg` non-empty
- `name_en` non-empty
- `total_servings > 0`

### Tab 2 — Ingredients
No Save button. "Next"/"Back" only update wizard state, no API call.
(This removes the bug's direct trigger.)

### Tab 3 — Steps
No Save button. "Next"/"Back" only update wizard state, no API call.

### Tab 4 — Finalize (the only write point)
Required before Save/Publish is enabled:
- `dessert_type_id`
- `serving_container_id`
- `difficulty_level`

⚠️ See "Dual-Table Field Mapping" below before implementing this handler —
none of these three fields maps 1:1 to `base_recipes`. In particular
`serving_container_id` has no `base_recipes` column at all, and
`difficulty_level` is a different data type (text vs integer) between the
two tables.

If any of the three required fields is missing: block the action, show
inline field errors, make zero writes.

On Save/Publish, in this order, using the full wizard state accumulated
from Tabs 1–3 plus Tab 4's own fields:
1. If `recipeId` is null → INSERT into `base_recipes` (mapped fields,
   `is_simple_recipe = true`) and INSERT into `ready_recipes` (mapped
   fields). Capture the new ids.
   If `recipeId` is present → UPDATE both rows instead.
2. Write/replace `recipe_ingredients` rows for this recipe id.
3. Write/replace `recipe_instruction_steps` rows for this recipe id
   (including `ingredients_used[]`).
4. Set `status = 'published'`, `published_at = now()` on `ready_recipes`.

All four steps should happen in one server-side API call (one route
handler doing sequential awaited writes, or a single DB transaction if
using an RPC) — not four separate client-triggered requests.

---

## Dual-Table Field Mapping (authoritative — confirmed against live schema)

The two tables do **not** share column names or types. The Tab 4 write
handler must map UI fields to the correct column per table — do not build
one shared payload object and send it to both tables verbatim, which is
what caused the `dessert_type_id` error.

| UI field | `base_recipes` column | `ready_recipes` column |
|---|---|---|
| Name (BG) | `name` (varchar, NOT NULL) | `name_bg` (text, nullable) |
| Name (EN) | `name_en` (varchar, nullable) | `name_en` (text, **NOT NULL**) |
| Servings | `servings` (int) | `total_servings` (int) |
| Dessert type | `compatible_dessert_types` (int[] — **array**, Puzzle Model field) | `dessert_type_id` (single int FK) |
| Serving container | *(no column exists)* | `serving_container_id` (int FK → `equipment.id`) |
| Difficulty | `difficulty_level` (**text**) | `difficulty_level` (**integer**, CHECK 1–5) |
| Description (BG) | `description` | `description_bg` |
| Description (EN) | `description_en` | `description_en` |
| Image | `image_url` | `hero_image_url` |
| Calories/Protein/Fat/Carbs/Net carbs | `total_calories`/`total_protein`/`total_fat`/`total_carbs`/`total_net_carbs` | same names on `ready_recipes` |
| Weight | `total_weight_grams` | `total_weight_grams` |

Required handling for the mismatches above:

- **Dessert type**: write `dessert_type_id` only to `ready_recipes`. For
  `base_recipes.compatible_dessert_types`, write a single-element array
  `[dessert_type_id]` (confirmed acceptable usage — current production row
  for "Pistachio Ice Cream" already stores `ARRAY['8']` this way).
- **Serving container**: `serving_container_id` is `ready_recipes`-only.
  Never attempt to write it to `base_recipes` under any field name.
- **Difficulty**: type mismatch (text vs integer 1–5) needs an explicit
  mapping function, e.g. `toBaseRecipeDifficulty(level: number): string`.
  **Confirmed (Deyana, 2026-06-23)**: store as plain numeric string —
  `String(level)`, i.e. `"1"`–`"5"`. Do NOT use Bulgarian text labels going
  forward, even though the existing production row for "Pistachio Ice
  Cream" currently has `'Средно'` — that row should be normalized to `"3"`
  as part of cleanup (see SQL Audit below).

Implement this mapping as one small shared function (e.g.
`mapSimpleRecipeFields(input) → { basePayload, readyPayload }`) used by
the single Tab 4 write handler, so the two tables can never silently drift
out of sync again.

---

## Data Integrity Rules

1. Exactly one row per recipe in `base_recipes`, exactly one mirrored row
   in `ready_recipes`, always — enforced structurally by having only one
   write point (Tab 4) instead of by guarding multiple save buttons.
2. `recipe_ingredients` and `recipe_instruction_steps` are written using
   the same id produced/used in step 1 of the Tab 4 handler — no separate
   "find or create parent" logic anywhere.
3. Delete (the Admin "Delete recipe" button, separate from this wizard)
   must cascade-delete server-side, in one API call, in this order:
   - `recipe_instruction_steps WHERE base_recipe_id = id`
   - `recipe_ingredients WHERE base_recipe_id = id`
   - `ready_recipes` row matching this recipe (via `selected_components`
     `base_recipe_id`, or a dedicated FK if one gets added — confirm
     current lookup key against the actual delete route)
   - `base_recipes WHERE id = id`
   Zero orphaned rows in any of the 4 tables after delete.

---

## Files to Investigate (confirm exact paths against current repo first)

- Admin simple-recipe wizard component (4-tab form)
- Tab 1, Tab 2, Tab 3 sub-components — locate and remove their Save
  buttons and any `onClick`/`onSave` handlers that call the API
- `app/api/simple-recipes/route.ts` (POST) — must only ever be called from
  the Tab 4 handler when `recipeId` is null
- `app/api/simple-recipes/[id]/route.ts` (PATCH/UPDATE) — must only ever
  be called from the Tab 4 handler when `recipeId` is present
- Any shared `publish/route.ts` reused by simple recipes

---

## Implementation Steps

1. Locate the wizard component and every Save/network call site across
   all 4 tabs. Confirm Tab 2's button is indeed firing its own POST (this
   is the proven trigger of the reported bug) and check Tab 1 / Tab 3 for
   the same pattern.
2. Remove the Save button and its handler from Tab 1, Tab 2, and Tab 3.
   "Next"/"Back" become pure client-side state transitions.
3. Consolidate all field state (Tabs 1–4) into one wizard-level state
   object, available to the Tab 4 handler.
4. Implement `mapSimpleRecipeFields()` per the Dual-Table Field Mapping
   table above.
5. Implement the single Tab 4 write handler: insert-or-update branching on
   `recipeId`, then ingredients, then steps, then publish fields — as one
   server-side call.
6. Add the request-in-flight guard (disable button) and server-side
   insert-vs-update safety (never insert when an id is supplied).
7. Confirm/implement the cascade-delete route as a single server-side
   transaction (unrelated to this wizard, but covered by this task per
   the architecture rules).
8. Run the SQL audit below, including cleanup of the specific duplicate
   already produced during testing.

---

## SQL Audit

### Normalize existing text-label difficulty to numeric string
The published "Pistachio Ice Cream" row still has the old label-style
value. Bring it in line with the confirmed format before/after deploying
the fix:

```sql
UPDATE base_recipes
SET difficulty_level = '3'
WHERE id = 'e177976b-b12e-43c3-9e59-559291a5f10c'
  AND difficulty_level = 'Средно';

-- Find any other base_recipes rows still using BG text labels instead of "1"-"5"
SELECT id, name, difficulty_level
FROM base_recipes
WHERE is_simple_recipe = true
  AND difficulty_level !~ '^[1-5]$';
```

### Clean up the confirmed duplicate from testing (Pistachio Ice Cream)
The draft pair created by the old Tab 2 button is now orphaned — the
published pair is the one that should remain.

```sql
-- Remove orphaned draft ready_recipes row
DELETE FROM ready_recipes WHERE id = '88a0f762-00e2-4b42-a3f7-46c4c4ee5a0e';

-- Remove any child rows tied to the orphaned base_recipes row first
DELETE FROM recipe_instruction_steps WHERE base_recipe_id = '5bdb1bfc-42ae-4007-94af-61bda29d0b6e';
DELETE FROM recipe_ingredients WHERE base_recipe_id = '5bdb1bfc-42ae-4007-94af-61bda29d0b6e';

-- Remove the orphaned draft base_recipes row
DELETE FROM base_recipes WHERE id = '5bdb1bfc-42ae-4007-94af-61bda29d0b6e';
```
Run this BEFORE deploying the fix — verify first with a SELECT that these
ids have no other dependents.

### General duplicate finder (run periodically / after the fix)
```sql
-- Duplicate base_recipes for simple recipes
SELECT name, name_en, count(*)
FROM base_recipes
WHERE is_simple_recipe = true
GROUP BY name, name_en
HAVING count(*) > 1;

-- Duplicate ready_recipes rows
SELECT name_en, count(*)
FROM ready_recipes
GROUP BY name_en
HAVING count(*) > 1;
```

---

## Testing Checklist

- [ ] Fill in Tabs 1, 2, 3 fully, then refresh the page before reaching
      Tab 4 — confirm ZERO rows were created in `base_recipes` or
      `ready_recipes`
- [ ] Complete all 4 tabs, Save/Publish once — confirm exactly 1 row in
      `base_recipes` + 1 row in `ready_recipes`, fully and correctly
      mapped per the field table (especially `dessert_type_id`,
      `serving_container_id`, `difficulty_level`)
- [ ] Double-click the Tab 4 Save/Publish button rapidly — confirm only
      one row pair is created, not two
- [ ] Open an existing simple recipe for editing, change a field, save —
      confirm it UPDATEs the existing row pair, does not create a new one
- [ ] Delete a published simple recipe → confirm 0 rows remain across all
      4 tables (steps, ingredients, ready_recipes, base_recipes)
- [ ] Attempt Tab 4 save missing `dessert_type_id` / `serving_container_id`
      / `difficulty_level` → blocked with visible error, zero writes

---

## Out of Scope

- Puzzle Model (non-simple) recipe flow
- Mobile app
- Existing nutrition calculation logic
- Equipment (`recipe_equipment`) and Lab Notes (`lab_notes`) management,
  and full edit-mode hydration for existing recipes — covered separately
  in `TASK_SIMPLE_RECIPE_EDIT_MODE_AND_EQUIPMENT_NOTES.md` (Phase 2),
  which builds on this wizard once it exists