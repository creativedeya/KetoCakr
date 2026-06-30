# Phase 4.5 Part 2: Ingredient Linking & Nutrition Calculation

## Problem
Parsed ingredients are just names/quantities - they're NOT linked to `ingredients_database`.

Without the link:
- ❌ No access to nutrition data (calories, protein, fat, carbs, etc)
- ❌ Can't auto-calculate recipe nutrition
- ❌ Duplicate data (same ingredient stored multiple ways)
- ❌ No consistency with base_recipes workflow

## Solution
**Implement the SAME ingredient linking workflow as base_recipes:**

1. Parse ingredients from description (Already done ✅)
2. **Match each parsed ingredient to ingredients_database** (NEW)
3. **Link with ingredient_database_id FK** (NEW)
4. **Fetch nutrition data from ingredients_database** (NEW)
5. **Auto-calculate recipe nutrition** (NEW)

---

## PHASE 4.5.2.1: Create Ingredient Matching API

### New API Route: Match Parsed Ingredients

**File:** `Admin/app/api/simple-recipes/match-ingredients/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findBestMatches } from '@/lib/fuzzyMatch';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ParsedIngredient {
  name: string;
  name_bg?: string;
  name_en?: string;
  quantity: number;
  unit: string;
}

interface MatchedIngredient extends ParsedIngredient {
  ingredient_database_id?: string;
  matched_name?: string;
  match_score?: number;
  nutrition?: {
    calories_per_100g: number;
    protein_per_100g: number;
    fat_per_100g: number;
    carbs_per_100g: number;
    net_carbs_per_100g: number;
    fiber_per_100g: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ingredients } = body as { ingredients: ParsedIngredient[] };

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: 'ingredients array is required' },
        { status: 400 }
      );
    }

    console.log('[Match Ingredients API] Matching', ingredients.length, 'ingredients');

    // Fetch all ingredients from database
    const { data: allIngredients, error: dbError } = await supabase
      .from('ingredients_database')
      .select('id, name_bg, name_en, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, net_carbs_per_100g, fiber_per_100g');

    if (dbError) throw dbError;

    if (!allIngredients || allIngredients.length === 0) {
      throw new Error('No ingredients found in database');
    }

    // Match each parsed ingredient
    const matchedIngredients: MatchedIngredient[] = ingredients.map((ingredient) => {
      // Try matching with English name first
      const searchName = ingredient.name_en || ingredient.name || '';

      // Use fuzzy matching (same as base_recipes)
      const matches = findBestMatches(
        searchName,
        allIngredients.map(ing => ({
          id: ing.id,
          name_bg: ing.name_bg,
          name_en: ing.name_en,
        })),
        0.4,  // Lower threshold for more lenient matching
        5     // Return top 5 matches
      );

      if (matches.length === 0) {
        // No match found - return as unlinked
        console.warn(`[Match Ingredients API] No match for: ${searchName}`);
        return {
          ...ingredient,
          ingredient_database_id: undefined,
          matched_name: undefined,
          match_score: 0,
        };
      }

      // Use best match
      const bestMatch = matches[0];
      const dbIngredient = allIngredients.find(ing => ing.id === bestMatch.id);

      if (!dbIngredient) {
        return {
          ...ingredient,
          ingredient_database_id: undefined,
          matched_name: undefined,
          match_score: 0,
        };
      }

      return {
        ...ingredient,
        ingredient_database_id: dbIngredient.id,
        matched_name: bestMatch.name,
        match_score: bestMatch.score,
        nutrition: {
          calories_per_100g: dbIngredient.calories_per_100g || 0,
          protein_per_100g: dbIngredient.protein_per_100g || 0,
          fat_per_100g: dbIngredient.fat_per_100g || 0,
          carbs_per_100g: dbIngredient.carbs_per_100g || 0,
          net_carbs_per_100g: dbIngredient.net_carbs_per_100g || 0,
          fiber_per_100g: dbIngredient.fiber_per_100g || 0,
        },
      };
    });

    console.log('[Match Ingredients API] Matched', matchedIngredients.length, 'ingredients');

    // Count successful matches
    const successCount = matchedIngredients.filter(ing => ing.ingredient_database_id).length;
    const unlinkedCount = matchedIngredients.filter(ing => !ing.ingredient_database_id).length;

    console.log(`[Match Ingredients API] Success: ${successCount}, Unlinked: ${unlinkedCount}`);

    return NextResponse.json({
      success: true,
      ingredients: matchedIngredients,
      summary: {
        total: matchedIngredients.length,
        matched: successCount,
        unlinked: unlinkedCount,
      },
    });
  } catch (error: any) {
    console.error('[Match Ingredients API] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to match ingredients' },
      { status: 500 }
    );
  }
}
```

---

## PHASE 4.5.2.2: Update AutoParseModal to Include Matching

### Updated AutoParseModal.tsx

Add matching flow after parsing:

```typescript
'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Wand2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MatchedIngredient {
  name: string;
  quantity: number;
  unit: string;
  ingredient_database_id?: string;
  matched_name?: string;
  match_score?: number;
  nutrition?: any;
}

interface AutoParseModalProps {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  onIngredientsFound: (ingredients: MatchedIngredient[]) => void;
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
  const [isMatchingIngredients, setIsMatchingIngredients] = useState(false);
  const [isParsingSteps, setIsParsingSteps] = useState(false);
  
  const [parsedIngredients, setParsedIngredients] = useState<any[] | null>(null);
  const [matchedIngredients, setMatchedIngredients] = useState<MatchedIngredient[] | null>(null);
  const [parsedSteps, setParsedSteps] = useState<any[] | null>(null);
  
  const [ingredientErrors, setIngredientErrors] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<string | null>(null);

  // Step 1: Parse ingredients
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
      toast.success(`Found ${data.ingredients.length} ingredients - now matching to database...`);

      // Automatically match after parsing
      await matchParsedIngredients(data.ingredients);
    } catch (error) {
      console.error('[Auto Parse] Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to parse ingredients';
      setIngredientErrors(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsParsingIngredients(false);
    }
  };

  // Step 2: Match parsed ingredients to database
  const matchParsedIngredients = async (ingredients: any[]) => {
    try {
      setIsMatchingIngredients(true);
      console.log('[Match Ingredients] Matching', ingredients.length, 'ingredients to database');

      const response = await fetch('/api/simple-recipes/match-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to match ingredients');
      }

      const data = await response.json();
      console.log('[Match Ingredients] Matched', data.summary.matched, 'of', data.summary.total);

      setMatchedIngredients(data.ingredients);

      if (data.summary.unlinked > 0) {
        toast.warning(
          `Matched ${data.summary.matched}/${data.summary.total} ingredients. ${data.summary.unlinked} could not be matched - you can link them manually.`
        );
      } else {
        toast.success(`Successfully matched all ${data.summary.matched} ingredients!`);
      }
    } catch (error) {
      console.error('[Match Ingredients] Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to match ingredients';
      toast.error(errorMsg);
      // Still show parsed ingredients even if matching fails
      setMatchedIngredients(ingredients);
    } finally {
      setIsMatchingIngredients(false);
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
    if (matchedIngredients) {
      onIngredientsFound(matchedIngredients);
      toast.success('Ingredients imported with database links');
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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Auto-Parse Recipe</DialogTitle>
          <DialogDescription>
            Claude AI will parse ingredients and steps. Ingredients will be matched to our database to get nutrition data automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ingredients Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Ingredients with Database Linking</h3>
              <Button
                onClick={handleParseIngredients}
                disabled={isParsingIngredients || isMatchingIngredients || !description.trim()}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                {(isParsingIngredients || isMatchingIngredients) && <Loader2 className="animate-spin" size={16} />}
                {isParsingIngredients ? 'Parsing...' : isMatchingIngredients ? 'Matching...' : 'Parse & Match'}
              </Button>
            </div>

            {ingredientErrors && (
              <div className="flex gap-2 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="text-red-600" size={16} />
                <p className="text-sm text-red-600">{ingredientErrors}</p>
              </div>
            )}

            {matchedIngredients && (
              <div className="space-y-2">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-3">
                    ✓ Matched {matchedIngredients.filter(ing => ing.ingredient_database_id).length}/{matchedIngredients.length} ingredients
                  </p>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {matchedIngredients.map((ing, i) => (
                      <div key={i} className="text-sm bg-white p-2 rounded flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">
                            {ing.quantity} {ing.unit} {ing.name}
                          </div>
                          {ing.ingredient_database_id ? (
                            <div className="text-xs text-green-700 flex items-center gap-1 mt-1">
                              <CheckCircle size={12} />
                              Linked: {ing.matched_name} (score: {(ing.match_score || 0).toFixed(2)})
                            </div>
                          ) : (
                            <div className="text-xs text-amber-700">⚠️ Not linked - will need manual matching</div>
                          )}
                        </div>
                        {ing.nutrition && (
                          <div className="text-xs text-gray-600 ml-2 whitespace-nowrap">
                            {Math.round(ing.nutrition.calories_per_100g * ing.quantity / 100)} cal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={handleUseIngredients}
                  size="sm"
                  className="w-full"
                >
                  Use These Ingredients (with Database Links)
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

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>How it works:</strong>
              <br />
              1. Parse ingredients from description<br />
              2. Match each ingredient to our database (fuzzy matching)<br />
              3. Get nutrition data automatically<br />
              4. Calculate recipe nutrition from ingredients<br />
              5. If matching fails, you can manually link later
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## PHASE 4.5.2.3: Update SimpleRecipeForm to Save Matched Ingredients

### Save Matched Ingredients to recipe_ingredients

When user accepts matched ingredients, save to database with FK:

```typescript
// In SimpleRecipeForm.tsx

const saveIngredients = async (recipeId: string, ingredients: MatchedIngredient[]) => {
  try {
    console.log('[SimpleRecipeForm] Saving', ingredients.length, 'ingredients');

    // Insert into recipe_ingredients with ingredient_database_id FK
    const ingredientRecords = ingredients.map((ing, index) => ({
      base_recipe_id: recipeId,
      ingredient_database_id: ing.ingredient_database_id || null,  // Can be null if unlinked
      ingredient_name: ing.name,  // Fallback if no database link
      quantity: ing.quantity,
      unit: ing.unit,
      order_index: index,
    }));

    const { error } = await supabase
      .from('recipe_ingredients')
      .upsert(ingredientRecords);

    if (error) throw error;

    console.log('[SimpleRecipeForm] Saved ingredients successfully');

    // Now calculate nutrition from linked ingredients
    await calculateNutrition(recipeId, ingredients);
  } catch (error) {
    console.error('[SimpleRecipeForm] Error saving ingredients:', error);
    throw error;
  }
};

// Calculate nutrition from matched ingredients
const calculateNutrition = async (recipeId: string, ingredients: MatchedIngredient[]) => {
  try {
    console.log('[SimpleRecipeForm] Calculating nutrition');

    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalNetCarbs = 0;
    let totalFiber = 0;
    let totalWeight = 0;

    // Sum nutrition from all ingredients
    ingredients.forEach((ing) => {
      if (ing.nutrition) {
        // Convert quantity to grams for calculation (assuming unit is already in g or ml ≈ g)
        const weightInGrams = ing.unit === 'piece' ? 50 : ing.quantity;  // Default 50g for pieces

        totalCalories += (ing.nutrition.calories_per_100g * weightInGrams) / 100;
        totalProtein += (ing.nutrition.protein_per_100g * weightInGrams) / 100;
        totalFat += (ing.nutrition.fat_per_100g * weightInGrams) / 100;
        totalCarbs += (ing.nutrition.carbs_per_100g * weightInGrams) / 100;
        totalNetCarbs += (ing.nutrition.net_carbs_per_100g * weightInGrams) / 100;
        totalFiber += (ing.nutrition.fiber_per_100g * weightInGrams) / 100;
        totalWeight += weightInGrams;
      }
    });

    // Update base_recipes with calculated nutrition
    const { error } = await supabase
      .from('base_recipes')
      .update({
        total_calories: Math.round(totalCalories),
        total_protein: Math.round(totalProtein * 100) / 100,
        total_fat: Math.round(totalFat * 100) / 100,
        total_carbs: Math.round(totalCarbs * 100) / 100,
        total_net_carbs: Math.round(totalNetCarbs * 100) / 100,
        total_fiber: Math.round(totalFiber * 100) / 100,
        total_weight_grams: Math.round(totalWeight),
      })
      .eq('id', recipeId);

    if (error) throw error;

    console.log('[SimpleRecipeForm] Nutrition calculated:', {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      netCarbs: totalNetCarbs,
    });

    toast.success('Nutrition calculated automatically from ingredients');
  } catch (error) {
    console.error('[SimpleRecipeForm] Error calculating nutrition:', error);
    toast.error('Failed to calculate nutrition - you can update manually');
  }
};
```

---

## PHASE 4.5.2.4: Testing Checklist

### Test Ingredient Matching
- [ ] Click "Parse & Match"
- [ ] Ingredients are parsed
- [ ] Each ingredient shows match score and matched name
- [ ] Unlinked ingredients show warning
- [ ] Database link count correct
- [ ] Nutrition values shown for linked ingredients

### Test Database Linking
- [ ] ingredient_database_id is saved correctly
- [ ] FK constraint respected
- [ ] Can query: `SELECT * FROM recipe_ingredients WHERE base_recipe_id = '...'`
- [ ] ingredient_database_id populated for matched items
- [ ] ingredient_database_id NULL for unlinked items

### Test Nutrition Calculation
- [ ] After accepting ingredients, nutrition auto-calculates
- [ ] Total calories = SUM(calories_per_100g * weight / 100)
- [ ] Total protein/fat/carbs calculated correctly
- [ ] Values saved to base_recipes
- [ ] Can verify in database

### Test Unlinked Ingredients Handling
- [ ] If ingredient not matched: show warning in UI
- [ ] ingredient_name stored as fallback
- [ ] ingredient_database_id is NULL
- [ ] User can manually link later in admin panel
- [ ] Nutrition calculation skips unlinked items

### Database Verification

```sql
-- Check recipe_ingredients with database links
SELECT 
  ri.id,
  ri.ingredient_name,
  ri.quantity,
  ri.unit,
  ri.ingredient_database_id,
  id_db.name_en,
  id_db.calories_per_100g
FROM recipe_ingredients ri
LEFT JOIN ingredients_database id_db ON ri.ingredient_database_id = id_db.id
WHERE ri.base_recipe_id IN (
  SELECT id FROM base_recipes WHERE is_simple_recipe = TRUE
)
LIMIT 10;

-- Check recipe nutrition calculated
SELECT 
  id,
  name_en,
  total_calories,
  total_protein,
  total_fat,
  total_carbs,
  total_net_carbs
FROM base_recipes
WHERE is_simple_recipe = TRUE
ORDER BY created_at DESC
LIMIT 5;
```

---

## Summary

**Ingredient Linking & Nutrition Calculation**

This phase implements the EXACT same workflow as base_recipes:

1. ✅ Parse ingredient names from description (Claude)
2. ✅ Match each ingredient to ingredients_database (Fuzzy matching)
3. ✅ Link with ingredient_database_id FK
4. ✅ Fetch nutrition data from linked ingredients
5. ✅ Auto-calculate recipe nutrition
6. ✅ Handle unlinked ingredients gracefully

**Benefits:**
- 🔗 Same data source (ingredients_database)
- 🧮 Automatic nutrition calculations
- 📊 No data duplication or mismatch
- ♻️ Consistent with base_recipes workflow
- 🛡️ FK constraints ensure data integrity

---

## Reports to Provide

1. **Screenshot of AutoParseModal** showing matched ingredients with scores
2. **Screenshot showing unlinked ingredients warning**
3. **Database query results** showing recipe_ingredients with FK links
4. **Database query results** showing calculated nutrition
5. **Console logs** showing:
   - `[Auto Parse] Found X ingredients`
   - `[Match Ingredients] Matched X of Y`
   - `[SimpleRecipeForm] Saved ingredients successfully`
   - `[SimpleRecipeForm] Nutrition calculated`

---

Good luck! 🚀