-- Public showcase view. ONLY whitelisted columns. No steps/ingredients/cost.
-- Phase 0 confirmed: dessert_types uses `name` (BG) + `name_en`.
-- ready_recipes.dessert_type_id confirmed to exist (col 0.2).
CREATE OR REPLACE VIEW public_ready_recipes AS
SELECT
  r.id,
  r.slug,
  r.name_en,
  r.name_bg,
  r.description_en,
  r.description_bg,
  r.hero_image_url,
  r.dessert_type_id,
  dt.name    AS dessert_type_name_bg,
  dt.name_en AS dessert_type_name_en,
  r.difficulty_level,
  r.is_free,
  r.total_servings,
  r.total_weight_grams,
  r.total_calories,
  r.total_protein,
  r.total_fat,
  r.total_carbs,
  r.total_net_carbs,
  r.tags,
  r.serving_container,
  r.published_at
FROM ready_recipes r
LEFT JOIN dessert_types dt ON dt.id = r.dessert_type_id
WHERE r.status = 'published'
  AND r.published_at IS NOT NULL;

GRANT SELECT ON public_ready_recipes TO anon, authenticated;
