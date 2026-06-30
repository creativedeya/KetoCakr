# FIX: Add Missing Fields When Creating ready_recipes for Simple Recipes

## Missing Fields in Barry Pana Cotta

```json
serving_container: NULL      ← NEED THIS
difficulty_level: NULL       ← NEED THIS
slug: NULL                    ← NEED THIS
estimated_cost: "0.00"       ← NEED THIS (should calculate from ingredients)
cost_calculated_at: NULL     ← NEED THIS (set to NOW)
description_en/bg: NULL      ← OK (optional)
assembly_template_id: NULL   ← OK (optional)
```

---

## Task 1: Add serving_container Column to ready_recipes

**If not already there:**

```sql
ALTER TABLE ready_recipes 
ADD COLUMN serving_container VARCHAR(100);
```

---

## Task 2: Update Admin Panel - Add serving_container Input

**File:** `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**Add to form:**

```typescript
// ✅ NEW: Serving container input
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Serving Container (e.g., glass, cup, bowl, plate)
  </label>
  <input
    type="text"
    placeholder="e.g., glass, cup, bowl"
    value={servingContainer}
    onChange={(e) => setServingContainer(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  />
  <p className="text-xs text-gray-500 mt-1">
    How is this dessert served? (for portion desserts)
  </p>
</div>
```

---

## Task 3: Add Difficulty Level Selector

**File:** `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**Add to form:**

```typescript
// ✅ NEW: Difficulty level selector
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Difficulty Level
  </label>
  <select
    value={difficultyLevel}
    onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  >
    <option value="1">1 - Very Easy</option>
    <option value="2">2 - Easy</option>
    <option value="3">3 - Medium</option>
    <option value="4">4 - Hard</option>
    <option value="5">5 - Very Hard</option>
  </select>
</div>
```

---

## Task 4: Auto-Generate Slug Function

**File:** `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**Add this helper function:**

```typescript
// ✅ NEW: Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with dash
    .replace(/-+/g, '-')       // Replace multiple dashes with single
    .replace(/^-|-$/g, '');    // Remove leading/trailing dashes
}
```

---

## Task 5: Update upsertReadyRecipe Function

**File:** `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**Add helper function to calculate cost:**

```typescript
// ✅ NEW: Calculate estimated cost from recipe ingredients
async function calculateRecipeCost(recipeId: string): Promise<number> {
  const { data: ingredients } = await supabase
    .from('recipe_ingredients')
    .select('quantity, ingredient:ingredients_database(cost_per_100g)')
    .eq('recipe_id', recipeId);
  
  if (!ingredients) return 0;
  
  let totalCost = 0;
  ingredients.forEach((ing: any) => {
    const costPer100g = ing.ingredient?.cost_per_100g || 0;
    const ingredientCost = (ing.quantity / 100) * costPer100g;
    totalCost += ingredientCost;
  });
  
  return Math.round(totalCost * 100) / 100;  // Round to 2 decimals
}
```

**In the save function, update ready_recipes creation:**

```typescript
// ✅ UPDATED: Include cost fields
const estimatedCost = await calculateRecipeCost(recipeId);

const readyRecipePayload = {
  id: recipeId,
  name_en: recipe?.name_en || '',
  name_bg: recipe?.name_bg || '',
  dessert_type_id: selectedDessertTypeId,
  hero_image_url: recipe?.image_url || null,
  selected_components: [{
    base_recipe_id: recipeId,
    recipe_id: recipeId,
    role: 'simple'
  }],
  total_servings: recipe?.servings || 1,
  total_weight_grams: recipe?.total_weight_grams || null,
  total_calories: recipe?.total_calories || null,
  total_protein: recipe?.total_protein || null,
  total_fat: recipe?.total_fat || null,
  total_carbs: recipe?.total_carbs || null,
  total_net_carbs: recipe?.total_net_carbs || null,
  
  // ✅ ALL fields:
  serving_container: servingContainer || null,
  difficulty_level: difficultyLevel || 2,
  slug: generateSlug(recipe?.name_en) || generateSlug(recipe?.name_bg) || `recipe-${recipeId}`,
  description_en: recipe?.description_en || null,
  description_bg: recipe?.description_bg || null,
  is_free: true,
  status: 'draft',
  estimated_cost: estimatedCost,          // ✅ NEW
  cost_calculated_at: new Date().toISOString(),  // ✅ NEW
  cost_currency: 'EUR',
  
  published_at: new Date().toISOString(),
};
```

---

## Task 6: Initialize States in Component

**File:** `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**Add to component state:**

```typescript
// ✅ NEW: States for missing fields
const [servingContainer, setServingContainer] = useState('');
const [difficultyLevel, setDifficultyLevel] = useState(2);  // Default: Easy

// When loading existing recipe (if editing):
useEffect(() => {
  if (recipe) {
    // Load from ready_recipes if it exists
    const loadReadyRecipe = async () => {
      const { data } = await supabase
        .from('ready_recipes')
        .select('serving_container, difficulty_level')
        .eq('id', recipeId)
        .maybeSingle();
      
      if (data) {
        setServingContainer(data.serving_container || '');
        setDifficultyLevel(data.difficulty_level || 2);
      }
    };
    
    loadReadyRecipe();
  }
}, [recipe, recipeId]);
```

---

## Task 7: Update SQL Fix for Barry Pana Cotta

**Run this to fix existing record:**

```sql
-- First, calculate the cost from ingredients
-- (assuming cost_per_100g exists in ingredients_database)

UPDATE ready_recipes
SET
  serving_container = 'glass',
  difficulty_level = 2,
  slug = 'barry-pana-cotta',
  estimated_cost = (
    SELECT COALESCE(SUM((ri.quantity / 100) * id.cost_per_100g), 0)
    FROM recipe_ingredients ri
    LEFT JOIN ingredients_database id ON ri.ingredient_database_id = id.id
    WHERE ri.recipe_id = '96325c6c-398d-45c8-912f-4ae728567347'
  ),
  cost_calculated_at = NOW(),
  cost_currency = 'EUR'
WHERE id = '96325c6c-398d-45c8-912f-4ae728567347';
```

**If `cost_per_100g` column doesn't exist in ingredients_database:**

```sql
-- Simpler fix (just set values):
UPDATE ready_recipes
SET
  serving_container = 'glass',
  difficulty_level = 2,
  slug = 'barry-pana-cotta',
  estimated_cost = 0.00,  -- Will be calculated properly when admin implements feature
  cost_calculated_at = NOW(),
  cost_currency = 'EUR'
WHERE id = '96325c6c-398d-45c8-912f-4ae728567347';
```

---

## Verification

**After implementing, Barry Pana Cotta should have:**

```json
{
  "id": "96325c6c-398d-45c8-912f-4ae728567347",
  "total_servings": 3,
  "serving_container": "glass",        ✅ NOW FILLED
  "difficulty_level": 2,               ✅ NOW FILLED
  "slug": "barry-pana-cotta",          ✅ NOW FILLED
  "estimated_cost": "12.50",           ✅ NOW FILLED (calculated)
  "cost_calculated_at": "2026-05-16...",✅ NOW FILLED
  "cost_currency": "EUR",              ✅ NOW FILLED
  "total_calories": "586.10",
  "total_protein": "4.46",
  "total_fat": "48.60",
  "total_carbs": "37.41",
  "total_net_carbs": "33.41"
}
```

---

## Comparison: Simple vs Standard

**Simple Recipe (Barry Pana Cotta):**
```json
selected_components: [{"recipe_id": "96325c6c...", "base_recipe_id": "96325c6c..."}]
serving_container: "glass"
difficulty_level: 2
total_servings: 3
```

**Standard Recipe (Sacher):**
```json
selected_components: [
  {"base_recipe_id": "0e686397...", "recipe_role_id": 1},
  {"base_recipe_id": "bf4f9d02...", "recipe_role_id": 3},
  {"base_recipe_id": "e63f1287...", "recipe_role_id": 4}
]
difficulty_level: 3
slug: "sacher"
total_servings: 8
```

---

## Implementation Order

1. ✅ Add serving_container column to ready_recipes (if needed)
2. ✅ Add serving_container input to admin form
3. ✅ Add difficulty_level selector
4. ✅ Add generateSlug function
5. ✅ Add calculateRecipeCost function
6. ✅ Update upsertReadyRecipe to include ALL fields (including cost)
7. ✅ Add states for new fields
8. ✅ Run SQL fix for Barry Pana Cotta (with cost calculation)

---

## Testing

**After implementing:**
1. Edit Barry Pana Cotta
2. See serving_container input (should be "glass")
3. See difficulty_level selector (should be 2)
4. Click Save
5. Check ready_recipes - all fields filled ✅

---

Ready to implement? 🚀