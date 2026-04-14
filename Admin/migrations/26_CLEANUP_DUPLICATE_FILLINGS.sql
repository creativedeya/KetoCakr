-- ============================================================
-- File: 26_CLEANUP_DUPLICATE_FILLINGS.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Description: Remove duplicate base_recipes for recipe_role_id = 3
--              Keeps the LATEST record (highest created_at) per name
--              Deletes all related data for the older duplicates first
-- ============================================================

-- Step 1: Preview duplicates (run this first to confirm)
-- SELECT name, COUNT(*) as count, array_agg(id ORDER BY created_at) as ids
-- FROM base_recipes
-- WHERE recipe_role_id = 3
-- GROUP BY name
-- HAVING COUNT(*) > 1;

-- Step 2: Delete related data for OLDER duplicate records
-- (keeps the latest id per name, deletes everything linked to older ids)

DELETE FROM recipe_equipment
WHERE recipe_id IN (
  SELECT id FROM base_recipes
  WHERE recipe_role_id = 3
    AND id NOT IN (
      SELECT DISTINCT ON (name) id
      FROM base_recipes
      WHERE recipe_role_id = 3
      ORDER BY name, created_at DESC
    )
);

DELETE FROM lab_notes
WHERE recipe_id IN (
  SELECT id FROM base_recipes
  WHERE recipe_role_id = 3
    AND id NOT IN (
      SELECT DISTINCT ON (name) id
      FROM base_recipes
      WHERE recipe_role_id = 3
      ORDER BY name, created_at DESC
    )
);

DELETE FROM recipe_instruction_steps
WHERE recipe_id IN (
  SELECT id FROM base_recipes
  WHERE recipe_role_id = 3
    AND id NOT IN (
      SELECT DISTINCT ON (name) id
      FROM base_recipes
      WHERE recipe_role_id = 3
      ORDER BY name, created_at DESC
    )
);

DELETE FROM recipe_ingredients
WHERE recipe_id IN (
  SELECT id FROM base_recipes
  WHERE recipe_role_id = 3
    AND id NOT IN (
      SELECT DISTINCT ON (name) id
      FROM base_recipes
      WHERE recipe_role_id = 3
      ORDER BY name, created_at DESC
    )
);

-- Step 3: Delete the older duplicate base_recipes
DELETE FROM base_recipes
WHERE recipe_role_id = 3
  AND id NOT IN (
    SELECT DISTINCT ON (name) id
    FROM base_recipes
    WHERE recipe_role_id = 3
    ORDER BY name, created_at DESC
  );

-- Step 4: Verify — should show 23 recipes, each appearing once
SELECT name, COUNT(*) as count
FROM base_recipes
WHERE recipe_role_id = 3
GROUP BY name
ORDER BY name;

-- Expected: 23 rows, all count = 1
