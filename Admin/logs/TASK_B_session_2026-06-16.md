# TASK B Session Report — 2026-06-16

## Phase 0 — Findings

### 0.1 dessert_types columns
- Confirmed from CLAUDE.md + API route: `name` (BG), `name_en`
- View uses `dt.name AS dessert_type_name_bg`, `dt.name_en AS dessert_type_name_en`

### 0.2 ready_recipes columns (user-confirmed)
All Phase 1 whitelist columns confirmed present:
`id, slug, name_en, name_bg, description_en, description_bg, hero_image_url,
dessert_type_id, difficulty_level, is_free, total_servings, total_weight_grams,
total_calories, total_protein, total_fat, total_carbs, total_net_carbs,
tags, serving_container, published_at`

CLAUDE.md was wrong: `dessert_type_id` DOES exist — JOIN is valid.
No `total_fiber` column — not included in view.

Blacklisted columns confirmed present (excluded from view):
`status, estimated_cost, cost_currency, selling_price, price_currency,
cost_calculated_at, assembly_template_id, selected_components,
custom_intro_text_bg, custom_intro_text_en, hero_image_reference_url,
hero_image_prompt_notes, hero_image_corrections, serving_container_id,
is_featured, created_at, updated_at`

### 0.3 Slug population
Not queried — user to verify. View uses `WHERE status = 'published' AND published_at IS NOT NULL`.
If any published row has NULL slug, `app_url` will be `https://ketocakelab.com/recipe/null`.

### 0.4 View existence
Using `CREATE OR REPLACE VIEW` — handles both create and update.

---

## Files Created

| File | Purpose |
|------|---------|
| `Supabase/migrations/10_public_ready_recipes_view.sql` | View DDL — run manually in Supabase SQL Editor |
| `Admin/app/api/public/recipes/route.ts` | List + search endpoint |
| `Admin/app/api/public/recipes/[slug]/route.ts` | Single-recipe endpoint |

---

## Manual Step Required

Run migration in Supabase SQL Editor:
```
Supabase/migrations/10_public_ready_recipes_view.sql
```

Then verify:
```sql
SELECT * FROM public_ready_recipes LIMIT 1;
```

---

## Acceptance Tests (run after migration)

```
GET /api/public/recipes?max_net_carbs=5&limit=3
GET /api/public/recipes?query=шоколад
GET /api/public/recipes/<known-slug>
GET /api/public/recipes/<unknown-slug>  → 404
```
