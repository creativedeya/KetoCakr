-- =====================================================
-- Add Tags Support to Ready Recipes
-- =====================================================

-- Add tags array field
ALTER TABLE public.ready_recipes 
ADD COLUMN tags TEXT[] NULL DEFAULT '{}';

-- Add GIN index for fast tag searching
CREATE INDEX IF NOT EXISTS idx_ready_recipes_tags 
ON public.ready_recipes USING GIN(tags);

-- Add comment
COMMENT ON COLUMN public.ready_recipes.tags IS 'Array of tags for filtering and categorization. Example: [''chocolate'', ''birthday'', ''no-bake'']';

-- Example queries:
-- Search recipes with specific tag:
-- SELECT * FROM ready_recipes WHERE 'chocolate' = ANY(tags);

-- Search recipes with any of multiple tags:
-- SELECT * FROM ready_recipes WHERE tags && ARRAY['chocolate', 'birthday'];

-- Search recipes with all tags:
-- SELECT * FROM ready_recipes WHERE tags @> ARRAY['chocolate', 'no-bake'];
