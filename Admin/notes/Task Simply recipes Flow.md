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

If any of the three is missing: block the action, show inline field errors,
do not partially save. This is the **only** tab with a Publish action.
Publish = final PATCH that sets `status`/`published_at` and writes all
mirrored fields into `ready_recipes` per the existing dual-sync rule.

---

## Data Integrity Rules

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