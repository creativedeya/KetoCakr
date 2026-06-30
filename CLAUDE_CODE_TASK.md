
KetoCakr

Fable 5 is temporarily unavailable.
Learn more(opens in new tab)


How can I help you today?


Приоритизиране на Project_status за издаване на приложението
Last message 6 minutes ago
Коригиране на грешка в схемата на base_recipes
Last message 50 minutes ago
Приложението и бъдещето на AI агентите
Last message yesterday
Избор на нутриентни данни при добавяне на съставка
Last message 5 days ago
Продължаване на проекта
Last message 7 days ago
KetoCakR project session summary and pending fixes
Last message Jun 5
Грешка при генериране на визуализация на рецепта
Last message Jun 4
PDF parsing options for migration report
Last message Jun 2
Barry pana cotta recipe display issues
Last message Jun 1
Защита на съдържание при разработка на рецептно приложение
Last message May 21
KetoCakR admin panel - sweetener mode и equipment manager
Last message May 19
KetoCakr админ панел - интеграция на компоненти
Last message May 5
Преглед на файловете на проекта
Last message May 1
Помощен инструмент с lab note
Last message Apr 22
Достъп до файлове на KetoCakR проект
Last message Apr 21
Миграция на базови рецепти.
Last message Apr 21
Upload на кадри - нарушение на row-level security
Last message Apr 18
Real-time cake visualization architecture
Last message Apr 14
Визуализация на стъпки от рецепти с Recraft API
Last message Apr 14
Consistent visual equipment library for recipe app
Last message Apr 13
KetoCakR admin panel nutrition features
Last message Apr 12
Функционалност за дублиране и изтриване на рецепти
Last message Apr 10
Оптимизация на работния процес и намаляване на разхода на токени
Last message Apr 10
Позициониране на здравословното приложение
Last message Apr 7
FatSecret база данни филтриране по 100 грама
Last message Apr 6
Преминаване на по-висок абонаментен план
Last message Apr 4
Избор на хостинг за Keto Cake Lab
Last message Mar 24
SQL за проверка и коригиране на роли в рецепти
Last message Mar 16
Migration tasks and system updates
Last message Mar 16
Untitled
Last message Mar 16
Memory
Only you
Purpose & context Deyana is the solo developer and project owner of KetoCakR (brand: BLAGO / Emma's Cake Studio), a bilingual (Bulgarian/English) keto dessert recipe platform built under Magisoft EOOD. The project targets keto/low-carb home bakers, primarily English-speaking women aged 25–45. Stack: React Native/Expo SDK 54 (mobile) + Next.js 14 admin panel at admin.ketocakelab.com + Supabase PostgreSQL backend. Local dev at C:\Dev\KetoCakR\. Brand: Ruby Red #A80048, Warm Beige #B2AC88. Core model: "Puzzle" system — users combine base components (блат/cream/плънка/декор) into assembled ready recipes. Admin curates base recipes; mobile surfaces readyrecipes to users. Key people/resources: Claude (planning/architecture) + Claude Code (execution). Workflow: Deyana describes bugs in Bulgarian → Claude produces task markdown files with strreplace blocks → Claude Code executes locally. --- Current state Active development on KetoCakR admin panel (Simple Recipes mode) and mobile app: Dual-table sync rule established: every simple recipe must exist in both baserecipes (source of truth) and readyrecipes (publishable for mobile). POST/PATCH routes were failing due to schema mismatches — fixes tasked/applied. New [id]/route.ts created (GET/PATCH/DELETE with full cascade across readyrecipes, recipeinstructionsteps, recipeingredients); steps/route.ts created for StepsEditor. Bugs resolved recently: sourcetype/sourceurl removed from form (not in schema); step timer default → 0; Bulk Parse toggle added (Claude API); dessert type dropdown fixed (correct column is name, not namebg); ingredientsused upsert-by-step-number replaces delete+reinsert; Cyrillic unit strings (г, мл, ч.л., бр) now recognized in CASE statements; defaultpieceweightgrams added to ingredientsdatabase. 5 orphan readyrecipes rows (no matching baserecipes) identified, queued for deletion. publicreadyrecipes view designed for safe vitrine exposure (public website + future MCP tool). Mobile serving mode toggle ("📐 Скалирай / ✂️ Режи") designed for RecipeDetailView. --- On the horizon Delete orphan readyrecipes records. Verify mobile weight display after cache clear. Full 20-recipe PDF import test (7-recipe version confirmed working). Add missing ingredients to ingredientsdatabase; set desserttypeid on imported recipes; publish readyrecipes from draft. Add recipe images manually for imported recipes. Per-ingredient nutrition lookup with "Compare all 3 sources" mode (USDA / FatSecret / Open Food Facts) — tasked, pending execution. Equipment reference photos in Gemini step image generation (Phase 0 investigation pending). Future: camera angle selectors, background/lighting style variants for AI image generation. --- Key learnings & principles Dual-table sync is the core architectural rule for simple recipes — always write to both baserecipes and readyrecipes; never pass baserecipes.id into readyrecipes (it generates its own UUID). RLS bypass pattern: all privileged DB writes must route through API routes using SUPABASESERVICEROLEKEY, never the anon key directly. Gemini image gen: use direct fetch to REST API (not SDK) — SDK has a known inlineData bug. No negative prompts (increase hallucinations). Prompts in English (token cost). Correct model: gemini-2.5-flash-image. Cyrillic unit handling must be explicit in SQL CASE statements; loose substring matching causes incorrect cost/nutrition calculations. Recipe name upsert logic must target by primary key ID, not namebg — upsert-by-name creates duplicates. Sugar alcohols (erythritol, xylitol, allulose) must be excluded from totalcarbs and totalfiber in nutrition triggers. Nutrition accuracy: store per-100g values; use PostgreSQL triggers for automatic recalculation; fix at DB level rather than UI workarounds. Existing functionality must never disappear unless explicitly requested. Fix issues permanently at source; never apply UI workarounds to mask data problems. baserecipes does NOT have desserttypeid, sourceurl, or labnotesbg/en columns. equipment table uses name (Bulgarian) and nameen — no namebg column. readyrecipes has no FK to baserecipes or desserttypes; always split queries for tables without FK constraints. API routes require export const dynamic = 'force-dynamic' to prevent stale cache. ingredientsused in recipeinstructionsteps is the field the mobile cooking mode reads — admin panel must write to it on save. --- Approach & patterns Task file workflow: Claude produces precise .md task files with strreplace anchors → Claude Code executes → Deyana reports results → debugging continues if needed. Prefer surgical edits over full file rewrites. Debugging loop: when Claude Code reports success but browser doesn't reflect change, likely editing wrong component — verify exact file being modified. DB verification: Supabase SQL Editor used for ground-truth queries before and after changes. Testing: local dev server (npm run dev) + hard refresh. Session discipline: new session per topic change; context compressed at 60% fill; heavy tasks delegated to sub-agents. Recipe name mapping between AI-generated content and exact DB names is a recurring error source — always run SELECT name FROM baserecipes for ground truth before generating SQL. Python scripts used for large SQL file generation from JSON (not manual SQL writing). --- Tools & resources AI: Claude (planning) + Claude Code (execution) + Claude API (Bulk Parse in admin) + Gemini REST API (gemini-2.5-flash-image) for step image generation Nutrition APIs: USDA FoodData Central, FatSecret (OAuth 1.0a, filter Generic/Brand client-side), Open Food Facts (User-Agent header + retry needed) Storage: Supabase Storage buckets: base-recipe-images, equipment PDF parsing: pdfjs-dist v3.11.174 (legacy build) + Claude API for structured extraction (maxtokens: 16000, batch size reduced to avoid truncation) Image AI: Google Gemini Flash Image (billing enabled); Recraft V4 as backup Key project paths: admin C:\Dev\KetoCakR\Admin\, Supabase migrations C:\Dev\KetoCakR\Supabase\migrations\, components C:\Dev\KetoCakR\Admin\components\, API routes C:\Dev\KetoCakR\Admin\app\api\ Domains: ketocakelab.com (landing), admin.ketocakelab.com (admin panel) Email: MailerLite (welcome automation with PDF guide confirmed working) --- Other instructions Token optimization rules: (1) All internal instructions, skills, system prompts in English (Cyrillic costs 1.5–2× tokens). (2) Respond to user in Bulgarian, concise. (3) Keep CLAUDE.md under 200 lines. (4) Compress context at 60% fill. (5) Batch/plan steps before execution. (6) Delegate heavy tasks to sub-agents. (7) New session per topic change. (8) External memory tiers: short/long/operational — load archived data only when needed.

Last updated 1 hour ago

Instructions
Add instructions to tailor Claude’s responses

Files
1% of project capacity used

ROADMAP.md
141 lines

md



PROJECT_STATUS.md
128 lines

md



CLAUDE_CODE_TASK.md
151 lines

md


CLAUDE_CODE_TASK.md


# KetoCakR Mobile — Task Spec
 
> See CLAUDE.md for stack, hard rules, DB schema, and brand colors.
> This file covers screen specs and execution phases only.
 
---
 
## Goal
Build a stable, functional mobile app foundation. All screens must use centralized design files (constants/Colors.ts + constants/Theme.ts). Zero hardcoded colors or sizes.
 
---
 
## File Structure
 
```
Mobile/app/
├── _layout.tsx                    — Root layout (QueryClientProvider)
├── index.tsx                      — Entry redirect
├── (auth)/ signin.tsx, signup.tsx
├── (tabs)/
│   ├── _layout.tsx                — Tab bar
│   ├── home/index.tsx             — TAB 1
│   ├── search/index.tsx           — TAB 2
│   ├── create/index.tsx           — TAB 3
│   ├── tools/index.tsx            — TAB 4
│   ├── profile/index.tsx          — TAB 5
│   ├── recipes/index.tsx
│   └── shopping-list.tsx
├── (modals)/ recipe-generator.tsx, visual-recipe-builder.tsx
├── recipe-detail/[id].tsx
├── user-recipe/[id].tsx
├── favorites/, settings/, shopping-list/, subscription/
```
 
---
 
## Execution Order
 
### PHASE 1: Design System + Tab Navigation
**Goal:** All screens use Colors/Theme, working tab bar.
 
**1.1 Tab Bar** — `(tabs)/_layout.tsx`
- 5 tabs: Home | Search | Create | Tools | Profile
- Icons: Ionicons (home, search, add-circle, construct, person)
- Active: Colors.primary.main, Inactive: Colors.text.tertiary
- Icon size: IconSize.md, Labels: caption size
**1.2 Root Layout** — `_layout.tsx`
- QueryClientProvider wrapper, Stack nav for modals, hide header for tabs
**1.3 Refactor existing screens**
- Replace all hardcoded colors → Colors.xxx
- Replace all hardcoded sizes → Typography/Spacing
- Replace lucide-react-native → @expo/vector-icons
---
 
### PHASE 2: Home Screen — `(tabs)/home/index.tsx`
 
**2.1 Header** — Greeting text + notification bell (decorative)
 
**2.2 Daily Delight** — Random base_recipe with hero image, gradient overlay, CTA → recipe-detail/[id]. Placeholder if no image_url.
 
**2.3 Create Your Masterpiece** — 2x2 grid of 4 roles (Crust/Cream/Filling/Decoration) + "Start Creating" → visual-recipe-builder
 
**2.4 Your Creations** — Horizontal ScrollView of user_recipes. First card: "+ Create new". Empty state if none.
 
**2.5 Filter Pills + Recipe Grid** — Horizontal chips from dessert_types ("All" default active). Grid of base_recipes filtered by type. RecipeCard with image, name, nutrition badge.
 
**Queries:**
```typescript
// Daily Delight
supabase.from('base_recipes').select('*').limit(1).order('created_at', { ascending: false })
// User Recipes
supabase.from('user_recipes').select('*, dessert_type:dessert_types(*)').order('created_at', { ascending: false }).limit(6)
// Dessert Types
supabase.from('dessert_types').select('*').order('name')
// Filtered
supabase.from('base_recipes').select('*, recipe_role:recipe_roles(name)').eq('dessert_type_id', selectedTypeId)
```
 
---
 
### PHASE 3: Search Screen — `(tabs)/search/index.tsx`
 
- Search bar with debounce (300ms), placeholder "Search recipes..."
- Filter chips: by dessert_type + macro profile (High Protein, Low Carb, Under 200 cal)
- Results grid with RecipeCard, empty state when no results
- Query: `supabase.from('base_recipes').select('*').ilike('name', '%${query}%')`
---
 
### PHASE 4: Create / My Recipes — `(tabs)/create/index.tsx`
 
- Header: "My Recipes"
- Create button → visual-recipe-builder (Colors.primary.main bg)
- FlatList of user_recipes (image + name + components count + servings) → user-recipe/[id]
- Empty state: emoji + "No recipes yet" + CTA
---
 
### PHASE 5: Tools Screen — `(tabs)/tools/index.tsx`
 
4 tool cards in grid (all placeholder, Alert "Coming soon!"):
1. Keto Calculator (calculator icon) — daily macros
2. Unit Converter (swap-horizontal) — g↔oz, ml↔fl oz
3. AI Keto Assistant (chatbubbles) — keto tips
4. Baking Timer (timer) — precision timer
Card style: Colors.background.primary, Shadows.md, BorderRadius.xl, icon in circle with Colors.primary.opacity[10]
 
---
 
### PHASE 6: Profile Screen — `(tabs)/profile/index.tsx`
 
- Avatar: placeholder circle with initials/emoji, "Guest User" (no auth)
- Stats: recipe count, favorites (from Supabase or 0)
- Menu: Settings, Favorites, Shopping List, Language (placeholder), About (placeholder)
- Footer: "KetoCakR v1.0.0"
---
 
## Shared Components (components/)
 
| Component | Props | Notes |
|-----------|-------|-------|
| RecipeCard | recipe, onPress, size?('small'\|'large') | Image + name + nutrition badge |
| SectionHeader | title, actionText?, onAction? | Title left, "See all" right |
| FilterChip | label, active, onPress | Active: primary bg/white text |
| EmptyState | icon?, title, subtitle?, actionLabel?, onAction? | Centered with CTA |
| NutritionBadge | calories, protein?, fat?, carbs?, compact? | Compact: calories only |
 
---
 
## Testing Checklist (per phase)
- [ ] All screens load without errors
- [ ] Zero hardcoded colors — all from Colors.ts
- [ ] Zero hardcoded sizes — all from Theme.ts
- [ ] Tab nav works with correct icons/colors
- [ ] Supabase data loads (with loading/error states)
- [ ] Tested on physical Android via Expo Go
---
 
## Session Start Template
```
Read CLAUDE.md and CLAUDE_CODE_TASK.md.
Read constants/Colors.ts and constants/Theme.ts.
Today's task: PHASE X — [description]
Make a plan first, do NOT write code yet.
```
