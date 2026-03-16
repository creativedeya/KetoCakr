# KetoCakR Admin Panel

## Проект
Уеб администраторски панел за управление на KetoCakR / BLAGO. Използва се за управление на рецепти, съставки, готови рецепти, AI генерация на изображения и стъпки.

## Tech Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (utility-first — ОК за уеб, за разлика от мобилния проект)
- Supabase (PostgreSQL) — споделена БД с мобилното приложение
- lucide-react за икони (НЕ lucide-react-native!)
- @anthropic-ai/sdk — Claude AI за генерация на стъпки
- openai + replicate — генерация на изображения

## Критични правила
- НИКОГА не инсталирай нови npm пакети без одобрение
- Tailwind CSS е ОК тук (не е NativeWind)
- lucide-react е ОК (не lucide-react-native)
- НЕ пипай споделени Supabase таблици без да знаеш ефекта върху мобилното приложение
- API routes са в app/api/ — използват Route Handlers (Next.js App Router)
- .env.local съдържа Supabase + AI API ключове — никога не ги commit-вай

## Структура
```
app/
  api/                    — Next.js Route Handlers
    generate-recipe-images/
    generate-step-image/
    generate-steps/
    upload-step-image/
  dashboard/              — Основни admin екрани
    analytics/
    assembly-templates/
    base-recipes/         — CRUD + AI стъпки + изображения
    dessert-types/
    ingredients/
    ready-recipes/        — CRUD + публикуване
    settings/
    users/
  login/
components/               — Споделени React компоненти
  AssemblyTemplateSelector.tsx
  ImageGenerationPanel.tsx
  ImageUpload.tsx
  IngredientsEditor.tsx
  TagInput.tsx
lib/
  supabase.ts             — Supabase client
  equipmentlibrary.ts
  ingredientParser.ts
  utils.ts
types/
  image-generation.ts
migrations/               — SQL миграции
notes/                    — Obsidian vault
  DevLogs/Admin/          — Admin DevLogs
```

## Supabase ключови таблици (споделени с Mobile!)

### base_recipes
- id: uuid (PK)
- name, name_en, description, description_en
- recipe_role_id (FK → recipe_roles)
- image_url, image_url_1, image_url_2
- prep_time_minutes, bake_time_minutes (НЯМА bake_temp_celsius!)
- servings (НЕ total_servings!)
- total_weight_grams, total_calories, total_protein, total_fat, total_carbs, total_net_carbs
- equipment_notes, equipment_notes_en
- **ВНИМАНИЕ:** При SELECT * Supabase прави автоматичен JOIN към ingredients_database. Използвай explicit колони при вложени JOINs.

### ready_recipes
- id: uuid (PK)
- name_bg, name_en (НЯМА просто name!)
- hero_image_url (НЯМА image_url!)
- selected_components: JSONB масив с {recipe_role_id, base_recipe_id, order_index, multiplier}
- status: 'draft' | 'published' | 'archived'
- is_featured: boolean
- assembly_template_id (FK → assembly_templates)
- total_servings, total_calories, total_protein, total_fat, total_carbs, total_net_carbs
- **ВНИМАНИЕ:** НЯМА FK към dessert_types — не прави JOIN!

### ingredients_database
- id: uuid (PK)
- name_en, name_bg
- category_id (FK → ingredient_categories) — НЯМА колона category!
- calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g
- default_price, default_currency, price_unit
- unit_weight_grams

### ingredient_categories
- id: serial (PK)
- name (BG), name_en (EN)
- 11 категории: Брашна, Подсладители, Мазнини, Млечни, Яйца, Шоколад, Ядки, Подправки, Разпускатели, Желиращи, Други

### recipe_ingredients
- recipe_id (FK → base_recipes)
- ingredient_name (текст, може да е грешен)
- ingredient_database_id (FK → ingredients_database, МОЖЕ ДА Е NULL!)
- quantity, unit, order_index

### recipe_instruction_steps
- recipe_id (FK по convention, но НЯМА FK CONSTRAINT!)
- step_number, step_description, step_description_bg, step_description_en
- step_image_url, step_duration_minutes
- **ВНИМАНИЕ:** 111 стъпки нямат step_description_en (от общо 660)

### assembly_templates
- id: serial (PK)
- template_key, name
- instructions, instructions_bg, instructions_en
- compatible_dessert_types: integer[] (масив с dessert_type_id)
- **ВНИМАНИЕ:** instructions_bg реално съдържа EN текст — трябва превод!

### Други таблици
- dessert_types — id, name (BG), name_en, image_url
- recipe_roles — id, name (BG), name_en, image_url
- recipe_tags + ready_recipe_tags — таг система за рецепти
- user_recipes — user_image_url за потребителски снимки

## Известни DB проблеми (КРИТИЧНО!)
1. recipe_instruction_steps НЯМА FK constraint към base_recipes
2. ready_recipes НЯМА FK към dessert_types
3. 18 recipe_ingredients нямат ingredient_database_id (NULL)
4. Дубликати в ingredients_database (Яйца/Яйце/Цели яйца)
5. 23 стъпки съдържат "18 см" / "Ø18 см" — трябва замяна
6. assembly_templates.instructions_bg е на английски, instructions_en е NULL

## Бранд цветове
- Primary: #A80048 (Ruby Red)
- Secondary: #B2AC88 (Warm Beige)
- Background: #FFFFFF / #F8F9FA / #FFF5F8
- Text: #333333 / #666666

## AI Интеграции
- **Генерация на стъпки**: Claude (Anthropic) → `/api/generate-steps`
- **Генерация на изображения**: Replicate / OpenAI → `/api/generate-recipe-images`, `/api/generate-step-image`
- **Upload**: Supabase Storage → `/api/upload-step-image`

## Планирани задачи за Admin
- [ ] Batch превод на 111 стъпки без EN (OpenAI API)
- [ ] Ingredients cleanup/deduplication tool
- [ ] Batch генерация на стъпки за 12 рецепти с малко стъпки
- [ ] SQL замяна на "18 см" в стъпки
- [ ] Превод на assembly_templates instructions_bg на български