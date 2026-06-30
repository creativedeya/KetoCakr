-- ── Migration 63: Add recipe_role_id + step_type to assembly_template_steps ───
--
-- PURPOSE: Enable programmatic layer-count and layer-sequence extraction for
-- hero image generation. Previously only free-text descriptions existed; now
-- each step is classified by WHAT role component it involves (recipe_role_id)
-- and WHAT KIND of action it performs (step_type).
--
-- ONLY this migration is needed — ready_recipes.assembly_template_id already
-- exists and does not need to be added again.
--
-- Column semantics:
--   recipe_role_id  — which component role this step relates to:
--                     1=база/блат, 2=крем, 3=плънка, 4=декор, NULL=no specific role
--   step_type       — what kind of assembly action:
--                     'layer'         = structural layer placed in the stack (counts toward layer count)
--                     'outer_coating' = applying a component around the cake's exterior (NOT a stack layer)
--                     'prep'          = cutting/preparing before assembly (e.g. splitting sponges)
--                     'rest'          = chilling/resting/freezing steps
--                     'decoration'    = final garnish/decoration steps
--                     'other'         = anything not fitting the above
--
-- CRITICAL: Only rows with step_type = 'layer' count toward the cake's layer sequence/count.
--           Outer coating, prep, rest, and decoration steps are described separately.
--
-- Run in Supabase SQL editor. Safe to re-run (IF NOT EXISTS guards).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.assembly_template_steps
  ADD COLUMN IF NOT EXISTS recipe_role_id integer NULL,
  ADD COLUMN IF NOT EXISTS step_type varchar(20) NULL
    CHECK (step_type IN ('layer', 'outer_coating', 'prep', 'rest', 'decoration', 'other'));

-- ── Verify ────────────────────────────────────────────────────────────────────
-- Run this after the ALTER TABLE to confirm both columns exist:
--
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'assembly_template_steps'
--   AND column_name IN ('recipe_role_id', 'step_type')
-- ORDER BY column_name;
--
-- Expected result: 2 rows — recipe_role_id (integer, YES), step_type (character varying, YES)
