-- ── Migration 62: Add base_recipe_id FK to ready_recipes ────────────────────
--
-- PURPOSE: Give simple recipes a reliable FK back to base_recipes so that
-- all CRUD operations (GET, PATCH, DELETE, publish) can find the correct
-- ready_recipes row without depending on the JSONB selected_components field.
--
-- PREREQUISITE: Clean up duplicate rows first (see Step 3 + Step 4 below).
-- The unique index in Step 5 will FAIL if duplicates still exist.
--
-- Run each step separately in Supabase SQL editor and verify before proceeding.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── STEP 1: Add base_recipe_id column ────────────────────────────────────────
-- Nullable: multi-component puzzle recipes stay NULL; only simple recipes set it.

ALTER TABLE ready_recipes
  ADD COLUMN IF NOT EXISTS base_recipe_id uuid REFERENCES base_recipes(id) ON DELETE CASCADE;


-- ── STEP 2: Backfill from selected_components ────────────────────────────────
-- Populates base_recipe_id for all existing single-component simple-recipe rows.

UPDATE ready_recipes
SET base_recipe_id = (selected_components->0->>'base_recipe_id')::uuid
WHERE base_recipe_id IS NULL
  AND selected_components IS NOT NULL
  AND jsonb_array_length(selected_components) = 1
  AND selected_components->0->>'base_recipe_id' IS NOT NULL;

-- Verify backfill:
-- SELECT COUNT(*) FROM ready_recipes WHERE base_recipe_id IS NOT NULL;


-- ── STEP 3: Find duplicate rows ───────────────────────────────────────────────
-- Run this query and review the output before proceeding to Steps 4 and 5.
-- Each row in the result represents a base recipe that has 2+ ready_recipe rows.

SELECT
  base_recipe_id,
  COUNT(*)                                           AS row_count,
  array_agg(id            ORDER BY created_at DESC) AS ready_recipe_ids,
  array_agg(name_bg       ORDER BY created_at DESC) AS names,
  array_agg(dessert_type_id ORDER BY created_at DESC) AS dessert_type_ids,
  array_agg(created_at    ORDER BY created_at DESC) AS created_ats
FROM ready_recipes
WHERE base_recipe_id IS NOT NULL
GROUP BY base_recipe_id
HAVING COUNT(*) > 1;


-- ── STEP 4: Delete duplicate rows ─────────────────────────────────────────────
-- For each duplicate set found in Step 3:
--   Keep the row WITH dessert_type_id set (the correctly-filled one).
--   Delete the other row(s).
--
-- Example — for "Сладолед с шам фъстък":
--   1. Find both rows:
--      SELECT id, name_bg, dessert_type_id, created_at
--      FROM ready_recipes
--      WHERE base_recipe_id = '<BASE_RECIPE_UUID>';
--
--   2. Delete the duplicate (the one missing dessert_type_id / the unwanted one):
--      DELETE FROM ready_recipes WHERE id = '<UNWANTED_READY_RECIPE_UUID>';
--
-- SAFE: deleting a ready_recipes row does NOT cascade-delete base_recipes.
-- The FK is ready_recipes → base_recipes (child → parent), not the reverse.


-- ── STEP 5: Add partial unique index ──────────────────────────────────────────
-- Run ONLY after Step 4 has cleaned up all duplicates.
-- Physically prevents two ready_recipes rows from sharing the same base_recipe_id.

CREATE UNIQUE INDEX IF NOT EXISTS idx_ready_recipes_base_recipe_id_unique
  ON ready_recipes(base_recipe_id)
  WHERE base_recipe_id IS NOT NULL;

-- Verify index:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'ready_recipes';
