# KetoCakR (BLAGO) — Project Status
Last updated: 2026-06-12 (session 2)

## Completed — Infrastructure
- [x] Localization: BG/EN bilingual system (useTranslation, localizedField)
- [x] Units: Metric/Imperial conversion (oz/fl oz)
- [x] Currency: Auto €/$ by language with manual override
- [x] Pan System: BakingPans.ts (7 round + 2 rectangular, volume-based scaling, 18cm/7" base = 8 servings)
- [x] Design system: Colors.ts + Theme.ts centralized (Ruby Red #A80048, Warm Beige #B2AC88)
- [x] Supabase schema with triggers (total_net_carbs = total_carbs - total_fiber)
- [x] Dev Container config (.devcontainer/)

## Completed — Admin Panel
- [x] Deployed to admin.ketocakelab.com (Vercel, Next.js preset)
- [x] Base recipes CRUD + AI step generation (Claude) + AI image generation (Replicate Flux)
- [x] Ready recipes CRUD + publish system
- [x] Ingredients database CRUD with nutrition per 100g
- [x] FatSecret API integration (OAuth 1.0a, per-100g normalization, Generic/Brand filter)
- [x] Analytics dashboard (basic stats from existing tables)
- [x] Assembly templates management
- [x] Image upload to Supabase Storage
- [x] Extended nutrition columns added (sodium, calcium, iron, magnesium, potassium, sugar, cholesterol, saturated_fat)
- [x] Simple recipes: PDF import pipeline (pdfjs-dist + Claude API batch parsing)
- [x] Simple recipes: Steps CRUD editor with timers, ingredient autocomplete
- [x] Simple recipes: form fields source_type/source_url REMOVED (not in base_recipes schema)

## Completed — Mobile App
- [x] Tab navigation (Home, Search, Create, Tools, Profile)
- [x] Home: Daily Delight, Hero image, role grid, recipe grid with filters
- [x] Search: Filters by type, calories, net carbs + debounced search
- [x] Create: Recipe Builder, nutrition per serving, image upload (FormData)
- [x] Tools: Baking timer (parallel), pan converter (2 modes), unit converter, macro calculator (Keto/LCHF/Custom)
- [x] Details: Unified RecipeDetailView for ready_recipes + user_recipes
- [x] Details: Servings +/-, price mode, shopping list integration
- [x] Shopping list: Category grouping, bilingual names
- [x] Zustand + AsyncStorage (not web APIs)
- [x] Split queries for tables without FK constraints

## Completed — Marketing & Launch Prep
- [x] Landing page at ketocakelab.com (static HTML, Vercel)
- [x] MailerLite welcome email + PDF guide ("The Keto Alchemist's Handbook")
- [x] Domain: ketocakelab.com + blagocake.app
- [x] Instagram: @blagocake
- [x] Marketing strategy defined (70-80% AI, 20-30% real content)

## Completed — Data & Content
- [x] 16 base cake layer recipes audited (AI-corrected, scored 8.5/10)
- [x] 95 lab notes extracted (LAB_NOTES.json, bilingual)
- [x] 120+ equipment entries extracted (EQUIPMENT_DATA.json, bilingual)
- [x] SQL migration files 00-06 created
- [x] 74 base recipes + 1 ready recipe in DB

## To-Do — Admin Panel & Backend
- [x] ✅ FIXED (2026-06-12): Simple recipes dual-table sync
      POST /api/simple-recipes → inserts into BOTH base_recipes AND ready_recipes
      PATCH /api/simple-recipes/[id] → updates BOTH tables on every save
- [x] ✅ FIXED (2026-06-12): Simple recipes API — inserts into recipe_ingredients table
- [x] ✅ FIXED (2026-06-12): Simple recipes API — ingredients_used[] populated with recipe_ingredients PKs
- [ ] SQL: Add base_recipe_id FK to ready_recipes for reliable simple recipe lookup
- [ ] SQL migration files 07 (lab notes INSERT), 08 (equipment INSERT), 09 (rollback)
- [ ] Lab Notes CRUD in admin dashboard
- [ ] Batch translate 111 steps to English (OpenAI API)
- [ ] Ingredients cleanup/deduplication tool
- [ ] Batch step generation for 12 recipes with few steps
- [ ] SQL replace "18 см" / "Ø18 см" in steps (script prepared)
- [ ] Translate assembly_templates instructions_bg to actual Bulgarian
- [ ] USDA FoodData Central API integration (batch import for 156 ingredients)
- [ ] Manual nutrition recalculation button in base recipe edit form
- [ ] Simple recipes: add dessert_type_id selection field in form + sync to ready_recipes
- [ ] SQL backfill: ready_recipes.dessert_type_id for existing simple recipes (run in Supabase SQL Editor)
- [ ] SQL backfill: ingredients_used[] in recipe_instruction_steps for simple recipes created before 2026-06-12

## To-Do — Mobile App
- [x] ✅ FIXED (2026-06-12): RecipeDetailView — weight shows "0g" for non-cake types
      Fix: hide weight display (total + per-serving) when displayValues.totalWeight === 0
- [x] ✅ FIXED (2026-06-12): Cooking mode (Tab 3) — ingredient list empty for simple recipes
      Fix: ingredients_used[] now populated with recipe_ingredients PKs (requires re-save in admin)
- [x] ✅ FIXED (2026-06-12): Dessert type label (Tab 1) missing for simple recipes
      Fix: dessertTypeId now falls back to simpleRecipe._meta?.dessert_type_id from ready_recipes
- [ ] Bug: "Encountered two..." error in Builder when switching roles
- [ ] Test expo-image-picker on real device
- [ ] Lab Notes tool in Tab 4
- [ ] Splash screen logo (requires production build)

## To-Do — Marketing
- [ ] Drip email sequence (story, social proof, launch announcement) — deferred until waitlist grows
- [ ] Social media content creation (Instagram, TikTok, Pinterest)

## Known DB Issues
1. recipe_instruction_steps — NO FK to base_recipes (use split queries)
2. ready_recipes — NO FK to dessert_types
3. 18 recipe_ingredients have NULL ingredient_database_id
4. Duplicates in ingredients_database (Яйца/Яйце/Цели яйца)
5. fiber_per_100g inconsistent (some entries = net carbs)
6. assembly_templates.instructions_bg is in English, instructions_en is NULL
7. ready_recipes.dessert_type_id is NULL for most simple recipes — backfill needed (SQL Editor)
8. ✅ FIXED: recipe_ingredients now populated by API for all new simple recipes (before 2026-06-12: needs backfill)
9. ✅ FIXED: ingredients_used[] now populated with PKs for all new simple recipes (before 2026-06-12: needs backfill)
10. ✅ FIXED: ready_recipes.total_weight_grams now synced from base_recipes on every save

## Architecture Rules (do not forget)

### Simple Recipes — Dual-Table Rule
Simple recipes (is_simple_recipe = true) are STANDALONE recipes — NOT part of the Puzzle Model.
They exist in BOTH tables simultaneously:
- base_recipes → source of truth for nutrition, ingredients, steps
- ready_recipes → publishable record visible to mobile users

RULE: Every write to base_recipes for a simple recipe MUST be mirrored to ready_recipes.
This applies to: name, name_en, description, description_en, image_url, servings,
all nutrition totals, published_at, status, dessert_type_id.

API routes responsible:
- POST /api/simple-recipes → inserts into both tables + recipe_ingredients + steps
- PATCH /api/simple-recipes/[id] → updates both tables on every field change

### RecipeDetailView — Dessert Type Handling
RecipeDetailView must work for ALL dessert types universally.
Pan-based calculations only apply to dessert_type_ids: 1 (cake), 2 (cheesecake), 5 (tart).
For all other types: use total_weight_grams directly, hide pan UI, hide form selector.
Never hardcode dessert type IDs in display logic — always check against a defined list.

### Ingredients in Simple Recipes
Simple recipes write ingredients to recipe_ingredients table on every POST/PATCH.
Cooking mode (Tab 3) reads recipe_ingredients via recipe_ingredients.id (integer PK).
ingredients_used[] in recipe_instruction_steps stores integer PKs of recipe_ingredients rows.
Every step gets all ingredient PKs (full ingredient list shown in cooking mode for every step).
Existing recipes created before 2026-06-12 need a one-time re-save to populate ingredients_used[].
