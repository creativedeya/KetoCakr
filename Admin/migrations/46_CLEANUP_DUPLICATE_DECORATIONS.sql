-- ============================================================
-- File: 46_CLEANUP_DUPLICATE_DECORATIONS.sql
-- Project: KetoCakR | Date: 2026-04-07
-- Description: Remove duplicate base_recipes for recipe_role_id = 4
--              Keeps the LATEST record (highest created_at) per name
-- ============================================================

-- Step 1: Preview (uncomment to check first)
-- SELECT name, COUNT(*) as count, array_agg(id ORDER BY created_at) as ids
-- FROM base_recipes
-- WHERE recipe_role_id = 4
-- GROUP BY name
-- HAVING COUNT(*) > 1;

-- Step 2: Delete related data for OLDER duplicates

DELETE FROM recipe_equipment
WHERE recipe_id IN (
  SELECT id FROM base_recipes
  WHERE recipe_role_id = 4
    AND id NOT IN (
      SELECT DISTINCT ON (name) id
      FROM base_recipes
      WHERE recipe_role_id = 4
      ORDER BY name, created_at DESC
    )
);

DELETE FROM lab_notes
WHERE recipe_id IN (
  SELECT id FROM base_recipes
  WHERE recipe_role_id = 4
    AND id NOT IN (
      SELECT DISTINCT ON (name) id
      FROM base_recipes
      WHERE recipe_role_id = 4
      ORDER BY name, created_at DESC
    )
);

DELETE FROM recipe_instruction_steps
WHERE recipe_id IN (
  SELECT id FROM base_recipes
  WHERE recipe_role_id = 4
    AND id NOT IN (
      SELECT DISTINCT ON (name) id
      FROM base_recipes
      WHERE recipe_role_id = 4
      ORDER BY name, created_at DESC
    )
);

DELETE FROM recipe_ingredients
WHERE recipe_id IN (
  SELECT id FROM base_recipes
  WHERE recipe_role_id = 4
    AND id NOT IN (
      SELECT DISTINCT ON (name) id
      FROM base_recipes
      WHERE recipe_role_id = 4
      ORDER BY name, created_at DESC
    )
);

-- Step 3: Delete older duplicate base_recipes
DELETE FROM base_recipes
WHERE recipe_role_id = 4
  AND id NOT IN (
    SELECT DISTINCT ON (name) id
    FROM base_recipes
    WHERE recipe_role_id = 4
    ORDER BY name, created_at DESC
  );

-- Step 4: Verify — should show 13 decorations, all count = 1
SELECT name, COUNT(*) as count
FROM base_recipes
WHERE recipe_role_id = 4
GROUP BY name
ORDER BY name;

-- Expected: 13 rows, all count = 1
