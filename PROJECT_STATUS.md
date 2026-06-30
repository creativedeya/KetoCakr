# Project Status

## Known DB Issues
1. recipe_instruction_steps — NO FK to base_recipes (use split queries)
2. ready_recipes — NO FK to dessert_types
3. 18 recipe_ingredients have NULL ingredient_database_id
4. Duplicates in ingredients_database (Яйца/Яйце/Цели яйца)
5. fiber_per_100g inconsistent (some entries = net carbs)
6. assembly_templates.instructions_gb is in English, instructions_en is NULL
7. simple recipes: base_recipes and ready_recipes must always be kept in sync.
   Fields: name, name_en, description, description_en, image_url, servings,
   nutrition totals, published_at/status.
   API routes /api/simple-recipes POST+PATCH handle this sync.
   ready_recipes.base_recipe_id FK recommended for reliable lookup (currently matched by id).
8. ready_recipes.dessert_type_id is NULL for most simple recipes — needs backfill in Supabase SQL Editor
9. recipe_ingredients.ingredients_used was [] for simple recipes created before 2026-06-12 — needs backfill

## Recently Fixed (Session 2026-06-18)
- ✅ Site: Hero image (Velvet Alchemy) wired from Supabase Storage
- ✅ Site: 4 module images (Base/Frosting/Filling/Decoration) wired
- ✅ Site: Founder photo (Deyana) wired + CSS rotation fix (EXIF issue)
- ✅ Site: Pre-FAQ section image wired
- ✅ Site: Recipe gallery limited to 6 + `/recipes` browse-all page (search + dessert-type chips)
- ✅ Site: Recipe card CTA now links to `/recipe/[slug]` detail page (not "Coming to the App" placeholder)
- ✅ Site: Blog search bar + blog category filter chips (Notion `Category` Select field)
- ✅ Site: Category badge on blog cards (index + home preview)
- ✅ Mobile: Blog WebView screen (`/blog`) — back nav through WebView history first
- ✅ Mobile: Tab 4 (Tools) Blog card — fully functional, navigates to blog screen
- ✅ Mobile: Tab 1 (Home) "From the Blog" section — latest posts with category badge
- ✅ Admin: `/api/public/blog-posts` route added (Notion proxy, CORS, public)

## Recently Fixed (Session 2026-06-12)
- ✅ Simple recipes: dual-table sync (base_recipes ↔ ready_recipes on every save)
- ✅ Simple recipe name save bug — ready_recipes.name_bg/name_en now persists after rename
- ✅ Bug fix: Cooking mode (Tab 3) — ingredients_used now populated with recipe_ingredients PKs on POST/PATCH
- ✅ Bug fix: Dessert type label — simple recipes now fetch and display dessert type via ready_recipes.dessert_type_id
- ✅ Bug fix: Weight display — hidden when total_weight_grams is 0 (non-cake recipes show no false "0g" label)

## Recently Fixed (Session 2026-05-20)
- ✅ recipe_instruction_steps.ingredients_used for simply recipes — now step-specific
- ✅ ready_recipes.name_bg — populated from base_recipes.name for Barry Pana Cotta

## To-Do — Mobile App
- [ ] Bug: "Encountered two..." error in Builder when switching roles
- [ ] Test expo-image-picker on real device
- [ ] DEFERRED: AI hero-image generation for `user_recipes` (currently `ready_recipes`/admin
      only). Reuses `generateWithReve()` once Remix fix lands, pointed at `user_recipes`
      instead. Must ship together with: RevenueCat `"premium"` gate, per-user daily rate limit,
      generate-once-cache-on-`hero_image_url`, and a new authenticated server route holding
      `REVE_API_KEY` (mobile never gets the key directly). See ROADMAP.md "DEFERRED — AI image
      generation for user_recipes" for full rationale.
- [x] ✅ FIXED: Step ingredients showing correctly for simply recipes (Cooking Mode)
- [x] ✅ FIXED: Equipment showing in Cooking Mode
- [x] ✅ FIXED: Recipe title display (name_bg)
- [ ] TODO: Component avatars in Cooking Mode (prepared, ready to execute)
- [ ] Lab Notes tool in Tab 4
- [ ] Lab Notes display in Cooking Mode
- [ ] Splash screen logo (requires production build)

## To-Do — Mobile App (Auth & Gated Content)
> Full plan: see `SPEC_MOBILE_AUTH.md`. Break into task files before executing.
> Reserve Opus-class model — higher-risk architectural phase.
- [ ] Supabase Auth setup: Apple Sign-In, Google Sign-In, email magic link
- [ ] `user_profiles` table + RLS policies + auto-create trigger on signup
- [ ] Zustand auth store + soft-gate UI pattern (bottom-sheet prompt, not fullscreen wall)
- [ ] Hidden training articles: separate Notion DB + gated `/api/gated/articles` route

## To-Do — Subscriptions & Monetization
- [ ] **RevenueCat dashboard setup (manual, blocks Step 2-4 testing):**
  1. Finish RevenueCat account registration
  2. Create Project (e.g. "KetoCakR")
  3. Apps → add iOS app → link to App Store Connect Bundle ID
  4. Products → add subscription product(s) (requires Auto-Renewable Subscription already created in App Store Connect → In-App Purchases)
  5. Entitlements → create entitlement with identifier `premium` (must match code in `useSubscriptionStore.ts`)
  6. Offerings → attach product(s) to an offering
  7. API Keys → copy Public app-specific API key for iOS (`appl_xxxxx`) → paste into `Mobile/.env` as `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
- [ ] Mobile: integrate `react-native-purchases` SDK (`useSubscriptionStore.ts` + `_layout.tsx` init) — code scaffolding can proceed without real API key (uses `.env` placeholder)
- [ ] Mobile: build `PaywallOverlay` component for locked tabs (Ingredients/Steps) in `RecipeDetailView.tsx`
- [ ] Mobile: gate Tab 2 (Ingredients) and Tab 3 (Steps) behind `hasActiveSubscription`; Tab 1 (Intro) and Tab 4 (Nutrition) remain always free — required for Amazon Associates affiliate links to stay in publicly accessible content
- [ ] Decide on affiliate URL placement once Tab 1 equipment avatars are finalized (deferred — see TASK_AFFILIATE_LINKS.md)

## Known Issues
- ⚠️ `next.config.mjs` (Admin): invalid `api` key — Pages Router leftover, not recognised by App Router. Harmless now but needs cleanup in a future polish task.
