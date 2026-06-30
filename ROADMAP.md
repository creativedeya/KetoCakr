
KetoCakr

Fable 5 is temporarily unavailable.
Learn more(opens in new tab)


How can I help you today?


Приоритизиране на Project_status за издаване на приложението
Last message 7 minutes ago
Коригиране на грешка в схемата на base_recipes
Last message 51 minutes ago
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


ROADMAP.md


# KetoCakR — Unified Roadmap
> Last updated: 2026-06-18
> Single source of truth for "where are we going". Read alongside:
> PROJECT_STATUS.md (detailed to-dos), MASTER_SEQUENCING.md (showcase ordering),
> and the three distribution task specs (MCP / marketing / deeplink).
 
---
 
## The two layers (never confuse them)
 
- **Product layer** = mobile app + admin panel. The real prototype work.
- **Distribution layer** = public view + MCP server + marketing site + deep links.
  Showcase-only, ADD-ONLY, never touches product functionality.
The distribution layer is worthless without content — it can only show what
exists in **published** `ready_recipes`. Today: ~1 published recipe. **Content,
not code, is the real gate.**
 
---
 
## The dependency chain
 
```
[A] Product foundation ──┐
   Simple Recipes sync    ├──▶ feeds ──▶ [C] Content: publish 15–25 recipes
   + SQL backfill         │                          │
   + mobile bug fixes     │                          │ (B + C both ready)
                          │                          ▼
[B] Public view + API ────┘            [D] MCP server ║ Marketing site
   zero-risk, START NOW                              │ (site live)
                                                      ▼
                                                [E] Deep links
                                                   native EAS build
```
 
**Order:** A + B in parallel now → C (depends on A.1) → D → E.
 
---
 
## STAGE A — Product foundation (blocks credible launch)
 
Source: PROJECT_STATUS "To-Do — Admin/Backend" + "To-Do — Mobile App".
 
**A.1 — Simple Recipes backend (CRITICAL, also feeds Stage C)**
- POST/PATCH `/api/simple-recipes` → write to BOTH `base_recipes` AND `ready_recipes`
- Write ingredients to `recipe_ingredients` table (not just free text)
- Populate `ingredients_used[]` in `recipe_instruction_steps`
**A.2 — SQL backfill**
- Add `base_recipe_id` FK to `ready_recipes`
- Backfill `dessert_type_id` on `ready_recipes` (Known Issue #7)
- Backfill `total_weight_grams` + `image_url` sync (#10)
**A.3 — Mobile bug fixes (unblocked after A.1 + A.2)**
- RecipeDetailView `total_weight_grams` fallback chain for non-cake types
- Cooking mode (Tab 3) empty ingredient list → read from `recipe_ingredients`
- Dessert type label disappears for non-cake types → null-safe render
- "Encountered two..." error in Builder when switching roles
- Test expo-image-picker on real device
> ⚠️ A.1 must come before C: simple-recipe publishing only works correctly
> once dual-sync writes a complete `ready_recipes` row.

**A.1.5 — Mobile Auth & Gated Content** *(see `SPEC_MOBILE_AUTH.md` for full plan)*
- Supabase Auth: Apple Sign-In, Google Sign-In, email magic link
- `user_profiles` table + RLS + auto-create trigger
- Zustand auth store + soft-gate UI (bottom sheet, not fullscreen wall)
- Hidden training articles (separate Notion DB + gated API route)
> Not executable yet — break spec into task files first. Reserve Opus-class model.
 
---
 
## STAGE B — Public backend layer (ZERO-RISK, start immediately)
 
Source: TASK_MCP_SERVER.md **Phase 0–1**.
- Migration 10: `public_ready_recipes` view (whitelisted columns only)
- Public API routes: `/api/public/recipes` + `/api/public/recipes/[slug]`
  (force-dynamic, CORS, service_role, reads the view only)
Safe to do now even with little content — independent of volume, breaks nothing,
de-risks everything downstream.
 
**→ Active Claude Code task: `TASK_B_PUBLIC_VIEW_API.md`**
 
---
 
## STAGE C — Content readiness (the real gate for the showcase)
 
Source: PROJECT_STATUS publishing workflow. Runs in parallel with A + B.
- Publish `ready_recipes` from draft (move beyond 1 recipe)
- Set `hero_image_url` (manual post-import)
- Set `dessert_type_id` on imported recipes
- Confirm/generate `slug` for every published recipe (unique, non-null)
- Verify macros populated (calories / net carbs) via triggers
**Target: 15–25+ published recipes with image + macros + slug.** A catalog with
1 recipe undersells the project.
 
---
 
## STAGE D — Showcase + agent channel (after C has content + B is done)
 
Run in parallel:
- **MCP server** — TASK_MCP_SERVER.md Phase 2–3 (standalone TS, calls the API)
- **Marketing site** — TASK_MARKETING_SITE.md (Next.js 14, ketocakelab.com)
Both consume the same view. One whitelist, two channels — identical preview fields.
 
---
 
## STAGE E — Deep links (last, needs the site live)
 
Source: TASK_DEEPLINK_EXPO.md.
- Scheme `blagocake://` + linking + slug→id resolver route in the app
- Host `.well-known/apple-app-site-association` + `assetlinks.json` on the site
  (needs real Apple Team ID + Android signing fingerprint)
- Requires a native EAS build (not Expo Go)

---

## DEFERRED — AI image generation for `user_recipes`

Not a blocker for any current stage. Captured here so it isn't lost.

**Idea:** Extend the existing Reve/Gemini hero-image generation (currently `ready_recipes`
only, admin-triggered) to `user_recipes` (mobile, user-triggered). Technically straightforward
once Stage A's Remix fix lands — `user_recipes` follows the same Puzzle Model component
selection as `ready_recipes`, so the same `generateWithReve()` logic applies, just pointed at a
different source table. Reve is also cheaper per-image than the current Gemini path
(~$0.024–0.04 vs ~$0.067), so unit cost is not the concern.

**The real risk is volume, not unit cost** — admin generation is a controlled, bounded batch
(~74 recipes); user-triggered generation scales with users × clicks, an open-ended cost profile.

**Required before enabling for users:**
- Gate behind RevenueCat `"premium"` entitlement (same gate as Tabs 2 & 3)
- Per-user rate limit even for premium (e.g. 3–5 generations/day) to prevent click-spam cost
- Generate once at creation, cache in `user_recipes.hero_image_url` — never regenerate on view
- New server-side route (admin Next.js, same pattern as the Notion blog-post proxy) holding
  `REVE_API_KEY` server-side — mobile never embeds the key, calls this route authenticated
  (depends on the planned Sign in with Apple / Google auth landing, for a real `user_id` to
  rate-limit against)
- Consider `reve-remix-fast` version for the user tier vs full quality for admin-curated content

**Depends on:** Stage A (Remix fix shipped + stable), RevenueCat dashboard live (Stage —
monetization, see PROJECT_STATUS.md). Independent of Stage C/D/E content/showcase work.

---
 
## Non-negotiables (all stages)
 
- Never REVOKE anon on `ready_recipes` (mobile depends on it).
- One whitelist, two channels: site + MCP return identical preview fields.
- No steps / ingredients / quantities / cost on any public surface.
- Surgical, additive changes; existing functionality never disappears.
- Fix issues at the source (DB level), not UI workarounds.
---
 
## What's deferred (does NOT block launch)
 
USDA integration, batch-translate 111 steps, Lab Notes CRUD, ingredients
dedup, drip emails, social content, splash screen, multi-angle photography,
sweetener substitution calculator, multi-diet support.
 
---
 
## Current focus
 
| Stage | Status | Next action |
|-------|--------|-------------|
| A.1–A.3 | pending | task files — start when auth/blog work settles |
| A.1.5 | planned | break `SPEC_MOBILE_AUTH.md` into task files |
| B | ✅ done | public API + view live |
| C | parallel | manual publishing workflow |
| **D** | **active** | **Site live — polish + blog done; MCP server next** |
| E | held | until site live (EAS build needed) |
 
