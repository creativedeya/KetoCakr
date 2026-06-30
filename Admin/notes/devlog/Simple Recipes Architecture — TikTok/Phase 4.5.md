# Phase 4.5: Simple Recipes - Auto-Parse & Image Generation

## Goal
Add intelligent features to simple recipe management:
1. Auto-parse ingredients from recipe description (Claude AI)
2. Auto-parse steps from recipe description (Claude AI)
3. Generate step images using Gemini 2.5 Flash Image (same as base_recipes)
4. Fallback to manual entry if parsing fails

---

## PHASE 4.5.1: Auto-Parse Ingredients from Description

### New API Route: Parse Ingredients

**File:** `Admin/app/api/simple-recipes/parse-ingredients/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ParseIngredientsRequest {
  description: string;  // Recipe description text
  language?: string;    // 'bg' or 'en'
}

interface ParsedIngredient {
  name: string;
  name_bg?: string;
  name_en?: string;
  quantity: number;
  unit: string;
  confidence: number;  // 0-1 (how confident we are)
}

export async function POST(req: NextRequest) {
  try {
    const body: ParseIngredientsRequest = await req.json();
    const { description, language = 'en' } = body;

    if (!description || description.length < 20) {
      return NextResponse.json(
        { error: 'Description too short to parse' },
        { status: 400 }
      );
    }

    console.log('[Parse Ingredients API] Processing:', description.substring(0, 50));

    const prompt = `You are an expert at extracting ingredients from recipe descriptions.

Recipe Description:
${description}

Please extract ALL ingredients mentioned in this recipe description.

Return ONLY valid JSON in this format (no markdown, no code blocks):
{
  "ingredients": [
    {
      "name": "ingredient name in English",
      "name_bg": "ingredient name in Bulgarian (if identifiable)",
      "name_en": "ingredient name in English",
      "quantity": 2,
      "unit": "tbsp",
      "confidence": 0.95
    }
  ],
  "total_ingredients": 5,
  "parsing_notes": "Any notes about parsing"
}

Rules:
- Include quantity and unit (g, ml, tsp, tbsp, cup, oz, piece, etc)
- confidence: 0.0-1.0 (1.0 = very confident, 0.5 = uncertain, include anyway)
- If unit is ambiguous, use most common (e.g., "cocoa" = "2 tbsp" = reasonable default)
- Include ALL mentioned ingredients, even spices and seasonings
- If ingredient has common Bulgarian name, include name_bg
- Order by appearance in description`;

    console.log('[Parse Ingredients API] Calling Claude...');

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('[Parse Ingredients API] Response:', responseText.substring(0, 200));

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error('[Parse Ingredients API] JSON parse error:', responseText);
      throw new Error('Failed to parse Claude response as JSON');
    }

    if (!parsedData.ingredients || !Array.isArray(parsedData.ingredients)) {
      throw new Error('Invalid response format: missing ingredients array');
    }

    console.log('[Parse Ingredients API] Parsed', parsedData.ingredients.length, 'ingredients');

    return NextResponse.json({
      success: true,
      ingredients: parsedData.ingredients,
      total: parsedData.total_ingredients || parsedData.ingredients.length,
      notes: parsedData.parsing_notes,
    });
  } catch (error: any) {
    console.error('[Parse Ingredients API] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to parse ingredients' },
      { status: 500 }
    );
  }
}
```

---

## PHASE 4.5.2: Auto-Parse Steps from Description

### New API Route: Parse Steps

**File:** `Admin/app/api/simple-recipes/parse-steps/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ParseStepsRequest {
  description: string;  // Recipe description text
  language?: string;    // 'bg' or 'en'
}

interface ParsedStep {
  step_number: number;
  step_description: string;
  step_description_bg?: string;
  step_description_en?: string;
  step_duration_minutes?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: ParseStepsRequest = await req.json();
    const { description, language = 'en' } = body;

    if (!description || description.length < 30) {
      return NextResponse.json(
        { error: 'Description too short to parse' },
        { status: 400 }
      );
    }

    console.log('[Parse Steps API] Processing:', description.substring(0, 50));

    const prompt = `You are an expert at extracting cooking steps from recipe descriptions.

Recipe Description:
${description}

Please extract the step-by-step instructions from this recipe description.

Return ONLY valid JSON in this format (no markdown, no code blocks):
{
  "steps": [
    {
      "step_number": 1,
      "step_description": "Mix cocoa powder with eggs and sugar",
      "step_description_bg": "Смесете какаото със яйца и захар",
      "step_description_en": "Mix cocoa powder with eggs and sugar",
      "step_duration_minutes": 5
    },
    {
      "step_number": 2,
      "step_description": "Pour into mug and microwave for 90 seconds",
      "step_description_bg": "Налейте в чаша и микровълнирайте за 90 секунди",
      "step_description_en": "Pour into mug and microwave for 90 seconds",
      "step_duration_minutes": 2
    }
  ],
  "total_steps": 2,
  "parsing_notes": "Duration estimates are rough"
}

Rules:
- Number steps sequentially (1, 2, 3, etc)
- Each step should be 1-3 sentences, concise but complete
- Extract duration if mentioned (e.g., "microwave 90 sec" = 2 minutes for the step)
- If duration not mentioned, estimate based on typical cooking time
- Include both step_description_bg (Bulgarian) and step_description_en (English)
- If original is in one language, translate to the other
- Preserve specific details (temperatures, times, quantities)`;

    console.log('[Parse Steps API] Calling Claude...');

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    console.log('[Parse Steps API] Response:', responseText.substring(0, 200));

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error('[Parse Steps API] JSON parse error:', responseText);
      throw new Error('Failed to parse Claude response as JSON');
    }

    if (!parsedData.steps || !Array.isArray(parsedData.steps)) {
      throw new Error('Invalid response format: missing steps array');
    }

    console.log('[Parse Steps API] Parsed', parsedData.steps.length, 'steps');

    return NextResponse.json({
      success: true,
      steps: parsedData.steps,
      total: parsedData.total_steps || parsedData.steps.length,
      notes: parsedData.parsing_notes,
    });
  } catch (error: any) {
    console.error('[Parse Steps API] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to parse steps' },
      { status: 500 }
    );
  }
}
```

---

## PHASE 4.5.3: Generate Step Image with Gemini

### New API Route: Generate Step Image

**File:** `Admin/app/api/simple-recipes/generate-step-image/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const client = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

interface GenerateImageRequest {
  recipe_id: string;
  step_number: number;
  step_description: string;
  recipe_name?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateImageRequest = await req.json();
    const { recipe_id, step_number, step_description, recipe_name } = body;

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY not configured');
    }

    console.log('[Generate Step Image API] Generating for:', recipe_name, 'step', step_number);

    // Build prompt for Gemini
    const prompt = `Generate a professional cooking/baking step-by-step instruction photo.

Recipe: ${recipe_name || 'Recipe'}
Step ${step_number}: ${step_description}

Requirements:
- High quality, clean professional food photography
- Clear, well-lit with natural lighting
- Shows the actual cooking/baking action clearly
- Professional recipe instruction style
- Looks like a food blog step-by-step photo
- 1024x1024 aspect ratio`;

    console.log('[Generate Step Image API] Calling Gemini 2.5 Flash Image...');

    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    const imageGenResponse = await model.generateContent([
      {
        text: prompt,
      },
    ]);

    const response = imageGenResponse.response;

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error('No valid response from Gemini API');
    }

    // Get image from response
    const parts = response.candidates[0].content.parts;
    let imageData = null;

    for (const part of parts) {
      if (part.inlineData) {
        imageData = part.inlineData;
        break;
      }
    }

    if (!imageData) {
      throw new Error('No image data in Gemini response');
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(imageData.data, 'base64');

    // Upload to Supabase
    const timestamp = Date.now();
    const filename = `simple-recipes/${recipe_id}/step-${step_number}-${timestamp}.png`;

    console.log('[Generate Step Image API] Uploading to Supabase:', filename);

    const { data, error } = await supabase.storage
      .from('simple-recipes')
      .upload(filename, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('simple-recipes')
      .getPublicUrl(data.path);

    console.log('[Generate Step Image API] Uploaded to Supabase:', urlData.publicUrl);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
      mimeType: imageData.mimeType,
    });
  } catch (error: any) {
    console.error('[Generate Step Image API] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Image generation failed' },
      { status: 500 }
    );
  }
}
```

---

## PHASE 4.5.4: UI Components for Auto-Parse

### Component: Auto-Parse Modal

**File:** `Admin/app/dashboard/simple-recipes/components/AutoParseModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Wand2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AutoParseModalProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  onIngredientsFound: (ingredients: any[]) => void;
  onStepsFound: (steps: any[]) => void;
}

export default function AutoParseModal({
  isOpen,
  onClose,
  description,
  onIngredientsFound,
  onStepsFound,
}: AutoParseModalProps) {
  const { t } = useTranslation();
  const [isParsingIngredients, setIsParsingIngredients] = useState(false);
  const [isParsingSteps, setIsParsingSteps] = useState(false);
  const [parsedIngredients, setParsedIngredients] = useState<any[] | null>(null);
  const [parsedSteps, setParsedSteps] = useState<any[] | null>(null);
  const [ingredientErrors, setIngredientErrors] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<string | null>(null);

  const handleParseIngredients = async () => {
    if (!description.trim()) {
      toast.error('Please add a recipe description first');
      return;
    }

    try {
      setIsParsingIngredients(true);
      setIngredientErrors(null);
      console.log('[Auto Parse] Parsing ingredients from description');

      const response = await fetch('/api/simple-recipes/parse-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse ingredients');
      }

      const data = await response.json();
      console.log('[Auto Parse] Found', data.ingredients.length, 'ingredients');

      setParsedIngredients(data.ingredients);
      toast.success(`Found ${data.ingredients.length} ingredients`);
    } catch (error) {
      console.error('[Auto Parse] Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to parse ingredients';
      setIngredientErrors(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsParsingIngredients(false);
    }
  };

  const handleParseSteps = async () => {
    if (!description.trim()) {
      toast.error('Please add a recipe description first');
      return;
    }

    try {
      setIsParsingSteps(true);
      setStepErrors(null);
      console.log('[Auto Parse] Parsing steps from description');

      const response = await fetch('/api/simple-recipes/parse-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse steps');
      }

      const data = await response.json();
      console.log('[Auto Parse] Found', data.steps.length, 'steps');

      setParsedSteps(data.steps);
      toast.success(`Found ${data.steps.length} steps`);
    } catch (error) {
      console.error('[Auto Parse] Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to parse steps';
      setStepErrors(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsParsingSteps(false);
    }
  };

  const handleUseIngredients = () => {
    if (parsedIngredients) {
      onIngredientsFound(parsedIngredients);
      toast.success('Ingredients imported');
      onClose();
    }
  };

  const handleUseSteps = () => {
    if (parsedSteps) {
      onStepsFound(parsedSteps);
      toast.success('Steps imported');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Auto-Parse Recipe</DialogTitle>
          <DialogDescription>
            Claude AI will analyze your recipe description and extract ingredients and steps.
            Review results before accepting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ingredients Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Ingredients</h3>
              <Button
                onClick={handleParseIngredients}
                disabled={isParsingIngredients || !description.trim()}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                {isParsingIngredients && <Loader2 className="animate-spin" size={16} />}
                {isParsingIngredients ? 'Parsing...' : 'Parse Ingredients'}
              </Button>
            </div>

            {ingredientErrors && (
              <div className="flex gap-2 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="text-red-600" size={16} />
                <p className="text-sm text-red-600">{ingredientErrors}</p>
              </div>
            )}

            {parsedIngredients && (
              <div className="space-y-2">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-2">
                    ✓ Found {parsedIngredients.length} ingredients
                  </p>
                  <ul className="text-sm text-green-800 space-y-1">
                    {parsedIngredients.slice(0, 5).map((ing, i) => (
                      <li key={i}>
                        {ing.quantity} {ing.unit} {ing.name}
                      </li>
                    ))}
                    {parsedIngredients.length > 5 && (
                      <li>... and {parsedIngredients.length - 5} more</li>
                    )}
                  </ul>
                </div>
                <Button
                  onClick={handleUseIngredients}
                  size="sm"
                  className="w-full"
                >
                  Use These Ingredients
                </Button>
              </div>
            )}
          </div>

          {/* Steps Section */}
          <div className="space-y-3 border-t pt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Steps</h3>
              <Button
                onClick={handleParseSteps}
                disabled={isParsingSteps || !description.trim()}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                {isParsingSteps && <Loader2 className="animate-spin" size={16} />}
                {isParsingSteps ? 'Parsing...' : 'Parse Steps'}
              </Button>
            </div>

            {stepErrors && (
              <div className="flex gap-2 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="text-red-600" size={16} />
                <p className="text-sm text-red-600">{stepErrors}</p>
              </div>
            )}

            {parsedSteps && (
              <div className="space-y-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    ✓ Found {parsedSteps.length} steps
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {parsedSteps.slice(0, 5).map((step, i) => (
                      <li key={i}>
                        {step.step_number}. {step.step_description.substring(0, 50)}...
                      </li>
                    ))}
                    {parsedSteps.length > 5 && (
                      <li>... and {parsedSteps.length - 5} more</li>
                    )}
                  </ul>
                </div>
                <Button
                  onClick={handleUseSteps}
                  size="sm"
                  className="w-full"
                >
                  Use These Steps
                </Button>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
            <p className="text-xs text-amber-900">
              <strong>Tip:</strong> If parsing doesn't work well, you can always add ingredients and steps manually.
              Parse results are suggestions only.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Component: Image Generator Button (for Steps)

**File:** `Admin/app/dashboard/simple-recipes/components/GenerateStepImageButton.tsx`

```typescript
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerateStepImageButtonProps {
  recipe_id: string;
  step_number: number;
  step_description: string;
  recipe_name?: string;
  onImageGenerated: (url: string) => void;
}

export default function GenerateStepImageButton({
  recipe_id,
  step_number,
  step_description,
  recipe_name,
  onImageGenerated,
}: GenerateStepImageButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!step_description.trim()) {
      toast.error('Step description is required for image generation');
      return;
    }

    try {
      setIsGenerating(true);
      console.log('[Generate Step Image] Generating for step:', step_number);

      const response = await fetch('/api/simple-recipes/generate-step-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe_id,
          step_number,
          step_description,
          recipe_name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const data = await response.json();
      console.log('[Generate Step Image] Success:', data.url);

      onImageGenerated(data.url);
      toast.success('Image generated successfully');
    } catch (error) {
      console.error('[Generate Step Image] Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate image'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating || !step_description.trim()}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isGenerating && <Loader2 size={16} className="animate-spin" />}
      {isGenerating ? 'Generating...' : (
        <>
          <Wand2 size={16} />
          Generate with AI
        </>
      )}
    </Button>
  );
}
```

---

## PHASE 4.5.5: Integration with SimpleRecipeForm

### Update SimpleRecipeForm.tsx

**Add these sections:**

#### A. Add Auto-Parse Button to Description Section

```typescript
// In the description input section, add:
<div className="flex gap-2">
  <Button
    type="button"
    onClick={() => setShowAutoParseModal(true)}
    variant="outline"
    size="sm"
    disabled={!formData.description_en?.trim()}
    className="gap-2"
  >
    <Wand2 size={16} />
    Auto-Parse with AI
  </Button>
  <span className="text-xs text-gray-500 self-center">
    (Extracts ingredients & steps from description)
  </span>
</div>
```

#### B. Add Modal for Auto-Parse

```typescript
import AutoParseModal from './AutoParseModal';

// In component state:
const [showAutoParseModal, setShowAutoParseModal] = useState(false);

// In JSX, add modal:
<AutoParseModal
  isOpen={showAutoParseModal}
  onClose={() => setShowAutoParseModal(false)}
  description={formData.description_en || formData.description_bg || ''}
  onIngredientsFound={(ingredients) => {
    // Merge with existing or replace
    setIngredients(ingredients);
    setShowAutoParseModal(false);
  }}
  onStepsFound={(steps) => {
    // Merge with existing or replace
    setSteps(steps);
    setShowAutoParseModal(false);
  }}
/>
```

#### C. Add Image Generation to Steps Section

```typescript
// In the steps list, for each step, add image section:
import GenerateStepImageButton from './GenerateStepImageButton';

{/* Image Section */}
<div className="flex gap-2 mt-3">
  <GenerateStepImageButton
    recipe_id={recipe?.id || 'new'}
    step_number={step.step_number}
    step_description={step.step_description}
    recipe_name={formData.name_en}
    onImageGenerated={(url) => {
      // Update step image
      setSteps(prev => prev.map(s =>
        s.step_number === step.step_number
          ? { ...s, step_image_url: url }
          : s
      ));
    }}
  />
  
  {step.step_image_url && (
    <>
      <img
        src={step.step_image_url}
        alt={`Step ${step.step_number}`}
        className="h-12 w-12 object-cover rounded"
      />
      <Button
        type="button"
        onClick={() => {
          setSteps(prev => prev.map(s =>
            s.step_number === step.step_number
              ? { ...s, step_image_url: null }
              : s
          ));
        }}
        variant="outline"
        size="sm"
      >
        Remove
      </Button>
    </>
  )}
</div>
```

---

## PHASE 4.5.6: Testing Checklist

### Test Auto-Parse Ingredients
- [ ] Click "Auto-Parse with AI" button
- [ ] Modal opens with loading state
- [ ] Claude analyzes description
- [ ] Shows list of extracted ingredients with quantities
- [ ] Each ingredient has name, quantity, unit
- [ ] Can accept/cancel parsed ingredients
- [ ] Accepted ingredients populate the form

### Test Auto-Parse Steps
- [ ] Click "Parse Steps" in modal
- [ ] Claude analyzes description
- [ ] Shows numbered list of steps
- [ ] Each step has: number, description (BG/EN), duration estimate
- [ ] Can accept/cancel parsed steps
- [ ] Accepted steps populate the form

### Test Image Generation for Steps
- [ ] In steps section, see "Generate with AI" button
- [ ] Click button for a step
- [ ] Gemini 2.5 Flash generates image
- [ ] Image appears below step
- [ ] Can delete generated image
- [ ] Can regenerate with same/different description

### Test Error Handling
- [ ] If API fails: shows error message
- [ ] If description too short: shows validation error
- [ ] Can continue with manual entry if parsing fails
- [ ] Console shows `[Auto Parse]` and `[Generate Step Image]` logs

### Test Database
```sql
-- Verify ingredients saved correctly
SELECT base_recipe_id, COUNT(*) as ingredient_count
FROM recipe_ingredients
WHERE base_recipe_id IN (SELECT id FROM base_recipes WHERE is_simple_recipe = TRUE)
GROUP BY base_recipe_id;

-- Verify steps saved correctly
SELECT base_recipe_id, COUNT(*) as step_count, COUNT(DISTINCT step_image_url) as images_count
FROM recipe_instruction_steps
WHERE base_recipe_id IN (SELECT id FROM base_recipes WHERE is_simple_recipe = TRUE)
GROUP BY base_recipe_id;
```

---

## Deliverables for Phase 4.5

- [x] Parse Ingredients API (Claude AI)
- [x] Parse Steps API (Claude AI)
- [x] Generate Step Image API (Gemini 2.5 Flash Image)
- [x] AutoParseModal component
- [x] GenerateStepImageButton component
- [x] Integration into SimpleRecipeForm
- [x] Error handling and fallback to manual entry
- [x] Console logging for debugging
- [x] Testing verification

---

## Summary

**Simple Recipes - Enhanced with AI & Image Generation**

**What you can do after Phase 4.5:**
- ✅ Paste recipe description → auto-extract ingredients
- ✅ Paste recipe description → auto-extract steps
- ✅ If parsing fails, manually add ingredients/steps
- ✅ Generate professional images for each cooking step
- ✅ Full parity with base_recipes functionality

**Benefits:**
- 🚀 5-minute recipe creation (vs 30 minutes manual)
- 🤖 AI handles parsing errors gracefully
- 📸 Professional step-by-step images
- ✨ Same quality as base_recipes

---

## Reports to Provide

After completing Phase 4.5, provide:

1. **Screenshot of Auto-Parse Modal** (ingredients + steps)
2. **Screenshot of parsed ingredients** (accepted and shown in form)
3. **Screenshot of parsed steps** (with descriptions)
4. **Screenshot of generated step image** (from Gemini)
5. **Console logs** showing API calls:
   - `[Parse Ingredients API]` - parsing successful
   - `[Parse Steps API]` - parsing successful
   - `[Generate Step Image API]` - image generated
6. **Database verification:**
   ```sql
   SELECT COUNT(*) FROM recipe_ingredients WHERE base_recipe_id IN (...);
   SELECT COUNT(*) FROM recipe_instruction_steps WHERE base_recipe_id IN (...);
   ```
7. **Tested workflows:**
   - Auto-parse ingredients → accept
   - Auto-parse steps → accept
   - Generate step images → appear in form
   - Manual fallback (if parsing fails)

---

## Notes

- Use Claude 3.5 Sonnet for parsing (accurate, fast)
- Use Gemini 2.5 Flash Image for image generation (quality, cost-effective)
- Always provide fallback to manual entry
- Images should be professional food photography quality
- Console logs help debug parsing issues
- Keep existing manual entry workflow intact

---

Good luck! 🚀