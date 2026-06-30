# Phase 4: Admin Simple Recipes Dashboard

## Phase Overview
Build admin panel interface to manage simple recipes (TikTok/Instagram/Website recipes). Admin can create, edit, delete simple recipes that will appear as public recipes for all users.

These simple recipes use the SAME infrastructure as base_recipes:
- `recipe_ingredients` table (ingredients with nutrition)
- `recipe_instruction_steps` table (step-by-step instructions)
- Nutrition calculations (from ingredients)
- Price calculations (from ingredients)
- Image generation (per step)

---

## PHASE 4.1: List Page

### File: `Admin/app/dashboard/simple-recipes/page.tsx`

**Features:**
- Table view of all base_recipes where `is_simple_recipe = TRUE`
- Columns: Name (BG/EN), Source Type, Servings, Total Calories, Published, Actions
- Search by name (debounced, 300ms)
- Filter by source_type (tiktok, instagram, website, manual, user_saved)
- Filter by published status (published, draft, all)
- Pagination (20 per page)
- Create button → modal or /new page
- Edit button → [id]/page.tsx
- Delete button → confirm dialog
- Publish/unpublish toggle

**Query:**
```sql
SELECT 
  id, name_en, name_bg,
  is_simple_recipe, source_type, source_url,
  total_servings,
  total_calories,
  created_at, published_at
FROM base_recipes
WHERE is_simple_recipe = TRUE
ORDER BY created_at DESC;
```

**Layout:**
```
┌─────────────────────────────────────────┐
│ Simple Recipes Management               │
├─────────────────────────────────────────┤
│ [+ Create New Simple Recipe]             │
├─────────────────────────────────────────┤
│ Search: [____search____]                │
│ Source: [All v] Status: [All v]         │
├─────────────────────────────────────────┤
│ Name | Source | Servings | Cal | Pub | A│
│ ─────────────────────────────────────── │
│ Ch.M | tiktok | 1       | 280 | ✓  |🖊 │
│ C.Cake | blog  | 2       | 150 | ✗  |🖊 │
└─────────────────────────────────────────┘
```

**Delete Action:**
```typescript
async function deleteRecipe(id: string, name: string) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  
  // Delete related records first
  await supabase
    .from('recipe_instruction_steps')
    .delete()
    .eq('base_recipe_id', id);
    
  await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('base_recipe_id', id);
  
  // Then delete the recipe
  const { error } = await supabase
    .from('base_recipes')
    .delete()
    .eq('id', id);
    
  if (error) {
    toast.error(error.message);
  } else {
    toast.success('Recipe deleted');
    loadRecipes();
  }
}
```

---

## PHASE 4.2: Create/Edit Page

### File: `Admin/app/dashboard/simple-recipes/new/page.tsx` (CREATE)
### File: `Admin/app/dashboard/simple-recipes/[id]/page.tsx` (EDIT)

**Form Sections (use tabs or accordion):**

### A. Basic Info Tab
```
Name (EN):         [Chocolate Mug Cake]
Name (BG):         [Шоколадов кекс в чаша]

Description (EN):  [Full description text area]
Description (BG):  [Full description text area]

Dessert Type:      [Cake v] (from dessert_types)
```

### B. Source Tab
```
Source Type:       [tiktok v] (tiktok|instagram|website|manual|user_saved)
Source URL:        [https://tiktok.com/@blagocake/...]
Video Duration:    [45] seconds (optional)

Note: When user saves, source_type becomes 'user_saved'
```

### C. Ingredients Tab
```
Ingredients for this recipe:

[Search ingredients...____________]

Selected Ingredients:
☑ Cocoa Powder      [2] [tbsp]   [x]
☑ Eggs              [2] [piece]  [x]
☑ Sweetener         [3] [tbsp]   [x]
☑ Butter            [1] [tbsp]   [x]

[+ Add Ingredient]

Nutrition Calculation:
Total Calories: 280 cal (calculated from ingredients)
Total Protein:  5.2 g
Total Fat:      25.0 g
Total Carbs:    15.0 g
Total Net Carbs: 3.0 g
Total Weight:   80 g
Servings:       1
Per Serving:    280 cal, 5.2g protein, 3.0g net carbs
```

### D. Steps Tab
```
Step-by-Step Instructions:

Step 1:
Description: Mix cocoa powder and eggs
Duration:    [2] minutes
Equipment:   [Bowl] [Whisk] [x]
Image:       [Upload] or [Generate with AI]
             [Preview]

[+ Add Step]

Note: Steps will support:
- Text description (BG/EN bilingual)
- Image (upload or AI generate)
- Equipment needed
- Duration timer
```

### E. Media Tab
```
Hero Image (for recipe card):
[Upload JPG/PNG]
[Preview]
[Delete]

Step Images (for cooking mode):
(Will be shown per step in Steps tab)
```

### F. Publishing Tab
```
Status:            [Draft v] (Draft|Published|Archived)
Published Date:    [2026-05-14 14:30] (readonly, auto-set on publish)

[Save as Draft]  [Publish]  [Unpublish]

Note: Only published=true recipes show to users
```

---

## PHASE 4.3: API Routes

### Route 1: Get all simple recipes

**File:** `Admin/app/api/simple-recipes/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    console.log('[Simple Recipes API] GET all recipes');

    const { data, error } = await supabase
      .from('base_recipes')
      .select('*')
      .eq('is_simple_recipe', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('[Simple Recipes API] Found', data?.length, 'recipes');

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('[Simple Recipes API] Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Simple Recipes API] POST new recipe:', body.name_en);

    // Ensure is_simple_recipe is TRUE
    const recipeData = {
      ...body,
      is_simple_recipe: true,
      category: null,  // Simple recipes don't have a category
    };

    const { data, error } = await supabase
      .from('base_recipes')
      .insert([recipeData])
      .select();

    if (error) throw error;

    console.log('[Simple Recipes API] Created recipe:', data[0].id);

    return NextResponse.json({
      success: true,
      data: data[0],
    });
  } catch (error: any) {
    console.error('[Simple Recipes API] POST Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Route 2: Get/Update/Delete single recipe

**File:** `Admin/app/api/simple-recipes/[id]/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('[Simple Recipes API] GET recipe:', id);

    const { data, error } = await supabase
      .from('base_recipes')
      .select('*')
      .eq('id', id)
      .eq('is_simple_recipe', true)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Recipe not found');

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Simple Recipes API] GET Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    console.log('[Simple Recipes API] PATCH recipe:', id);

    // Ensure is_simple_recipe stays TRUE
    const updateData = {
      ...body,
      is_simple_recipe: true,
      category: null,
    };

    const { data, error } = await supabase
      .from('base_recipes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('[Simple Recipes API] Updated recipe:', id);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Simple Recipes API] PATCH Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log('[Simple Recipes API] DELETE recipe:', id);

    // Delete related records first (FK constraint)
    await supabase
      .from('recipe_instruction_steps')
      .delete()
      .eq('base_recipe_id', id);

    await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('base_recipe_id', id);

    // Then delete the recipe
    const { error } = await supabase
      .from('base_recipes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('[Simple Recipes API] Deleted recipe:', id);

    return NextResponse.json({
      success: true,
      message: 'Recipe deleted',
    });
  } catch (error: any) {
    console.error('[Simple Recipes API] DELETE Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Route 3: Image Upload

**File:** `Admin/app/api/simple-recipes/upload-image/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('[Simple Recipes Upload] Uploading:', file.name);

    const buffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const filename = `simple-recipes/${timestamp}-${file.name}`;

    const { data, error } = await supabase.storage
      .from('simple-recipes')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('simple-recipes')
      .getPublicUrl(data.path);

    console.log('[Simple Recipes Upload] Success:', urlData.publicUrl);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    });
  } catch (error: any) {
    console.error('[Simple Recipes Upload] Error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## PHASE 4.4: Reusable Form Component

### File: `Admin/app/dashboard/simple-recipes/components/SimpleRecipeForm.tsx`

This component is used by both `/new` and `/[id]` pages.

**Key responsibilities:**
- All form fields (basic, source, ingredients, steps, media, publishing)
- Input validation
- Image upload with preview
- Ingredients selection and calculation
- Steps management (add/edit/delete)
- Bilingual support (BG/EN)
- Submit handling (create or update)

**Props:**
```typescript
interface Props {
  recipe?: BaseRecipe;  // If editing
  onSave: (recipe: BaseRecipe) => Promise<void>;
  onCancel: () => void;
}
```

**State management:**
```typescript
const [formData, setFormData] = useState({
  name_en: recipe?.name_en || '',
  name_bg: recipe?.name_bg || '',
  description_en: recipe?.description_en || '',
  description_bg: recipe?.description_bg || '',
  source_type: recipe?.source_type || 'manual',
  source_url: recipe?.source_url || '',
  hero_image_url: recipe?.hero_image_url || '',
  total_servings: recipe?.total_servings || 1,
  
  // Calculated fields
  total_calories: 0,
  total_protein: 0,
  total_fat: 0,
  total_carbs: 0,
  total_net_carbs: 0,
  total_weight_grams: 0,
  
  // Status
  published_at: recipe?.published_at || null,
});

const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
const [steps, setSteps] = useState<RecipeInstructionStep[]>([]);
```

**Key functions:**
```typescript
// Auto-calculate nutrition when ingredients change
const calculateNutrition = () => {
  let totalCal = 0, totalProt = 0, totalFat = 0, totalCarbs = 0, totalNetCarbs = 0, totalWt = 0;
  
  ingredients.forEach(ing => {
    const ing_data = ... // fetch from ingredients_database
    const weight = ing.quantity; // assume grams
    totalCal += (ing_data.calories_per_100g * weight) / 100;
    totalProt += (ing_data.protein_per_100g * weight) / 100;
    totalFat += (ing_data.fat_per_100g * weight) / 100;
    totalCarbs += (ing_data.carbs_per_100g * weight) / 100;
    totalNetCarbs += (ing_data.net_carbs_per_100g * weight) / 100;
    totalWt += weight;
  });
  
  setFormData(prev => ({
    ...prev,
    total_calories: totalCal,
    total_protein: totalProt,
    total_fat: totalFat,
    total_carbs: totalCarbs,
    total_net_carbs: totalNetCarbs,
    total_weight_grams: totalWt,
  }));
};

// Image upload
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/simple-recipes/upload-image', { method: 'POST', body: formData });
  const data = await res.json();
  setFormData(prev => ({ ...prev, hero_image_url: data.url }));
};

// Save recipe
const handleSave = async () => {
  const url = recipe ? `/api/simple-recipes/${recipe.id}` : '/api/simple-recipes';
  const method = recipe ? 'PATCH' : 'POST';
  
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
  const data = await res.json();
  
  if (!data.success) throw new Error(data.error);
  
  // Also save ingredients and steps separately
  await saveIngredients(data.data.id);
  await saveSteps(data.data.id);
  
  onSave(data.data);
};
```

---

## PHASE 4.5: Supabase Storage Bucket

Create in Supabase Dashboard:
1. Storage → Create new bucket
2. Name: `simple-recipes`
3. Make Public (for URLs to be accessible)
4. RLS Policy: Allow public read, admin write

---

## PHASE 4.6: Testing Checklist

### Test List Page
- [ ] Navigate to /dashboard/simple-recipes
- [ ] Table loads and shows recipes (initially empty or with seed data)
- [ ] Search works (debounced, filters by name)
- [ ] Source type filter works
- [ ] Status filter works
- [ ] Create button visible
- [ ] Edit button navigates to [id] page
- [ ] Delete button shows confirmation dialog

### Test Create New Recipe
- [ ] Click "Create" button
- [ ] Navigate to /dashboard/simple-recipes/new
- [ ] Fill all tabs:
  - Basic Info (names BG/EN, description, dessert type)
  - Source (type, URL, video duration)
  - Ingredients (add multiple, nutrition calculates)
  - Steps (add with descriptions, duration, equipment)
  - Media (upload hero image)
  - Publishing (set status)
- [ ] Upload hero image - shows preview
- [ ] Save as Draft → recipe appears in list as draft
- [ ] Nutrition calculated correctly from ingredients

### Test Edit Recipe
- [ ] Click Edit on a recipe
- [ ] All fields pre-populated correctly
- [ ] Can modify any field
- [ ] Can add/remove ingredients
- [ ] Can add/remove/reorder steps
- [ ] Can change image
- [ ] Publish status can change
- [ ] Save → list updates

### Test Delete Recipe
- [ ] Click Delete
- [ ] Confirm dialog appears
- [ ] Cancel → stays on page
- [ ] Confirm → recipe deleted from list

### Test Image Upload
- [ ] Upload JPG/PNG
- [ ] Shows in preview
- [ ] Public URL generated and accessible
- [ ] Can delete image

### Test Publish/Unpublish
- [ ] Draft recipe: save as draft, published_at = NULL
- [ ] Draft → Publish: published_at = NOW(), shows in mobile
- [ ] Published → Unpublish: published_at = NULL, hides from mobile

### Test Database Verification
```sql
-- All simple recipes stored correctly
SELECT id, name_en, is_simple_recipe, source_type, published_at 
FROM base_recipes 
WHERE is_simple_recipe = TRUE;

-- Ingredients linked correctly
SELECT br.name_en, COUNT(ri.id) as ingredient_count
FROM base_recipes br
LEFT JOIN recipe_ingredients ri ON br.id = ri.base_recipe_id
WHERE br.is_simple_recipe = TRUE
GROUP BY br.id, br.name_en;

-- Steps linked correctly
SELECT br.name_en, COUNT(ris.id) as step_count
FROM base_recipes br
LEFT JOIN recipe_instruction_steps ris ON br.id = ris.base_recipe_id
WHERE br.is_simple_recipe = TRUE
GROUP BY br.id, br.name_en;
```

### Test Console Logs
- [ ] No errors in browser console
- [ ] API logs show: `[Simple Recipes API]` prefix
- [ ] Uploads show: `[Simple Recipes Upload]` logs

---

## Deliverables for Phase 4

- [x] List page (search, filter, CRUD buttons)
- [x] Create new recipe page (full form)
- [x] Edit recipe page (full form)
- [x] Delete recipe with confirmation
- [x] Image upload with preview
- [x] Ingredient management with nutrition calculation
- [x] Step management
- [x] Bilingual support (BG/EN)
- [x] Source type tracking (TikTok, Instagram, website, manual)
- [x] Publish/unpublish toggle
- [x] API routes (GET, POST, PATCH, DELETE)
- [x] Image upload API + Supabase bucket
- [x] Database verification queries

---

## Summary

**Admin Panel - Simple Recipes Management Complete**

**What you can do after Phase 4:**
- ✅ Add TikTok recipes in admin dashboard
- ✅ Upload hero images
- ✅ Add ingredients with automatic nutrition calculation
- ✅ Add step-by-step instructions
- ✅ Track source (TikTok, Instagram, blog, manual)
- ✅ Publish recipes for all users to see
- ✅ Delete recipes (with ingredient/step cleanup)

**Next Phase (Phase 5):** Mobile "Save Recipe" UI for users

---

## Reports to Provide

After completing Phase 4, provide:

1. **Screenshot of list page** (showing recipes if any exist)
2. **Screenshot of create/edit form** (showing all tabs)
3. **Screenshot of successfully uploaded image** (with public URL)
4. **Database query results:**
   ```sql
   SELECT COUNT(*) as total_simple_recipes FROM base_recipes WHERE is_simple_recipe = TRUE;
   SELECT COUNT(*) as total_ingredients FROM recipe_ingredients WHERE base_recipe_id IN (SELECT id FROM base_recipes WHERE is_simple_recipe = TRUE);
   ```
5. **Console logs** showing successful operations
6. **Tested workflows:**
   - Create simple recipe
   - Add ingredients
   - Upload image
   - Publish recipe
   - Edit recipe
   - Delete recipe

---

## Notes

- Use existing ready-recipes admin dashboard as reference for styling
- Keep consistent with admin panel theme and patterns
- Toast notifications for all actions
- Loading states for API calls
- Error handling with user-friendly messages
- Debounced search (300ms)
- Bilingual support for all text fields (BG/EN)