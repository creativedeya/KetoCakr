# Simple Recipes Architecture — TikTok/Social Media Strategy

## Executive Summary

**Goal:** Enable creation of standalone, simple recipes (from TikTok/Instagram videos) that bypass the Puzzle Builder and go straight to Cooking Mode.

**Current Problem:** 
- All recipes require 4 components (crust/cream/filling/decoration)
- TikTok recipes (e.g., "simple chocolate cake in a mug") don't fit this model
- User needs social media engagement without waiting for full app launch

**Proposed Solution:** Create **Variant B** with database flag + unified query view.

---

## Current Architecture Analysis

### Ready Recipes Table Structure

```sql
ready_recipes
├── id (UUID, PK)
├── dessert_type_id (UUID, FK → dessert_types)
├── name_en, name_bg (TEXT)
├── description_en, description_bg (TEXT)
├── crust_id, cream_id, filling_id, decoration_id (UUID, FK → base_recipes)
├── hero_image_url (TEXT)
├── is_featured (BOOLEAN)
├── tags (TEXT[] — from add_tags_to_ready_recipes.sql)
├── selected_components (JSONB — used in user_recipes)
├── total_calories, total_net_carbs, total_servings (NUMERIC — nutrition per serving)
├── created_at, published_at (TIMESTAMP)
└── ... (other admin fields)
```

### Mobile Data Loading Pattern

**Home Tab Query:**
```typescript
supabase.from('ready_recipes')
  .select('id, name_bg, name_en, hero_image_url, total_calories, total_net_carbs, total_servings, dessert_type_id')
  .order('created_at', { ascending: false })
  .limit(8)
```

**Recipe Detail Query:**
```typescript
// For ready_recipes with selected_components (Puzzle mode):
supabase.from('ready_recipes')
  .select('*')  // Gets all including crust_id, cream_id, filling_id, decoration_id
  .eq('id', id)
  .single()

// Then constructs from base_recipes via component IDs
```

**Create Tab Query:**
```typescript
supabase.from('user_recipes')
  .select('id, name, dessert_type_id, created_at, selected_components, user_image_url')
  .order('created_at', { ascending: false })
```

---

## Solution: Database-Driven Approach (Variant B)

### Option B.1: Single Table with `is_standalone` Flag (SIMPLEST)

**Add to ready_recipes:**

```sql
ALTER TABLE public.ready_recipes
ADD COLUMN is_standalone BOOLEAN DEFAULT FALSE,
ADD COLUMN simple_recipe_instructions TEXT,           -- Single text block for simple recipes
ADD COLUMN simple_recipe_instructions_bg TEXT,
ADD COLUMN simple_recipe_instructions_en TEXT,
ADD COLUMN simple_recipe_prep_time_minutes INTEGER,   -- Override for simple recipes
ADD COLUMN simple_recipe_servings INTEGER,
ADD COLUMN source_type VARCHAR(50),                   -- 'puzzle' | 'tiktok' | 'instagram' | 'website'
ADD COLUMN source_url TEXT,                           -- Link to original video/post
ADD COLUMN video_duration_seconds INTEGER,
ADD COLUMN engagement_stats JSONB;                    -- {views, likes, comments}

-- Ensure NOT NULL check
ALTER TABLE public.ready_recipes
ADD CONSTRAINT recipe_type_check CHECK (
  (is_standalone = FALSE AND crust_id IS NOT NULL AND cream_id IS NOT NULL) OR
  (is_standalone = TRUE AND simple_recipe_instructions IS NOT NULL)
);

-- Index for fast filtering
CREATE INDEX idx_ready_recipes_is_standalone 
ON public.ready_recipes(is_standalone) 
WHERE is_standalone = TRUE;
```

**Advantage:** All recipes in one table, simple logic
**Disadvantage:** ready_recipes becomes "wider" (more columns)

---

### Option B.2: Separate Table + Union View (CLEANER - RECOMMENDED)

**Create standalone_recipes table:**

```sql
CREATE TABLE public.standalone_recipes (
  id SERIAL PRIMARY KEY,
  dessert_type_id INTEGER REFERENCES dessert_types(id) ON DELETE CASCADE,
  
  -- Names
  name TEXT NOT NULL,
  name_en TEXT,
  name_bg TEXT,
  
  -- Descriptions
  description TEXT,
  description_en TEXT,
  description_bg TEXT,
  
  -- Instructions
  instructions TEXT NOT NULL,              -- Full step-by-step
  instructions_bg TEXT,
  instructions_en TEXT,
  
  -- Nutrition per 100g (not total)
  calories_per_100g DECIMAL(10, 2),
  protein_per_100g DECIMAL(10, 2),
  fat_per_100g DECIMAL(10, 2),
  carbs_per_100g DECIMAL(10, 2),
  net_carbs_per_100g DECIMAL(10, 2),
  fiber_per_100g DECIMAL(10, 2),
  
  -- Servings & Weight
  total_weight_grams INTEGER,
  servings INTEGER DEFAULT 6,
  
  -- Media
  hero_image_url TEXT,
  video_url TEXT,                          -- TikTok/Instagram embed URL
  
  -- Metadata
  source_type VARCHAR(50),                 -- 'tiktok', 'instagram', 'website', 'user'
  source_url TEXT,
  video_duration_seconds INTEGER,
  difficulty_level VARCHAR(20),            -- 'easy', 'medium', 'hard'
  tags TEXT[],
  
  -- Engagement
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT standalone_name_unique UNIQUE(name)
);

-- Indexes
CREATE INDEX idx_standalone_dessert_type ON standalone_recipes(dessert_type_id);
CREATE INDEX idx_standalone_source_type ON standalone_recipes(source_type);
CREATE INDEX idx_standalone_tags ON standalone_recipes USING GIN(tags);
```

**Create union view for mobile consumption:**

```sql
CREATE OR REPLACE VIEW all_recipes AS
SELECT 
  'ready'::VARCHAR AS recipe_source,           -- Identifier
  id::INTEGER,
  dessert_type_id,
  COALESCE(name_en, name_bg, '') AS name,
  name_bg,
  name_en,
  description_en,
  description_bg,
  hero_image_url,
  total_calories,
  total_net_carbs,
  total_servings,
  NULL::INTEGER AS total_weight_grams,
  tags,
  is_featured,
  published_at,
  created_at,
  FALSE AS is_standalone,                      -- Flag for mobile logic
  crust_id IS NOT NULL AS requires_builder
FROM ready_recipes

UNION ALL

SELECT 
  'standalone'::VARCHAR,
  id,
  dessert_type_id,
  COALESCE(name_en, name_bg, name),
  name_bg,
  name_en,
  description_en,
  description_bg,
  hero_image_url,
  ROUND(COALESCE(calories_per_100g, 0) * COALESCE(total_weight_grams, 100) / 100)::NUMERIC,
  ROUND(COALESCE(net_carbs_per_100g, 0) * COALESCE(total_weight_grams, 100) / 100)::NUMERIC,
  servings,
  total_weight_grams,
  tags,
  published_at IS NOT NULL AS is_featured,    -- Treat published as featured
  published_at,
  created_at,
  TRUE AS is_standalone,
  FALSE AS requires_builder
FROM standalone_recipes
WHERE published_at IS NOT NULL
ORDER BY created_at DESC;
```

**Advantage:** Clean separation, extensible, easy to add analytics
**Disadvantage:** Requires managing two tables (worth it for clarity)

---

## Mobile Implementation Changes

### 1. Home Tab — Show Both Recipe Types

**Current:**
```typescript
// Only ready_recipes
const { data: readyRecipes } = await supabase
  .from('ready_recipes')
  .select('id, name_bg, name_en, hero_image_url, total_calories, total_net_carbs, total_servings')
  .limit(8);
```

**New:**
```typescript
// Use unified view
const { data: allRecipes } = await supabase
  .from('all_recipes')
  .select('*')
  .eq('published_at', 'not.null')              // Only published
  .order('created_at', { ascending: false })
  .limit(8);

// Split for display
const puzzleRecipes = allRecipes.filter(r => !r.is_standalone);
const simpleRecipes = allRecipes.filter(r => r.is_standalone);

// Render two sections:
// <SectionHeader title="Masterpieces (Puzzle Mode)" />
// <Grid recipes={puzzleRecipes} />
// 
// <SectionHeader title="Quick & Simple" />
// <Grid recipes={simpleRecipes} />
```

### 2. Home Tab Layout

```
┌─────────────────────────────┐
│   KetoCakR                  │
│   Good morning! 👋          │
├─────────────────────────────┤
│   🎨 Daily Delight          │ (featured ready_recipe)
│   [Hero image + CTA]        │
├─────────────────────────────┤
│   ⚡ Quick & Simple         │ ← NEW SECTION
│   [Grid: TikTok recipes]    │
│   [Scroll right →]          │
├─────────────────────────────┤
│   🎭 Create Your Masterpiece│
│   [Role grid]               │
├─────────────────────────────┤
│   📚 Browse Recipes         │
│   [Dessert type filters]    │
│   [Grid: Ready recipes]     │
└─────────────────────────────┘
```

### 3. Create Tab — Add "My Quick Recipes" Section

**Current:** Only shows user_recipes (Puzzle-created)

**New:** Add section for simple recipes created by user

```typescript
// Get user-created simple recipes
const { data: userSimple } = await supabase
  .from('standalone_recipes')
  .select('*')
  .eq('source_type', 'user')
  .eq('user_id', userId)  // Need to add user_id FK
  .order('created_at', { ascending: false });
```

### 4. Recipe Detail Navigation

**Current logic:**
```typescript
if (recipe.crust_id) {
  // Show Builder option
  return <PuzzleBuilder recipe={recipe} />;
} else {
  // Show Cooking Mode directly
  return <CookingMode recipe={recipe} />;
}
```

**New logic:**
```typescript
if (recipe.is_standalone) {
  // Direct to Cooking Mode, no builder option
  return <CookingMode recipe={recipe} standalone={true} />;
} else if (recipe.requires_builder) {
  // Show Builder first
  return <PuzzleBuilder recipe={recipe} />;
} else {
  // Fallback: Cooking Mode
  return <CookingMode recipe={recipe} />;
}
```

---

## Admin Panel Changes

### 1. New Page: Simple Recipes Manager

**Location:** `Admin/app/dashboard/simple-recipes/` (parallel to `ready-recipes/`)

**Features:**
- List all standalone_recipes
- Create new simple recipe:
  - Name (BG/EN)
  - Instructions (BG/EN, full text block)
  - Upload hero image
  - Nutrition per 100g + total weight → calculates per serving
  - Source type + link (TikTok/Instagram/Website)
  - Video embed code (optional)
  - Tags
  - Publish button

- Edit existing:
  - All above fields
  - Engagement stats (views, likes) — read-only or manual input

### 2. Quick Create Modal for TikTok Posts

When admin posts TikTok video, quick add to app:

```
┌─────────────────────────┐
│ Add TikTok Recipe       │
├─────────────────────────┤
│ Name: [Simple Choco...] │
│ Video URL: [@tiktok...] │
│ Duration: 45s           │
│ Prep time: 5 min        │
│ Calories: 250 cal       │
│ Net Carbs: 8g           │
│ [Publish]               │
└─────────────────────────┘
```

---

## Data Model: Simple Recipe vs Puzzle Recipe

| Aspect | Puzzle (ready_recipes) | Simple (standalone_recipes) |
|--------|---|---|
| **Components** | 4 required (crust/cream/filling/decor) | None — single recipe |
| **Instructions** | 4 separate base_recipe steps | Single text block |
| **Builder Mode** | Required (user selects components) | Skipped (direct to cook) |
| **Cooking Mode** | Shows 4 component instruction blocks | Shows single instructions block |
| **Nutrition** | Total only (sum of 4 base recipes) | Per 100g + total weight |
| **Servings** | Fixed (from base recipes) | Flexible per recipe |
| **Source** | Admin-created puzzle combinations | TikTok/Instagram/User |
| **Engagement** | Views via analytics | Likes/views tracked per recipe |
| **Tags** | Category tags (e.g., "no-bake") | Any tags (#chocolate, #mug) |

---

## Migration & Rollout Plan

### Phase 1: Database Setup (Week 1)
- [ ] Create `standalone_recipes` table
- [ ] Create `all_recipes` view
- [ ] Add `user_id` FK to standalone_recipes (for user-created recipes)
- [ ] Add migration script with sample data

### Phase 2: Admin Panel (Week 2)
- [ ] Create simple-recipes dashboard (list/create/edit)
- [ ] Quick create modal for social media
- [ ] Image upload to hero_image_url
- [ ] Video URL embedding

### Phase 3: Mobile UI (Week 2-3)
- [ ] Update Home tab to use `all_recipes` view
- [ ] Add "Quick & Simple" section above Puzzle grid
- [ ] Update Create tab with user simple recipes section
- [ ] Update Recipe Detail router logic
- [ ] Add standalone recipe indicator in card UI

### Phase 4: Testing & Launch (Week 3)
- [ ] Test Puzzle vs Simple flow
- [ ] Test navigation (no Builder for simple)
- [ ] Test nutrition calculations (per 100g → per serving)
- [ ] QA mobile UI
- [ ] Launch with first TikTok recipe batch

---

## Example: TikTok Recipe Workflow

### Step 1: Admin Creates TikTok Post
Posts 30-second video: "Keto Chocolate Mug Cake" on @blagocake TikTok

### Step 2: Admin Adds to App (Fast Track)
1. Open Admin Dashboard → Simple Recipes
2. Click "Add from TikTok"
3. Fill form:
   - Name: "Chocolate Mug Cake (30 sec)"
   - Instructions: "1. Mix 2 tbsp cocoa... 2. Microwave 90 sec..."
   - Calories: 280 / 100g
   - Net Carbs: 3g / 100g
   - Total weight: 80g
   - Video URL: [TikTok embed]
   - Tags: ["mug", "microwave", "5-minute", "chocolate"]
4. Click "Publish"

### Step 3: Mobile Shows Recipe
- Home Tab: Shows under "⚡ Quick & Simple" section
- User taps
- Skips Builder
- Goes straight to Cooking Mode
- Single instruction block: "1. Mix... 2. Microwave..."
- Timer button available
- Shopping list auto-generated from nutrition

### Step 4: Engagement Loop
- User cooks & rates
- Views/likes tracked in standalone_recipes
- Admin sees engagement metrics
- Reposts successful recipes on TikTok with link

---

## Benefits

✅ **For User:**
- Quick, simple recipes for social engagement
- No 4-component complexity
- TikTok → App path is seamless
- Cooking Mode experience is identical

✅ **For Admin:**
- Fast recipe creation (5 minutes per TikTok)
- Track social media → app conversion
- Build recipe library while marketing
- Decouple recipe creation from app development

✅ **For Business:**
- Retention through simple recipes
- Social media proof of concept
- User feedback before puzzle launch
- Revenue from free tier engagement

---

## SQL Implementation Details

### Standalone Recipe Creation Example

```sql
INSERT INTO standalone_recipes (
  name, name_en, name_bg,
  instructions, instructions_en, instructions_bg,
  calories_per_100g, net_carbs_per_100g, protein_per_100g, fat_per_100g,
  total_weight_grams, servings,
  hero_image_url,
  source_type, source_url, video_url,
  tags,
  published_at
) VALUES (
  'Chocolate Mug Cake',
  'Chocolate Mug Cake',
  'Шоколадов кекс в чаша',
  '1. Mix... 2. Microwave...',
  '1. Mix... 2. Microwave...',
  '1. Смеси... 2. Микровълна...',
  2.8,  -- 280 cal per 100g
  0.03, -- 3g net carbs per 100g
  0.05, -- 5g protein per 100g
  0.25, -- 25g fat per 100g
  80,   -- total 80g
  1,    -- 1 serving
  'https://bucket.cdn/mug-cake.jpg',
  'tiktok',
  'https://tiktok.com/@blagocake/video/...',
  '<iframe src="tiktok_embed..."></iframe>',
  ARRAY['mug', 'microwave', 'chocolate', '5-minute'],
  NOW()
);
```

### Unified View Query from Mobile

```typescript
const { data: homeRecipes } = await supabase
  .from('all_recipes')
  .select('recipe_source, id, name_en, name_bg, hero_image_url, total_calories, total_net_carbs, total_servings, is_standalone, requires_builder, dessert_type_id')
  .eq('published_at', 'not.null')
  .order('created_at', { ascending: false })
  .limit(12);

// Result is mixed:
// [{recipe_source: 'ready', is_standalone: false, ...}, ← Puzzle
//  {recipe_source: 'standalone', is_standalone: true, ...}, ← Simple
//  ...]
```

---

## Summary Table

| Aspect | Status | Timeline |
|--------|--------|----------|
| **Architecture Decision** | ✅ Variant B.2 (Separate Table + View) | Finalized |
| **Database Design** | ✅ Complete (SQL ready) | Ready to execute |
| **Mobile UI Changes** | 📋 Defined | 1-2 weeks dev |
| **Admin Panel** | 📋 Defined | 1 week dev |
| **Testing Plan** | 📋 Outlined | 1 week QA |
| **First TikTok Recipe** | 🎯 Goal | Week 4 |

---

Това е пълната архитектура за Simple Recipes! 🚀

Всичко е готово за разработка!