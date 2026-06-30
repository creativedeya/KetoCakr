# TASK: Simple Recipe Creation Flow — Single-Record Architecture Fix

> Context: see CLAUDE.md / PROJECT_STATUS.md for dual-sync rule (Simple Recipes
> must exist in BOTH base_recipes and ready_recipes, exactly once each).
> This task fixes the recurring duplicate-record bug by redesigning the
> save/validation flow across the 4 admin tabs, not by patching symptoms.

---

## Problem

Creating a new Simple Recipe intermittently produces TWO rows for the same
recipe (in base_recipes and/or ready_recipes) instead of one.

## Root Cause Hypothesis

The wizard likely fires a POST (insert) at more than one point in the tab
flow (e.g. on "Next" in multiple tabs, or on autosave + manual save both
hitting POST), instead of creating the record exactly once and updating it
thereafter. Any retry, double-click, or re-entry into Tab 1 after a row
already exists can also trigger a second POST.

## Confirmed Bug: Wrong-Table Column Write

Observed error: `Could not find the 'dessert_type_id' column of 'base_recipes'
in the schema cache`. Root cause: the save handler builds a single payload
object and sends it to `base_recipes`, but `dessert_type_id` does not exist
on that table — it only exists on `ready_recipes`. This confirms the API is
not respecting the two tables' actual (and different) schemas. See
"Dual-Table Field Mapping" below — this must be fixed as part of this task,
not just the duplicate-record issue.

---

## Required Architecture: Create-Once, Update-Always

- On first successful validation gate (end of Tab 1), call
  `POST /api/simple-recipes` **exactly once** → creates one row in
  `base_recipes` (`is_simple_recipe = true`) and one mirrored row in
  `ready_recipes`. Capture the returned id into wizard-level state
  immediately.
- Every subsequent save (Tab 2, Tab 3, Tab 4, any autosave) must call
  `PATCH /api/simple-recipes/[id]` using that captured id. No other POST
  call may exist anywhere else in the flow.
- Client guard: if `recipeId` is already set in state, the save handler
  must route to PATCH only. POST must be physically unreachable once an id
  exists (hide/disable the create entry point in that state).
- Server guard: the API must never insert when an id is present — if hit
  twice (double-click, slow network retry), the second call must update
  the same row, not create a new one. Disable the Save/Next button while a
  request is in flight.

---

## Tab-by-Tab Behavior

### Tab 1 — Intro
Fields, in this order: `name_bg`, `name_en`, `total_servings`.
Block "Next" until:
- `name_bg` non-empty
- `name_en` non-empty
- `total_servings > 0`

Remove the Publish button from this tab entirely.
On successful "Next": fire the single POST described above, store `recipeId`.

If the user exits the flow (back/close/navigate away) having completed
only Tab 1: show a confirmation dialog — "Discard unsaved recipe?" with
options Delete-and-exit (cascade delete, see below) or Cancel. Do not allow
silent exit leaving an orphaned row.

### Tab 2 — Ingredients
Remove the Publish button. Save = PATCH only, using the existing `recipeId`.

### Tab 3 — Steps
Remove the Publish button. Save = PATCH only, using the existing `recipeId`.

### Tab 4 — Finalize
Required before Save/Publish is allowed:
- `dessert_type_id`
- `serving_container_id`
- `difficulty_level`

⚠️ See "Dual-Table Field Mapping" below before implementing this tab's save
handler — none of these three fields maps 1:1 to `base_recipes`. In
particular `serving_container_id` has no `base_recipes` column at all, and
`difficulty_level` is a different data type (text vs integer) between the
two tables.

If any of the three is missing: block the action, show inline field errors,
do not partially save. This is the **only** tab with a Publish action.
Publish = final PATCH that sets `status`/`published_at` and writes all
mirrored fields into `ready_recipes` per the existing dual-sync rule.

---

## Dual-Table Field Mapping (authoritative — confirmed against live schema)

The two tables do **not** share column names or types. Every save handler
(POST and PATCH) must map UI fields to the correct column per table. Do not
build one shared payload object and send it to both tables verbatim — that
is what caused the `dessert_type_id` error.

| UI field | `base_recipes` column | `ready_recipes` column |
|---|---|---|
| Name (BG) | `name` (varchar, NOT NULL) | `name_bg` (text, nullable) |
| Name (EN) | `name_en` (varchar, nullable) | `name_en` (text, **NOT NULL**) |
| Servings | `servings` (int) | `total_servings` (int) |
| Dessert type | `compatible_dessert_types` (int[] — **array**, used by Puzzle Model) | `dessert_type_id` (single int FK) |
| Serving container | *(no column exists)* | `serving_container_id` (int FK → `equipment.id`) |
| Difficulty | `difficulty_level` (**text**) | `difficulty_level` (**integer**, CHECK 1–5) |
| Description (BG) | `description` | `description_bg` |
| Description (EN) | `description_en` | `description_en` |
| Image | `image_url` | `hero_image_url` |
| Calories/Protein/Fat/Carbs/Net carbs | `total_calories`/`total_protein`/`total_fat`/`total_carbs`/`total_net_carbs` | same names on `ready_recipes` |
| Weight | `total_weight_grams` | `total_weight_grams` |

Required handling for the mismatches above:

- **Dessert type**: write `dessert_type_id` only to `ready_recipes`. For
  `base_recipes.compatible_dessert_types`, since Simple Recipes are
  standalone (not part of the Puzzle Model), write a single-element array
  `[dessert_type_id]` so the column is populated consistently rather than
  left null — confirm this is the desired behavior, or leave it null if
  `compatible_dessert_types` should stay reserved for true Puzzle-Model
  components.
- **Serving container**: `serving_container_id` is `ready_recipes`-only.
  Do not attempt to write it to `base_recipes` under any field name.
- **Difficulty**: type mismatch (text vs integer 1–5) needs an explicit,
  documented mapping function, e.g. `toBaseRecipeDifficulty(level: number):
  string`. **Open question for Deyana**: should `base_recipes.difficulty_level`
  store the raw number as a string (`"3"`), or a text label (e.g.
  `"Среден"` / `"Medium"`)? Confirm before implementing — do not guess.

Implement this mapping as one small shared function (e.g.
`mapSimpleRecipeFields(input) → { basePayload, readyPayload }`) used by
both the POST and PATCH handlers, so the two tables can never silently
drift out of sync again.

1. Exactly one row per recipe in `base_recipes`, exactly one mirrored row
   in `ready_recipes`, always. No duplicate inserts under any circumstance
   (double-click, slow retry, re-opening the draft).
2. `recipe_ingredients` and `recipe_instruction_steps` are written using
   the same `recipeId` captured at Tab 1 — no "find or create parent"
   logic anywhere that could spawn a second parent row.
3. Delete (admin Delete button, and the Tab-1-abandon path) must
   cascade-delete server-side, in one API call, in this order:
   - `recipe_instruction_steps WHERE base_recipe_id = id`
   - `recipe_ingredients WHERE base_recipe_id = id`
   - `ready_recipes` row matching this recipe (by FK if present, else by
     current lookup key — confirm against actual schema)
   - `base_recipes WHERE id = id`
   Zero orphaned rows in any of the 4 tables after delete.

---

## Files to Investigate (confirm exact paths against current repo first)

- Admin simple-recipe wizard component (4-tab form, likely
  `SimpleRecipeForm.tsx` or similar)
- `app/api/simple-recipes/route.ts` (POST)
- `app/api/simple-recipes/[id]/route.ts` (PATCH, DELETE)
- Any shared `publish/route.ts` reused by simple recipes

---

## Implementation Steps

1. Locate the wizard component. List every place that currently fires a
   network call on Save/Next/Publish, across all 4 tabs, before changing
   anything.
2. Identify every POST call site. After the fix there must be exactly one
   POST call site in the whole flow (Tab 1 completion). Convert all others
   to PATCH.
3. Add `recipeId` as wizard-level state (not per-tab local state), set once
   after the Tab 1 POST resolves, passed down to Tabs 2–4.
4. Implement the validation gates above as functions wired to: (a) the
   Next/Save button's disabled state, and (b) a server-side check — do not
   rely on client validation alone.
5. Remove Publish button JSX from Tabs 1–3. Confirm Tab 4 is the only
   place it renders, and only once all 3 required fields are filled.
6. Implement/confirm the cascade-delete route as a single server-side
   transaction (or sequential awaited deletes in one route handler).
7. Implement the Tab-1-abandon confirmation dialog with delete-on-discard.
8. Run the SQL audit below before and after the fix.

---

## SQL Audit — Existing Duplicates

```sql
-- Duplicate base_recipes for simple recipes
SELECT name_bg, name_en, count(*)
FROM base_recipes
WHERE is_simple_recipe = true
GROUP BY name_bg, name_en
HAVING count(*) > 1;

-- Duplicate ready_recipes rows
SELECT name_en, count(*)
FROM ready_recipes
GROUP BY name_en
HAVING count(*) > 1;
```

Clean up any rows this finds BEFORE deploying the new flow — otherwise old
duplicates linger even after the bug is fixed.

---

## Testing Checklist

- [ ] Create a new simple recipe end-to-end, refresh mid-flow at each tab —
      confirm no duplicate row appears in base_recipes or ready_recipes
- [ ] Double-click Save rapidly on each tab — confirm single PATCH, no
      duplicate created
- [ ] Abandon flow after Tab 1 only → confirm the row is deleted, not
      orphaned
- [ ] Complete all 4 tabs, publish → confirm exactly 1 row in
      base_recipes + 1 row in ready_recipes, fully synced
- [ ] Delete a published simple recipe → confirm 0 rows remain across all
      4 tables (steps, ingredients, ready_recipes, base_recipes)
- [ ] Attempt Tab 4 publish missing dessert_type_id / serving_container_id
      / difficulty_level → blocked with visible error, no partial save

---

## Out of Scope

- Puzzle Model (non-simple) recipe flow
- Mobile app
- Existing nutrition calculation logic