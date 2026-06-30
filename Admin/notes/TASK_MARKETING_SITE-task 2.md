# KetoCakR — Marketing Showcase Website Task Spec

> Executor: Claude Code at local project path.
> Read CLAUDE.md first for stack, hard rules, brand.
> DEPENDS ON: TASK_MCP_SERVER.md Phase 0 (the `public_ready_recipes` view) and
> Phase 1 (the public API route). Do that task first, or at least Phase 0–1.
> HARD RULE: Never remove existing functionality. The current static landing
> page at ketocakelab.com must keep working (or be migrated intact).

---

## Goal
A public marketing website that is the **showcase / витрина** of the project:
SEO-indexable recipe pages that show preview data only (name, macros, hero
image, type) and drive users into the app. Same data contract as the MCP layer
— one source of truth: `public_ready_recipes`. No steps, ingredients,
quantities, or cost ever rendered on the public site.

Positioning logic (matches the agent strategy):
- Website = the catalog the world (and Google, and agents) can see.
- App = where the full recipe lives (steps, quantities, Puzzle builder).
- Every recipe page is a landing page whose primary CTA is "Open in app".

---

## Stack decision
Build as **Next.js 14 App Router** (consistent with the admin panel, enables
SSG/ISR for SEO). Deploy on Vercel, domain `ketocakelab.com`.

- If the existing landing page is a separate static project: create the new site
  as the canonical `ketocakelab.com` project and port the existing landing
  content into its home route. Do NOT silently drop existing sections
  (MailerLite signup, hero, handbook offer) — carry them over.
- Brand tokens (reuse, do not reinvent): Ruby Red `#A80048`, Warm Beige
  `#B2AC88`; fonts Playfair Display (headings), Poppins (body).

---

## Data access
The site reads showcase data two ways — pick per route:
- **Recipe list + detail pages (SSG/ISR):** read `public_ready_recipes` directly
  with the Supabase **anon** key (the view is anon-safe — GRANT SELECT already
  done in migration 10). This keeps build-time generation simple and fast.
- **Any client-side search box:** call the public API route
  `/api/public/recipes` (CORS already enabled) so the browser never holds even
  the anon key logic for filtering.

Never query `ready_recipes` directly from the website. Only the view / API.

---

## PHASE 1: Project + design system

**1.1** Scaffold Next.js 14 App Router project (TypeScript). Configure fonts
(Playfair Display + Poppins via `next/font`). Central `lib/colors.ts` with brand
tokens. No hardcoded hex in components.

**1.2** `lib/supabase.ts` — anon client for server components (read-only, view).
`lib/recipes.ts` — typed helpers: `getPublishedRecipes(filters)`,
`getRecipeBySlug(slug)`, `getDessertTypes()`. All hit the view, return typed
`PreviewRecipe` (the 21 whitelisted fields + `dessert_type_name`).

**1.3** Shared `PreviewRecipe` TypeScript type mirrors the view exactly. A code
comment lists the FORBIDDEN fields so no one adds steps/cost later by reflex.

---

## PHASE 2: Routes

**2.1 Home — `app/page.tsx`**
- Port existing landing content: hero, value prop, MailerLite email signup +
  "The Keto Alchemist's Handbook" PDF offer, Instagram @blagocake link.
- Add a "Featured recipes" strip: 6 newest published recipes (preview cards) →
  link to `/recipe/[slug]`.
- Bilingual: render BG or EN names/descriptions based on a simple lang toggle
  (default by `Accept-Language` or a `?lang=` param; keep it minimal).

**2.2 Catalog — `app/recipes/page.tsx`**
- Grid of all published recipes (preview cards). ISR, `revalidate` ~3600s.
- Filters: dessert type chips (from `getDessertTypes()`), a "max net carbs"
  control, free/all toggle. Client-side filtering can call `/api/public/recipes`
  for live results; server render the initial set.
- Each card: hero image (or branded placeholder if `hero_image_url` null),
  name, dessert type, compact macro badge (calories + net carbs), "free" badge
  when `is_free`.

**2.3 Recipe detail — `app/recipe/[slug]/page.tsx`** (the key SEO + conversion page)
- `generateStaticParams()` from published slugs; ISR for new ones.
- Render: hero image, name (Playfair), short marketing description, dessert
  type, difficulty, servings, serving_container, full macro panel
  (calories, protein, fat, carbs, net carbs, weight), tags.
- DO NOT render steps/ingredients/quantities/cost — they are not in the view and
  must never be added here.
- **Primary CTA: "Open in the KetoCakR app"** → deep link / app store fallback.
  Use the `app_url` pattern `https://ketocakelab.com/recipe/{slug}` as the
  shareable canonical; wire an app deep link (e.g. `blagocake://recipe/{slug}`)
  with store-link fallback for users without the app.
- Secondary CTA: email signup.
- `generateMetadata()` per recipe: title, description, Open Graph image =
  `hero_image_url`, canonical URL. This is what makes shared links + agent
  links look good.
- Add JSON-LD structured data: schema.org `Recipe` with name, image,
  `nutrition` (NutritionInformation: calories, carbohydrateContent,
  proteinContent, fatContent), `recipeCategory` = dessert type. **Omit
  `recipeIngredient` and `recipeInstructions`** (we don't expose them; partial
  Recipe markup is acceptable and avoids leaking the method).

**2.4 404 / empty states** — branded, with link back to catalog.

---

## PHASE 3: SEO + sharing
- `app/sitemap.ts` — generate from published slugs (catalog + every recipe).
- `app/robots.ts` — allow indexing; point to sitemap.
- Per-page metadata + OG tags (done in 2.3). Verify OG image renders in a
  link-preview tester mentally (absolute URL, not relative).
- Canonical URLs to avoid duplicate BG/EN indexing issues (use `?lang` as param,
  single canonical without lang).

---

## PHASE 4: Consistency guard (the whole point)
- Confirm the site and the MCP server return the SAME fields for the same
  recipe (both bottom out at `public_ready_recipes`). If a field is hidden from
  one channel it must be hidden from both — there is one whitelist.
- Grep the site for any reference to: `selected_components`, `estimated_cost`,
  `selling_price`, `recipe_instruction_steps`, `recipe_ingredients`, `status`.
  Any hit = bug. None of these may be imported or rendered.

---

## Final acceptance checklist
- [ ] Existing landing content (signup, handbook, hero, IG) preserved on home.
- [ ] `/recipes` lists published recipes with working type + macro filters.
- [ ] `/recipe/[slug]` renders preview only; "Open in app" CTA present; correct
      OG tags + JSON-LD (no ingredients/instructions in markup).
- [ ] Sitemap + robots generated; metadata per recipe.
- [ ] Site reads only the view / public API — never `ready_recipes` directly,
      never any hidden column.
- [ ] BG/EN toggle works; brand tokens used everywhere (zero hardcoded hex).
- [ ] Builds and deploys to Vercel under ketocakelab.com.
- [ ] Session report saved to `Admin/logs/`.
