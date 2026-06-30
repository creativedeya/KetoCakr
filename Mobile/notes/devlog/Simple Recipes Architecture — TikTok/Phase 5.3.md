# CLAUDE CODE TASK: Mobile - Dessert Type Conditional Display

## Overview
Fix mobile recipe display to show different UI based on dessert type.

**Status:** Feature Implementation
**Complexity:** Low-Medium
**Duration:** 1-1.5 hours
**Files:** 3-4 main files

---

## Prerequisites

Read first:
- Mobile app structure: `Mobile/app/recipe-detail/[id].tsx`
- RecipeDetailView: `Mobile/components/RecipeDetailView.tsx`
- Nutrition display component (wherever nutrition is shown)

---

## Task 1: Update recipe-detail/[id].tsx - Load dessert_type

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** In the recipe query, ensure dessert_type is loaded

**Current (likely):**
```typescript
const { data: recipe } = useQuery({
  queryKey: ['recipe', id],
  queryFn: async () => {
    const { data } = await supabase
      .from('ready_recipes')
      .select('*')  // ← May not include dessert_type details
      .eq('id', id)
      .single();
    return data;
  }
});
```

**Update to:**
```typescript
// ✅ UPDATED: Include dessert_type with JOIN
const { data: recipe } = useQuery({
  queryKey: ['recipe', id],
  queryFn: async () => {
    const { data } = await supabase
      .from('ready_recipes')
      .select(`
        *,
        dessert_type:dessert_types(id, name_en, name_bg)
      `)
      .eq('id', id)
      .single();
    
    if (!data) throw new Error('Recipe not found');
    return data;
  }
});
```

**Now recipe object has:**
```typescript
recipe.dessert_type_id  // Integer ID
recipe.dessert_type     // Object: { id, name_en, name_bg }
recipe.total_servings   // Number
recipe.serving_container // String ('glass', 'cup', etc) or NULL
```

---

## Task 2: Create Conditional Serving Display Component

**File:** `Mobile/components/ServingDisplay.tsx` (NEW FILE)

**Create this new component:**

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/Theme';

interface ServingDisplayProps {
  recipe: any;
  language?: 'en' | 'bg';
}

export default function ServingDisplay({ recipe, language = 'en' }: ServingDisplayProps) {
  // Check if portion dessert
  const isPortionDessert = 
    recipe.dessert_type?.id === 3 || 
    recipe.dessert_type?.name_en === 'Portion Desserts' ||
    recipe.dessert_type?.name_bg === 'Порционни десерти';

  if (isPortionDessert) {
    // ✅ NEW: Show "N glasses/cups/bowls"
    return (
      <View style={{ marginVertical: Spacing.md }}>
        <Text style={{
          fontSize: Typography.body.fontSize,
          fontWeight: '600',
          color: Colors.text.primary,
          textAlign: 'center'
        }}>
          {recipe.total_servings} {recipe.serving_container}
        </Text>
        
        {recipe.serving_container && (
          <Text style={{
            fontSize: Typography.caption.fontSize,
            color: Colors.text.secondary,
            textAlign: 'center',
            marginTop: Spacing.sm
          }}>
            ({recipe.serving_container} per portion)
          </Text>
        )}
      </View>
    );
  }

  // For cakes/tarts: Use existing pan selector
  // Return null here - let parent handle PanSelector
  return null;
}
```

---

## Task 3: Update RecipeDetailView - Use Conditional Display

**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Find where nutrition/servings info is displayed

**Current (likely looks like):**
```typescript
<Text>{recipe.servings} servings</Text>
<NutritionCard recipe={recipe} />
```

**Update to:**

```typescript
// ✅ UPDATED: Conditional display based on dessert type
import ServingDisplay from './ServingDisplay';

// In the JSX:
{recipe.dessert_type?.id === 3 ? (
  // ✅ PORTION DESSERTS: Show simple serving info
  <>
    <ServingDisplay recipe={recipe} language={language} />
    <NutritionCardPortions recipe={recipe} />
  </>
) : (
  // CAKES/TARTS: Show existing pan selector
  <>
    <PanSizeSelector recipe={recipe} />
    <NutritionCard recipe={recipe} />
  </>
)}
```

---

## Task 4: Fix Nutrition Display for Portions

**File:** `Mobile/components/NutritionCard.tsx` (or wherever nutrition shows)

**Location:** Create new component for portion desserts

**Create:** `Mobile/components/NutritionCardPortions.tsx`

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/Theme';

interface NutritionCardPortionsProps {
  recipe: any;
}

export default function NutritionCardPortions({ recipe }: NutritionCardPortionsProps) {
  // Calculate per-portion nutrition
  const caloriesPerPortion = recipe.total_calories / recipe.total_servings;
  const proteinPerPortion = recipe.total_protein / recipe.total_servings;
  const fatPerPortion = recipe.total_fat / recipe.total_servings;
  const carbsPerPortion = recipe.total_net_carbs / recipe.total_servings;

  return (
    <View style={{
      backgroundColor: Colors.background.secondary,
      borderRadius: 12,
      padding: Spacing.md,
      marginVertical: Spacing.md
    }}>
      <Text style={{
        fontSize: Typography.body.fontWeight,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Spacing.md
      }}>
        Per {recipe.serving_container}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <NutritionBadge 
          label="Calories" 
          value={Math.round(caloriesPerPortion)} 
          unit="kcal"
        />
        <NutritionBadge 
          label="Protein" 
          value={proteinPerPortion.toFixed(1)} 
          unit="g"
        />
        <NutritionBadge 
          label="Fat" 
          value={fatPerPortion.toFixed(1)} 
          unit="g"
        />
        <NutritionBadge 
          label="Carbs" 
          value={carbsPerPortion.toFixed(1)} 
          unit="g"
        />
      </View>

      <Text style={{
        fontSize: Typography.caption.fontSize,
        color: Colors.text.secondary,
        marginTop: Spacing.md,
        fontStyle: 'italic'
      }}>
        Total: {recipe.total_calories} cal / {recipe.total_servings} {recipe.serving_container}
      </Text>
    </View>
  );
}

// Helper component for nutrition badges
function NutritionBadge({ label, value, unit }: any) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{
        fontSize: 16,
        fontWeight: '700',
        color: Colors.primary,
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: Typography.caption.fontSize,
        color: Colors.text.secondary,
      }}>
        {label}
      </Text>
      <Text style={{
        fontSize: 10,
        color: Colors.text.secondary,
      }}>
        {unit}
      </Text>
    </View>
  );
}
```

---

## Task 5: Update Cooking Mode - Show Recipe Info

**File:** `Mobile/app/recipe-detail/[id].tsx` or wherever Cooking Mode displays recipe header

**Location:** Recipe title/info section at top of Cooking Mode

**Add this logic:**

```typescript
// ✅ NEW: Show serving info at top of cooking mode
if (recipe.dessert_type?.id === 3) {
  // Portion dessert
  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <Text style={styles.title}>{recipe.name_en}</Text>
      <View style={{ 
        backgroundColor: Colors.background.secondary, 
        padding: Spacing.md,
        borderRadius: 8,
        marginVertical: Spacing.md
      }}>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '600',
          color: Colors.text.primary
        }}>
          {recipe.total_servings} {recipe.serving_container}
        </Text>
        <Text style={{
          fontSize: 13,
          color: Colors.text.secondary,
          marginTop: Spacing.xs
        }}>
          ~{Math.round(recipe.total_calories / recipe.total_servings)} cal per {recipe.serving_container}
        </Text>
      </View>
    </View>
  );
} else {
  // Cake - existing logic
  return (
    <View>
      <Text style={styles.title}>{recipe.name_en}</Text>
      <PanSizeSelector recipe={recipe} />
    </View>
  );
}
```

---

## Task 6: Fix Cooking Mode - Show Step Ingredients & Equipment

**File:** Find where Cooking Mode renders steps

**Location:** In step display (likely `CookingMode.tsx` or step component)

**Current (likely):**
```typescript
<Text>{step.description}</Text>
// Missing ingredients and equipment!
```

**Update to:**

```typescript
// ✅ NEW: Show ingredients for this step
{step.ingredient_ids && step.ingredient_ids.length > 0 && (
  <View style={{ marginTop: Spacing.md }}>
    <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm }}>
      🥄 Ingredients for this step:
    </Text>
    {recipe.recipe_ingredients
      ?.filter(ing => step.ingredient_ids.includes(ing.id))
      .map(ing => (
        <Text key={ing.id} style={{ 
          fontSize: 13, 
          color: Colors.text.secondary,
          marginVertical: Spacing.xs
        }}>
          • {ing.quantity} {ing.unit} {ing.ingredient_name}
        </Text>
      ))
    }
  </View>
)}

// ✅ NEW: Show equipment for this step
{step.equipment_needed && step.equipment_needed.length > 0 && (
  <View style={{ marginTop: Spacing.md }}>
    <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm }}>
      🍳 Equipment needed:
    </Text>
    {equipment
      ?.filter(eq => step.equipment_needed.includes(eq.id))
      .map(eq => (
        <Text key={eq.id} style={{ 
          fontSize: 13, 
          color: Colors.text.secondary,
          marginVertical: Spacing.xs
        }}>
          • {eq.name} / {eq.name_bg}
        </Text>
      ))
    }
  </View>
)}
```

---

## Testing Checklist

### For Portion Dessert (Barry Pana Cotta):

- [ ] Open recipe detail
- [ ] Check dessert_type loads (check console: `recipe.dessert_type`)
- [ ] Display shows: "3 glasses" (not "8 servings from 18cm pan")
- [ ] Nutrition shows per glass: "~195 cal per glass"
- [ ] Total shown: "586 cal / 3 glasses"

### For Cake/Tart (existing):

- [ ] Display shows: PanSelector (18cm default, 16-24cm range)
- [ ] Nutrition shows per slice (existing behavior)

### Cooking Mode:

- [ ] Step shows: description
- [ ] Step shows: "🥄 Ingredients for this step" (if any)
- [ ] Step shows: "🍳 Equipment needed" (if any)
- [ ] Navigation (prev/next) works

### Console Check:

```
recipe.dessert_type should be:
{
  id: 3,
  name_en: "Portion Desserts",
  name_bg: "Порционни десерти"
}
```

---

## Implementation Order

1. ✅ Task 1: Load dessert_type in query
2. ✅ Task 2: Create ServingDisplay component
3. ✅ Task 3: Update RecipeDetailView (conditional rendering)
4. ✅ Task 4: Create NutritionCardPortions component
5. ✅ Task 5: Update Cooking Mode header
6. ✅ Task 6: Show step ingredients & equipment

---

## Key Points

- **Portion desserts** (id=3): Show total_servings + serving_container
- **Cakes/Tarts** (id=1,4,5): Show PanSelector (existing)
- **Nutrition for portions**: Divide by total_servings
- **Cooking mode**: Show ingredients & equipment per step

---

## Expected Result

**Portion Dessert View:**
```
Barry Pana Cotta

3 glasses
~195 cal per glass

[Ingredients for step]
[Equipment for step]
[Cooking instructions]
```

**Cake View (unchanged):**
```
Chocolate Cake

Pan size: 18cm [Adjust 16-24cm]
8 slices

[Nutrition per slice]
[Ingredients for step]
[Equipment for step]
[Cooking instructions]
```

---

Ready to implement? 🚀

Execute Tasks 1-6 in order.
Test after Task 3.
Report results!