# TASK: Tarot Cards — Real DB Schema + Admin CRUD + Recipe-Filter Logic

> This replaces mock data (`Mobile/constants/mockTarotCards.ts`) with a real Supabase-backed
> system, adds a full Admin CRUD section (mirroring the Simple Recipes / Base Recipes admin
> pattern), and wires the "Виж рецепти" button on the mobile Ritual screen to real filtered
> recipe queries. Based on the project's tarot strategy report (`tarot_cards` schema proposal).

---

## PHASE 0 — Investigation (mandatory, report back before coding)

1. Read `admin/app/dashboard/simple-recipes/[id]/page.tsx` and the simple-recipes list page (`admin/app/dashboard/simple-recipes/page.tsx` or equivalent) — this is the pattern to mirror for the new Tarot Cards admin section (list view + detail/edit view, tabs if applicable, save/publish pattern).
2. Read `admin/app/api/simple-recipes/route.ts` and `[id]/route.ts` — pattern for the new Tarot Cards API routes.
3. Confirm `recipe_roles` table structure (`id`, `name`, `name_en`) — referenced for Minor Arcana role linkage.
4. Confirm `base_recipes` columns available for the recipe-list query used in the "Виж рецепти" filter (need: `id`, `name`/`name_en`, `image_url`, `total_net_carbs`, `difficulty_level`, `recipe_role_id`, `is_visible_to_users` or equivalent visibility flag — check exact column names, some may differ from the report's assumption).
5. Report findings — confirm the exact admin file paths you'll create, before writing code.

---

## PHASE 1 — Database schema

Run this SQL in Supabase (via the project's standard migration approach — check if there's a `migrations/` folder convention to follow, report if so):

```sql
create table public.tarot_cards (
  id uuid not null default gen_random_uuid(),
  card_number integer not null,              -- 0-21 Major, 1-14 Minor (Ace=1, Page=11, Knight=12, Queen=13, King=14)
  suit character varying(20) null,            -- null for Major; 'pentacles'/'cups'/'swords'/'wands' for Minor
  arcana_type character varying(10) not null, -- 'major' / 'minor'
  card_name character varying(100) not null,
  card_name_en character varying(100) null,
  theme character varying(150) null,          -- subtitle/keto sub-theme
  theme_en character varying(150) null,
  recipe_role_id integer null references public.recipe_roles(id),  -- Minor Arcana: which component role
  linked_recipe_id uuid null references public.base_recipes(id),    -- Major Arcana: direct full-cake link
  daily_phrase text not null,
  daily_phrase_en text null,
  energy_word character varying(50) not null,
  energy_word_en character varying(50) null,
  morning_tip text not null,
  morning_tip_en text null,
  daily_trap text not null,
  daily_trap_en text null,
  evening_question text not null,
  evening_question_en text null,
  card_image_url text null,
  is_published boolean not null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint tarot_cards_pkey primary key (id),
  constraint tarot_cards_unique_card unique (arcana_type, suit, card_number)
);

create index idx_tarot_cards_arcana_type on public.tarot_cards using btree (arcana_type);
create index idx_tarot_cards_suit on public.tarot_cards using btree (suit);
create index idx_tarot_cards_role on public.tarot_cards using btree (recipe_role_id);
create index idx_tarot_cards_published on public.tarot_cards using btree (is_published);

create trigger tarot_cards_updated_at before update on public.tarot_cards
  for each row execute function update_updated_at();
```

Note: `card_name`/`daily_phrase`/etc. (no `_bg` suffix) hold Bulgarian text per the project's existing convention (check `base_recipes` — it uses `name`/`name_en`, not `name_bg`/`name_en` — mirror that exact pattern here, NOT `_bg` suffixes, to stay consistent with the rest of the codebase).

---

## PHASE 2 — Admin CRUD section

### 2.1 List page — `admin/app/dashboard/tarot-cards/page.tsx`

- Table/grid view of all 78 cards, grouped or filterable by `arcana_type` (Major/Minor) and `suit`
- Columns: card image thumbnail, card_number (formatted per the numeral rules — Roman for Major, Arabic/letter for Minor), card_name, suit (color-coded chip), linked status (✅ if `linked_recipe_id` or `recipe_role_id` is set, ⚠️ if not), `is_published` toggle/badge
- "Add Card" button → links to a new-card form (or reuse the same detail page with no id, matching whatever pattern `simple-recipes` uses for create vs. edit)
- Quick filter chips: "Всички" / "Major Arcana" / "Пентакли" / "Чаши" / "Мечове" / "Жезли"
- Progress indicator at top: "X от 78 карти попълнени" (count where all required text fields are non-empty) — helpful for tracking data-entry progress

### 2.2 Detail/edit page — `admin/app/dashboard/tarot-cards/[id]/page.tsx`

Form sections (mirror the tabbed pattern from `simple-recipes` if one exists, e.g. Basic Info / Content / Publishing):

**Basic Info:**
- `arcana_type` (radio: Major / Minor)
- If Minor: `suit` dropdown (Пентакли/Чаши/Мечове/Жезли)
- `card_number` (number input — show live preview of how it will render: roman numeral / arabic / letter, using the same formatting logic that will live in the mobile app)
- `card_name` (bg) + `card_name_en`
- `theme` (bg) + `theme_en`
- Image upload — reuse the project's existing `ImageUpload` component (check `admin/components/ImageUpload.tsx` usage pattern from simple-recipes) for `card_image_url`, bucket likely `recipe-images` or a new `tarot-images` bucket (check Phase 0 findings / ask if a dedicated bucket should be created — default to creating `tarot-images` bucket if none specified)

**Recipe Linkage:**
- If `arcana_type === 'major'`: searchable dropdown/autocomplete to select `linked_recipe_id` from `base_recipes` (search by name, show thumbnail)
- If `arcana_type === 'minor'`: dropdown to select `recipe_role_id` from `recipe_roles`

**Ritual Content:**
- `energy_word` (bg) + `energy_word_en` — short text inputs
- `daily_phrase` (bg) + `daily_phrase_en` — textarea
- `morning_tip` (bg) + `morning_tip_en` — textarea
- `daily_trap` (bg) + `daily_trap_en` — textarea
- `evening_question` (bg) + `evening_question_en` — textarea

**Publishing:**
- `is_published` toggle
- Save / Save & Publish buttons (mirror `simple-recipes` save pattern)

### 2.3 API routes

- `admin/app/api/tarot-cards/route.ts` — GET (list, with optional `arcana_type`/`suit` filters), POST (create)
- `admin/app/api/tarot-cards/[id]/route.ts` — GET (single), PATCH (update), DELETE

Mirror the exact `createClient`/`SUPABASE_SERVICE_ROLE_KEY`/`export const dynamic = 'force-dynamic'` pattern from `simple-recipes` API routes.

### 2.4 Bulk import helper (for the 56 existing cards with cake photos)

Since the user already has 56 cards' worth of content drafted (in markdown) and photos ready, add a simple bulk-import path to reduce manual re-typing:

- `admin/app/dashboard/tarot-cards/import/page.tsx` — a simple page with a large textarea where the user can paste a JSON array matching the `tarot_cards` shape (one object per card), and a "Import" button that POSTs to a new `admin/app/api/tarot-cards/bulk-import/route.ts` endpoint, inserting all rows via `upsert` (on the `arcana_type, suit, card_number` unique constraint, so re-running with corrections doesn't create duplicates)
- This lets Deyana (or Claude, in a future session) convert the existing markdown content into JSON once, then paste it in — much faster than 78 manual form submissions, while still giving the form-based editor for one-off corrections afterward
- Validate the JSON shape server-side before inserting; return a clear per-row error report if any rows fail validation (e.g. "Row 12: missing daily_phrase")

---

## PHASE 3 — Mobile: real data + "Виж рецепти" filtering

### 3.1 Replace mock data with Supabase queries

In `Mobile/constants/mockTarotCards.ts`'s call sites (the `TarotDailyCardSection` component and the two screens `card-face.tsx`/`ritual.tsx`):

- Replace `pickCardOfTheDay()` (mock, date-seeded random) with a Supabase query that fetches a random/deterministic **published** card from `tarot_cards`, still seeded by date for consistency (everyone gets the same card on the same day is fine — no need for per-user randomization unless previously decided otherwise):
  ```ts
  const { data } = await supabase
    .from('tarot_cards')
    .select('*')
    .eq('is_published', true);
  // then pick by date-seed % data.length, same logic as before, just real data now
  ```
- Card Face / Ritual screens: fetch by `id` param from `tarot_cards` instead of the mock array lookup
- Keep the `AsyncStorage` `drawnToday` persistence logic as-is (still client-side, per-device — that's fine for now per the report's §3.4 simplicity recommendation)

### 3.2 "Виж рецепти" / "Виж рецептата" button logic

On the Ritual screen, replace the current `console.log` placeholder:

**If `arcanaType === 'major'`:**
```ts
router.push(`/recipe-detail/${card.linked_recipe_id}`);
```
(Direct navigation to the existing recipe-detail screen — no type param needed since `detectRecipeType` already handles detection correctly per the earlier session's fix.)

**If `arcanaType === 'minor'`:**
Navigate to a new filtered list screen, e.g. `Mobile/app/tarot/recipes-by-role.tsx`, passing `recipe_role_id` as a param:
```ts
router.push({ pathname: '/tarot/recipes-by-role', params: { roleId: card.recipe_role_id, roleName: card.theme } });
```

This new screen:
- Header: back chevron + title using the role name (e.g. "Рецепти с пандишпанов блат")
- Query:
  ```ts
  const { data } = await supabase
    .from('base_recipes')
    .select('id, name, name_en, image_url, total_net_carbs, difficulty_level')
    .eq('recipe_role_id', roleId)
    .eq('is_visible_to_users', true) // confirm exact column name from Phase 0
    .order('name');
  ```
- Renders a grid of recipe cards (reuse whatever `RecipeCard`-style component already exists elsewhere in the app — check `Mobile/components/` for an existing reusable card component before building a new one) — each showing thumbnail, name, net carbs, difficulty
- Tapping a card → `router.push('/recipe-detail/${id}')`

---

## Constraints
- Mirror existing admin patterns exactly (don't invent new conventions for forms/tables/API routes when `simple-recipes` already establishes one).
- Use `name`/`name_en` style columns (no `_bg` suffix), matching `base_recipes` convention.
- All admin writes go through API routes with `SUPABASE_SERVICE_ROLE_KEY`, never anon key — per project's established rule.
- Add `export const dynamic = 'force-dynamic'` to all new API routes — per project's established rule.
- Token efficiency: keep all new file comments/internal naming in English per project convention; only user-facing strings are bilingual.

## Out of scope (still future work)
- AI-generation pipeline for the remaining 22 Major Arcana illustrations
- Physical product (Channel B): QR codes, public slug pages, `physical_product_codes` table
- Draw-streak / most-drawn-card analytics tracking
- Dedicated Instagram Stories share image export (generic share sheet already implemented)

## Session start
Read `CLAUDE.md`, `CLAUDE_CODE_TASK.md`, and the three prior tarot task files for context on what mobile-side work already exists (`TASK_TAROT_HOME_FINAL.md`, `TASK_TAROT_NAVIGATION_REVISION.md`, `TASK_TAROT_VISUAL_FIXES_R1.md`). Complete Phase 0 investigation, report findings, wait for go-ahead before Phase 1.