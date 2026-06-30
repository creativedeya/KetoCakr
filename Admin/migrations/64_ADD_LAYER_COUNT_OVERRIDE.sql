-- ── Migration 64: Add layer_count_override to ready_recipes ──────────────────
--
-- PURPOSE: Allow per-recipe manual override of the physical base-layer count
-- used in hero image generation prompts.
--
-- Context: assembly_template_steps encode a GENERIC algorithm (e.g. "repeat
-- for middle layers"), not a literal per-layer enumeration. The actual number
-- of physical base layers for a specific published recipe is a manual creative
-- choice (e.g. one "carrot sponge" base recipe might be baked as 2 sponges
-- cut into 4 layers, or as 1 sponge cut into 3). This cannot be derived
-- programmatically from selected_components or the template.
--
-- Semantics:
--   NULL  = use the template's natural count of role=1 & step_type='layer'
--           rows (already correct for single-base templates like muffins/
--           cheesecake/tart — no override needed for those).
--   1..N  = explicit override: generate prompt with exactly N base layers,
--           expanding the template's "between-layers unit" (cream/filling
--           steps) to match.
--
-- The admin UI shows the "Брой блатове" input ONLY for multi-layer templates
-- (those with COUNT WHERE recipe_role_id=1 AND step_type='layer' > 1).
-- For single-base templates the input is hidden and this column is ignored.
--
-- Safe to re-run (IF NOT EXISTS guard via column check is not available for
-- ALTER TABLE ADD COLUMN, so use try/catch in Supabase; or just run once).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.ready_recipes
  ADD COLUMN IF NOT EXISTS layer_count_override integer NULL;

-- ── Verify ────────────────────────────────────────────────────────────────────
-- Run after the ALTER TABLE to confirm the column exists:
--
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'ready_recipes'
--   AND column_name = 'layer_count_override';
--
-- Expected: 1 row — layer_count_override, integer, YES
