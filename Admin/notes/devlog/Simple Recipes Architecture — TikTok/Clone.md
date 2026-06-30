# EnhancedStepImages for Simple Recipes - CLONE OF BASE_RECIPES

## File: Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx

This is an EXACT CLONE of the base_recipes EnhancedStepImages component, 
adapted for simple_recipes (which are stored in base_recipes with is_simple_recipe = TRUE).

**Key Features (inherited from base_recipes):**
- ✅ Large image preview (can see details clearly)
- ✅ Custom hints for generation (e.g., "no hands", "yellow bowl", "top view")
- ✅ Reference image selection (visual consistency across steps)
- ✅ Compare mode (old vs new images side-by-side)
- ✅ Upload own images
- ✅ Save/unsave management
- ✅ AI Interpretation details

---

## Implementation

Copy the ENTIRE EnhancedStepImages.tsx from base_recipes:

**File:** `/home/claude/KetoCakr/Admin/app/dashboard/base-recipes/[id]/EnhancedStepImages.tsx`

Then PASTE into:

**File:** `/home/claude/KetoCakr/Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx`

**Make ONLY these minimal changes:**

### Change 1: Update imports (if needed)
```typescript
// No changes usually needed - same imports
```

### Change 2: Update in your simple-recipes/[id]/page.tsx to use the component:

```typescript
'use client';

import { EnhancedStepImages } from './EnhancedStepImages';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SimpleRecipeDetailPage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipeAndSteps();
  }, [params.id]);

  const loadRecipeAndSteps = async () => {
    try {
      // Load recipe (from base_recipes with is_simple_recipe = TRUE)
      const { data: recipeData, error: recipeError } = await supabase
        .from('base_recipes')
        .select('*')
        .eq('id', params.id)
        .eq('is_simple_recipe', true)  // ← Only simple recipes
        .single();

      if (recipeError) throw recipeError;

      setRecipe(recipeData);

      // Load steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('recipe_instruction_steps')
        .select('*')
        .eq('base_recipe_id', params.id)
        .order('step_number', { ascending: true });

      if (stepsError) throw stepsError;

      setSteps(stepsData || []);
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Recipe header, etc */}
      <h1>{recipe?.name_en}</h1>

      {/* 🎨 STEP IMAGES - WITH FULL ENHANCEMENT MODE */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Step-by-Step Images</h2>
        <EnhancedStepImages 
          recipeId={params.id}
          steps={steps}
          onStepsUpdate={loadRecipeAndSteps}
        />
      </section>
    </div>
  );
}
```

---

## API Routes Needed (Use EXISTING Routes from Base Recipes)

These API routes ALREADY EXIST and work for both base_recipes AND simple_recipes:

### 1. Generate Step Image
**File:** `/Admin/app/api/generate-step-image/route.ts`

Already supports `base_recipe_id` parameter.
No changes needed - works for simple recipes too!

**Usage:**
```typescript
POST /api/generate-step-image
Body: {
  recipeId: "uuid-of-simple-recipe",
  stepNumber: 1,
  stepDescription: "Mix ingredients...",
  stepDescriptionEn: "Mix ingredients...",
  customHints: "no hands, yellow bowl, top view",
  referenceImageUrl: "https://..." // For visual consistency
}
```

### 2. Upload Step Image
**File:** `/Admin/app/api/upload-step-image/route.ts`

Already supports `base_recipe_id` parameter.
No changes needed - works for simple recipes too!

**Usage:**
```typescript
POST /api/upload-step-image
Body: FormData {
  file: File,
  recipeId: "uuid-of-simple-recipe",
  stepNumber: 1
}
```

### 3. Save Step Image (to DB)
**File:** `/Admin/app/api/save-step-image/route.ts`

Updates `recipe_instruction_steps.step_image_url` where `base_recipe_id = recipeId`.
Works for both base and simple recipes!

---

## What You Get (EXACT Same as Base Recipes)

### 1. Large Image Preview
```
┌─────────────────────────────┐
│                             │
│    Generated Step Image     │
│    (Large, detailed)        │
│    Can see all details      │
│                             │
└─────────────────────────────┘
```

### 2. Custom Hints Input
```
Custom Instructions (optional):
[________________________________]
e.g., 'no hands', 'top view', 'show vanilla extract'
```

Examples:
- "no hands" - hidden
- "yellow bowl" - specific colors
- "top-down view" - camera angle
- "show the mixer" - highlight equipment
- "without the person" - no hands visible
- etc.

### 3. Reference Image Selection
```
Step 1 Image → [Set as Reference] button
  ↓
All future steps generated with same:
- Background
- Lighting
- Equipment in frame
- Camera angle
- Hands/person style
- Overall aesthetic
```

### 4. Compare Mode (Old vs New)
```
┌──────────┐  ┌──────────┐
│ Previous │  │   New    │
│ Image    │  │ Image    │
│          │  │          │
├──────────┤  ├──────────┤
│Keep This │  │Keep This │
└──────────┘  └──────────┘

Switch between versions instantly
```

### 5. AI Interpretation Details
```
[View AI Interpretation] ▼
  {
    "background": "kitchen counter",
    "angle": "3/4 from above",
    "equipment": "mixing bowl, whisk",
    "lighting": "natural daylight",
    "hands_visible": false
  }
```

---

## Testing Checklist

### Test Image Generation with Hints
- [ ] Open simple recipe [id] page
- [ ] Scroll to "Step-by-Step Images" section
- [ ] Click "AI Generate" for a step
- [ ] Add custom hint: "no hands, yellow bowl"
- [ ] Click "Generate"
- [ ] Image appears with correct hints applied

### Test Reference Image
- [ ] Generate image for Step 1
- [ ] Click "Set as Reference"
- [ ] See confirmation message
- [ ] Generate image for Step 2
- [ ] Step 2 image should match Step 1 style (background, angle, etc)

### Test Compare Mode
- [ ] Generate image for Step 1
- [ ] Regenerate (with different hints)
- [ ] Previous vs New images show side-by-side
- [ ] Can switch between versions
- [ ] Pick best one with "Keep This" button

### Test Large Preview
- [ ] Generate image
- [ ] Image displays large enough to see details
- [ ] Can zoom/inspect if needed
- [ ] Details clearly visible

### Test Custom Hints
- [ ] "no hands" - person not visible
- [ ] "top view" - camera looking down
- [ ] "show mixer" - equipment visible
- [ ] "white background" - no clutter
- [ ] Multiple hints: "no hands, white bowl, top-down"

### Test Upload
- [ ] Click "Upload Image" for a step
- [ ] Select JPG/PNG from computer
- [ ] Image uploads and displays
- [ ] "Saved" badge appears

### Database Verification
```sql
-- Check step images are saved
SELECT 
  step_number, 
  step_image_url,
  image_generation_hints
FROM recipe_instruction_steps
WHERE base_recipe_id = 'your-simple-recipe-id'
ORDER BY step_number;

-- Check reference image
SELECT 
  name_en,
  reference_image_url
FROM base_recipes
WHERE id = 'your-simple-recipe-id'
AND is_simple_recipe = TRUE;
```

---

## Summary

**What you're getting:**

✅ Full EnhancedStepImages component (copy-pasted from base_recipes)
✅ Large image previews (see details clearly)
✅ Custom hints for AI (control exact appearance)
✅ Reference images (visual consistency)
✅ Compare mode (old vs new)
✅ Upload own images
✅ Works with EXISTING API routes (no new APIs needed)

**Time to implement:** 5 minutes (just copy-paste + small page.tsx update)

**Result:** Identical image generation workflow as base_recipes ✨

---

## Important Notes

1. **EnhancedStepImages.tsx is ALREADY PERFECT** - just copy-paste it
2. **API routes already work** - they use `base_recipe_id` which works for simple recipes too
3. **Simple recipes are stored in base_recipes** - so all existing code works
4. **No new APIs needed** - use existing /api/generate-step-image, /api/upload-step-image, /api/save-step-image

---

## Quick Copy Instructions

1. **Copy EnhancedStepImages.tsx:**
   ```
   From: /home/claude/KetoCakr/Admin/app/dashboard/base-recipes/[id]/EnhancedStepImages.tsx
   To: /home/claude/KetoCakr/Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx
   ```

2. **Update simple-recipes/[id]/page.tsx:**
   ```typescript
   import { EnhancedStepImages } from './EnhancedStepImages';
   
   // In your page component, add:
   <EnhancedStepImages 
     recipeId={params.id}
     steps={stepsData}
     onStepsUpdate={refreshSteps}
   />
   ```

3. **Test:**
   - Open simple recipe detail page
   - Generate step images with custom hints
   - Set reference image
   - Verify images appear large and correctly

Done! 🚀