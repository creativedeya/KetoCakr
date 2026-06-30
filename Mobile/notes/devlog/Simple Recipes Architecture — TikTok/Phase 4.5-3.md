# Phase 4.5.3: Enhanced Step Images with Settings Management

## Goal
Add FULL step image management to simple recipes - with settings controls (background, angle, lighting) 
just like in base_recipes.

Admin can:
- ✅ Generate step images with specific styles
- ✅ Control background (marble, wood, concrete, white)
- ✅ Control camera angle (overhead, 45deg, closeup, 3/4 view)
- ✅ Control lighting (natural, studio, golden, bright)
- ✅ Add custom hints (no hands, show equipment, etc)
- ✅ Set reference image for visual consistency
- ✅ Compare old vs new images
- ✅ See large previews
- ✅ Upload own images

---

## TASK 1: Clone EnhancedStepImages.tsx

### File: `Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx`

**Copy EXACTLY from:**
```
Admin/app/dashboard/base-recipes/[id]/EnhancedStepImages.tsx
```

**Paste into:**
```
Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx
```

**NO CHANGES NEEDED** - works as-is because:
- Queries `recipe_instruction_steps` by `base_recipe_id` ✅
- Simple recipes stored in `base_recipes` with `is_simple_recipe = TRUE` ✅
- API routes already support both base and simple ✅

---

## TASK 2: Add Settings Panel to EnhancedStepImages

Inside the `EnhancedStepImages` component, add settings controls BEFORE image preview:

### Add Settings State

```typescript
// In EnhancedStepImages component state:

const [stepSettings, setStepSettings] = useState<{
  [stepNumber: number]: {
    photoStyle: 'overhead' | 'angle45' | 'closeup' | 'threequarter';
    lighting: 'natural' | 'studio' | 'golden' | 'bright';
    background: 'marble' | 'wood' | 'concrete' | 'white';
    texture?: string;  // Additional texture hint
  }
}>(() => {
  const initial: { [key: number]: any } = {};
  steps.forEach(step => {
    initial[step.step_number] = {
      photoStyle: 'overhead',
      lighting: 'studio',
      background: 'marble',
      texture: 'slate'
    };
  });
  return initial;
});

// Display current settings
const [showSettings, setShowSettings] = useState<{
  [stepNumber: number]: boolean
}>({});
```

### Add Settings UI Component

```typescript
// Add this BEFORE the image preview section in the step render:

{/* SETTINGS PANEL */}
<div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
  <div className="flex items-center justify-between mb-3">
    <h4 className="font-semibold text-gray-900">CURRENT SETTINGS</h4>
    <button
      onClick={() => setShowSettings(prev => ({
        ...prev,
        [step.step_number]: !prev[step.step_number]
      }))}
      className="text-sm text-blue-600 hover:text-blue-700"
    >
      {showSettings[step.step_number] ? '▼ Hide' : '▶ Customize'}
    </button>
  </div>

  {/* Display Current Settings */}
  <div className="space-y-1 text-sm mb-3">
    <div className="flex justify-between">
      <span className="font-medium text-gray-700">Background:</span>
      <span className="text-gray-900">{stepSettings[step.step_number]?.background || 'marble'}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-medium text-gray-700">Angle:</span>
      <span className="text-gray-900">{stepSettings[step.step_number]?.photoStyle || 'overhead'}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-medium text-gray-700">Lighting:</span>
      <span className="text-gray-900">{stepSettings[step.step_number]?.lighting || 'studio'}</span>
    </div>
    <div className="flex justify-between">
      <span className="font-medium text-gray-700">Texture:</span>
      <span className="text-gray-900">{stepSettings[step.step_number]?.texture || 'slate'}</span>
    </div>
  </div>

  {/* Edit Settings */}
  {showSettings[step.step_number] && (
    <div className="space-y-3 pt-3 border-t border-gray-300">
      {/* Background Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Background Surface
        </label>
        <select
          value={stepSettings[step.step_number]?.background || 'marble'}
          onChange={(e) => setStepSettings(prev => ({
            ...prev,
            [step.step_number]: {
              ...prev[step.step_number],
              background: e.target.value as any
            }
          }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="marble">Marble - Clean white marble countertop</option>
          <option value="wood">Wood - Warm natural wood surface</option>
          <option value="concrete">Concrete - Light grey concrete surface</option>
          <option value="white">White - Pure white background</option>
        </select>
      </div>

      {/* Angle/Style Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Camera Angle
        </label>
        <select
          value={stepSettings[step.step_number]?.photoStyle || 'overhead'}
          onChange={(e) => setStepSettings(prev => ({
            ...prev,
            [step.step_number]: {
              ...prev[step.step_number],
              photoStyle: e.target.value as any
            }
          }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="overhead">Overhead - Flat lay, bird's eye view</option>
          <option value="angle45">45 Degrees - Elevated angle view</option>
          <option value="threequarter">3/4 View - Professional three-quarter angle</option>
          <option value="closeup">Close-up - Detail shot, shallow depth</option>
        </select>
      </div>

      {/* Lighting Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lighting Style
        </label>
        <select
          value={stepSettings[step.step_number]?.lighting || 'studio'}
          onChange={(e) => setStepSettings(prev => ({
            ...prev,
            [step.step_number]: {
              ...prev[step.step_number],
              lighting: e.target.value as any
            }
          }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="natural">Natural - Window daylight, soft diffused</option>
          <option value="studio">Studio - Professional studio lighting</option>
          <option value="golden">Golden - Warm golden hour lighting</option>
          <option value="bright">Bright - Clean bright lighting, minimal shadows</option>
        </select>
      </div>

      {/* Texture/Additional Hints */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texture/Additional Hints
        </label>
        <input
          type="text"
          placeholder="e.g., slate, rustic, modern, etc"
          value={stepSettings[step.step_number]?.texture || ''}
          onChange={(e) => setStepSettings(prev => ({
            ...prev,
            [step.step_number]: {
              ...prev[step.step_number],
              texture: e.target.value
            }
          }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )}
</div>
```

---

## TASK 3: Update Generate Function to Pass Settings

Modify the `generateSingleStep` function to send settings to API:

```typescript
async function generateSingleStep(stepNumber: number) {
  const step = steps.find(s => s.step_number === stepNumber);
  if (!step) return;

  const currentState = stepImages[stepNumber] || {};
  const hints = currentState.customHints || '';
  const settings = stepSettings[stepNumber] || {};
  
  // ... existing code ...

  try {
    const response = await fetch('/api/generate-step-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipeId,
        stepNumber,
        stepDescription: step.step_description_bg || step.step_description,
        stepDescriptionEn: step.step_description_en,
        customHints: hints || undefined,
        referenceImageUrl: referenceImageUrl,
        
        // ✅ NEW: Pass settings to API
        photoStyle: settings.photoStyle || 'overhead',
        lighting: settings.lighting || 'studio',
        background: settings.background || 'marble',
        texture: settings.texture || undefined
      })
    });
    
    // ... rest of existing code ...
  }
}
```

---

## TASK 4: Update generate-step-image API to Use Settings

### File: `Admin/app/api/generate-step-image/route.ts`

Update to use the settings in prompt generation:

```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipeId,
      stepNumber,
      stepDescription,
      stepDescriptionEn,
      customHints,
      referenceImageUrl,
      photoStyle = 'overhead',
      lighting = 'studio',
      background = 'marble',
      texture
    } = body;

    // ... existing code ...

    // ✅ Build prompt with settings
    const prompt = buildPromptWithSettings(
      stepDescription,
      stepDescriptionEn,
      customHints,
      photoStyle,
      lighting,
      background,
      texture
    );

    // Generate with Gemini (or Replicate, depending on which you use)
    // ... existing code ...
  }
}

// ✅ NEW: Settings-aware prompt builder
function buildPromptWithSettings(
  stepDescription: string,
  stepDescriptionEn: string,
  customHints: string = '',
  photoStyle: string = 'overhead',
  lighting: string = 'studio',
  background: string = 'marble',
  texture: string = ''
): string {
  
  // Map settings to descriptions (same as base_recipes)
  const PHOTO_STYLES = {
    overhead: 'Professional overhead flat lay food photography, directly from above, bird\'s eye view perspective',
    angle45: 'Professional 45-degree elevated angle food photography',
    closeup: 'Professional close-up detail food photography, shallow depth of field',
    threequarter: 'Professional three-quarter view food photography'
  };

  const LIGHTING_STYLES = {
    natural: 'Natural daylight from window, soft diffused lighting',
    studio: 'Professional studio lighting, controlled soft shadows',
    golden: 'Golden hour warm lighting, soft glowing ambiance',
    bright: 'Bright clean lighting, minimal shadows'
  };

  const BACKGROUND_STYLES = {
    marble: 'Clean white marble countertop surface',
    wood: 'Warm natural wood surface, rustic aesthetic',
    concrete: 'Light grey concrete surface, modern minimal',
    white: 'Pure white background, clean and simple'
  };

  const EMMA_STUDIO_BASE = `
Emma's Cake Studio aesthetic.
Clean, minimal, professional food magazine quality.
High-end pastry photography.
Realistic, not overly stylized.
Focus on the food and action.
No text, no numbers, no labels visible.`.trim();

  const photoDesc = PHOTO_STYLES[photoStyle as keyof typeof PHOTO_STYLES] || PHOTO_STYLES.overhead;
  const lightingDesc = LIGHTING_STYLES[lighting as keyof typeof LIGHTING_STYLES] || LIGHTING_STYLES.studio;
  const backgroundDesc = BACKGROUND_STYLES[background as keyof typeof BACKGROUND_STYLES] || BACKGROUND_STYLES.marble;

  const descriptionText = stepDescriptionEn || stepDescription;
  
  return `${photoDesc} depicting: ${descriptionText}

Style requirements:
- ${backgroundDesc}
- ${lightingDesc}
${texture ? `- Texture/style: ${texture}` : ''}
- ${EMMA_STUDIO_BASE}

${customHints ? `Additional instructions: ${customHints}` : ''}

Composition:
- Show hands performing the action when relevant
- Include only necessary ingredients and tools visible in frame
- Center the main action/ingredient
- Clean, uncluttered composition
- Square format composition

Quality: High resolution, sharp focus on main subject, professional food photography standard.`.trim();
}
```

---

## TASK 5: Integration with Simple Recipe Page

### File: `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

```typescript
'use client';

import { EnhancedStepImages } from './EnhancedStepImages';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function SimpleRecipeDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [recipe, setRecipe] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipeAndSteps();
  }, [params.id]);

  const loadRecipeAndSteps = async () => {
    try {
      // Load simple recipe from base_recipes
      const { data: recipeData, error: recipeError } = await supabase
        .from('base_recipes')
        .select('*')
        .eq('id', params.id)
        .eq('is_simple_recipe', true)
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
  if (!recipe) return <div>Recipe not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Recipe Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">{recipe.name_en}</h1>
        <p className="text-lg text-gray-600 mt-2">{recipe.name_bg}</p>
        {recipe.description_en && (
          <p className="mt-4 text-gray-700">{recipe.description_en}</p>
        )}
      </div>

      {/* STEP IMAGES - WITH FULL SETTINGS MANAGEMENT */}
      <section className="border-t pt-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Step-by-Step Instructions with Visual Guide
        </h2>
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Customize image style:</strong> Each step can have different background, 
            camera angle, and lighting. Set a reference image to maintain visual consistency 
            across all steps.
          </p>
        </div>

        {/* ✅ ENHANCED STEP IMAGES COMPONENT */}
        <EnhancedStepImages 
          recipeId={params.id}
          steps={steps}
          onStepsUpdate={loadRecipeAndSteps}
        />
      </section>

      {/* Nutrition Info */}
      {recipe.total_calories && (
        <section className="border-t pt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Nutrition</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {recipe.total_calories}
              </div>
              <div className="text-sm text-gray-600">Calories</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {recipe.total_protein}g
              </div>
              <div className="text-sm text-gray-600">Protein</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {recipe.total_fat}g
              </div>
              <div className="text-sm text-gray-600">Fat</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {recipe.total_net_carbs}g
              </div>
              <div className="text-sm text-gray-600">Net Carbs</div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
```

---

## Testing Checklist

### Test Settings Display
- [ ] Open simple recipe detail page
- [ ] Scroll to "Step-by-Step Images"
- [ ] See "CURRENT SETTINGS" panel with defaults
- [ ] Click "Customize" to expand settings

### Test Settings Customization
- [ ] Change Background (marble → wood)
- [ ] Change Angle (overhead → 45 degrees)
- [ ] Change Lighting (studio → golden)
- [ ] Add Texture hint ("rustic")
- [ ] Settings update display

### Test Image Generation with Settings
- [ ] Generate step image
- [ ] Image generated with selected settings
- [ ] Background matches choice
- [ ] Angle matches choice
- [ ] Lighting matches choice
- [ ] Add custom hints: "no hands, show mixer"
- [ ] Image respects both settings + custom hints

### Test Reference Image
- [ ] Generate Step 1 with: marble, overhead, studio
- [ ] Click "Set as Reference"
- [ ] Generate Step 2 with: different background setting
- [ ] Step 2 should match Step 1 visual style (overrides manual settings)

### Test Large Preview
- [ ] Generated images display large
- [ ] Can see details clearly
- [ ] Can assess quality

### Test Compare Mode
- [ ] Regenerate with different settings
- [ ] Previous vs New show side-by-side
- [ ] Can pick best one

### Database Verification
```sql
-- Check settings are passed to API (check image_generation_hints)
SELECT 
  step_number,
  step_description,
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

**What you're implementing:**

✅ Settings panel with Background, Angle, Lighting, Texture options
✅ Each step can have different settings
✅ Settings passed to AI generation API
✅ API uses settings in prompt engineering
✅ Custom hints + settings work together
✅ Reference image for visual consistency
✅ Large previews for quality assessment
✅ Compare mode for version selection
✅ Same workflow as base_recipes

**Time:** 1-2 hours with testing

**Result:** Professional, customizable step image generation! 🎨

---

## Reports to Provide

1. **Screenshot of Settings Panel** (expanded with all dropdowns)
2. **Screenshot of Generated Image** (with specific settings applied)
3. **Screenshot of Reference Image Set** (consistency across steps)
4. **Screenshot of Compare Mode** (old vs new)
5. **Console logs** showing settings passed to API
6. **Database query results** showing steps with images saved

---

Good luck! 🚀