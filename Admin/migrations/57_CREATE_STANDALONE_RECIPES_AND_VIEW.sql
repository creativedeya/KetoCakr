-- =====================================================
-- Phase 1: Simple Recipes (TikTok/Social Media Strategy)
-- Architecture: Variant B.2 — Separate Table + Union View
-- =====================================================
-- ВАЖНО: ready_recipes.id е UUID, standalone_recipes.id е SERIAL.
-- В all_recipes VIEW двата id-та се cast-ват към TEXT.
-- Mobile различава типовете чрез recipe_source + is_standalone флагове.
-- =====================================================


-- ============================================================
-- STEP 1: CREATE standalone_recipes TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.standalone_recipes (
  id                      SERIAL PRIMARY KEY,
  dessert_type_id         INTEGER REFERENCES public.dessert_types(id) ON DELETE SET NULL,

  -- Names
  name                    TEXT NOT NULL,
  name_en                 TEXT,
  name_bg                 TEXT,

  -- Descriptions
  description             TEXT,
  description_en          TEXT,
  description_bg          TEXT,

  -- Instructions (single text block — replaces 4-component puzzle structure)
  instructions            TEXT NOT NULL,
  instructions_bg         TEXT,
  instructions_en         TEXT,

  -- Nutrition per 100g (not total — total is calculated via total_weight_grams)
  calories_per_100g       DECIMAL(10, 2),
  protein_per_100g        DECIMAL(10, 2),
  fat_per_100g            DECIMAL(10, 2),
  carbs_per_100g          DECIMAL(10, 2),
  net_carbs_per_100g      DECIMAL(10, 2),
  fiber_per_100g          DECIMAL(10, 2),

  -- Servings & Weight
  total_weight_grams      INTEGER,
  servings                INTEGER DEFAULT 6,

  -- Media
  hero_image_url          TEXT,
  video_url               TEXT,

  -- Source metadata
  source_type             VARCHAR(50),          -- 'tiktok' | 'instagram' | 'website' | 'user'
  source_url              TEXT,
  video_duration_seconds  INTEGER,
  difficulty_level        VARCHAR(20),          -- 'easy' | 'medium' | 'hard'
  tags                    TEXT[],

  -- Engagement
  views                   INTEGER DEFAULT 0,
  likes                   INTEGER DEFAULT 0,

  -- User-created recipes
  user_id                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status (same pattern as ready_recipes)
  status                  VARCHAR(20) DEFAULT 'draft'
                            CHECK (status IN ('draft', 'published', 'archived')),

  -- Timestamps
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at            TIMESTAMP WITH TIME ZONE,

  CONSTRAINT standalone_name_unique UNIQUE(name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_standalone_dessert_type
  ON public.standalone_recipes(dessert_type_id);

CREATE INDEX IF NOT EXISTS idx_standalone_source_type
  ON public.standalone_recipes(source_type);

CREATE INDEX IF NOT EXISTS idx_standalone_tags
  ON public.standalone_recipes USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_standalone_user_id
  ON public.standalone_recipes(user_id);

CREATE INDEX IF NOT EXISTS idx_standalone_status
  ON public.standalone_recipes(status);

COMMENT ON TABLE public.standalone_recipes IS
  'Simple standalone recipes (TikTok/Instagram/user-created). Skip Puzzle Builder, go straight to Cooking Mode.';


-- ============================================================
-- STEP 2: CREATE all_recipes UNIFIED VIEW
-- Mobile uses this view to show both puzzle + simple recipes
-- ============================================================

CREATE OR REPLACE VIEW public.all_recipes AS

SELECT
  'ready'::VARCHAR(20)                                            AS recipe_source,
  id::TEXT                                                        AS id,
  dessert_type_id,
  COALESCE(name_en, name_bg, '')                                  AS name,
  name_bg,
  name_en,
  description_en,
  description_bg,
  hero_image_url,
  total_calories,
  total_net_carbs,
  total_servings,
  NULL::INTEGER                                                   AS total_weight_grams,
  tags,
  is_featured,
  published_at,
  created_at,
  FALSE                                                           AS is_standalone,
  (jsonb_array_length(COALESCE(selected_components, '[]'::jsonb)) > 0) AS requires_builder,
  NULL::TEXT                                                      AS video_url,
  NULL::VARCHAR(50)                                               AS source_type
FROM public.ready_recipes
WHERE status = 'published'

UNION ALL

SELECT
  'standalone'::VARCHAR(20),
  id::TEXT,
  dessert_type_id,
  COALESCE(name_en, name_bg, name),
  name_bg,
  name_en,
  description_en,
  description_bg,
  hero_image_url,
  ROUND(COALESCE(calories_per_100g, 0) * COALESCE(total_weight_grams, 100) / 100)::NUMERIC,
  ROUND(COALESCE(net_carbs_per_100g, 0) * COALESCE(total_weight_grams, 100) / 100)::NUMERIC,
  servings,
  total_weight_grams,
  tags,
  (published_at IS NOT NULL),
  published_at,
  created_at,
  TRUE,
  FALSE,
  video_url,
  source_type
FROM public.standalone_recipes
WHERE published_at IS NOT NULL

ORDER BY created_at DESC;

COMMENT ON VIEW public.all_recipes IS
  'Unified view: ready_recipes (puzzle, requires_builder=TRUE) + standalone_recipes (simple/TikTok, is_standalone=TRUE). Cast id to TEXT for uniform mobile handling.';


-- ============================================================
-- VERIFICATION QUERIES
-- Run these after migration to confirm success:
-- ============================================================

-- SELECT COUNT(*) FROM standalone_recipes;
--   → трябва да върне 0 (таблицата е празна)

-- SELECT COUNT(*) FROM all_recipes;
--   → трябва да е равно на броя published ready_recipes

-- SELECT DISTINCT recipe_source FROM all_recipes;
--   → трябва да върне само 'ready' (все още няма standalone)

-- SELECT DISTINCT is_standalone FROM all_recipes;
--   → трябва да върне само FALSE

-- SELECT * FROM all_recipes LIMIT 5;
--   → трябва да показва микс от колони (name_bg, name_en, hero_image_url и т.н.)
