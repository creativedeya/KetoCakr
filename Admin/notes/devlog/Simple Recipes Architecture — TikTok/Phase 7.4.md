# CLAUDE CODE TASK: Comprehensive Fixes for Portion Desserts

## Overview
6 major issues to fix for proper portion dessert support.

**Status:** Bug Fixes + Feature Enhancements
**Complexity:** High
**Duration:** 2-3 hours
**Files:** 4-5 main files

---

## ISSUE 1: Home Tab 1 - Missing Recipe Name for Simple Recipes

**Problem:**
- Simple recipe doesn't show name on home feed
- Only shows for standard recipes

**File:** `Mobile/app/(tabs)/home/index.tsx`

**Location:** Where recipe cards are rendered in home feed

**Fix:**
```typescript
// Current (likely):
<RecipeCard 
  recipe={recipe}
  // Missing: name display for simple recipes
/>

// Change to:
<RecipeCard 
  recipe={recipe}
  name={recipe.name_en || recipe.name_bg}  // ✅ ADD
/>

// OR in RecipeCard component, ensure:
<Text style={styles.recipeName}>
  {recipe.name_en || recipe.name_bg || 'Unnamed Recipe'}
</Text>
```

---

## ISSUE 2: Recipe Detail Header - Missing Title

**Problem:**
- When viewing recipe detail, header has no title
- Title should show recipe.name_en or recipe.name_bg

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Header section (SafeAreaView top)

**Fix:**
```typescript
// Add/fix header:
<View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Text>←</Text>
  </TouchableOpacity>
  
  <Text style={styles.headerTitle}>
    {recipe.name_en || recipe.name_bg || 'Recipe'}  // ✅ ADD THIS
  </Text>
  
  <View style={{ width: 30 }} />
</View>
```

---

## ISSUE 3: Over Image - Add +/- Buttons for Servings

**Problem:**
- Shows static "3" 
- No way to change servings
- Should have increment/decrement buttons like cakes do

**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Section over recipe image

**Current (WRONG):**
```typescript
<Text>{recipe.total_servings} {recipe.serving_container?.name}</Text>
```

**Change to (CORRECT):**
```typescript
// ✅ NEW: State for serving multiplier
const [servingMultiplier, setServingMultiplier] = useState(1);
const adjustedServings = recipe.total_servings * servingMultiplier;

// ✅ NEW: Render with +/- buttons
<View style={{ 
  alignItems: 'center', 
  marginVertical: 16,
  padding: 12,
  backgroundColor: Colors.background.secondary,
  borderRadius: 8
}}>
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
    <TouchableOpacity 
      onPress={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}
      style={{ padding: 8 }}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>−</Text>
    </TouchableOpacity>
    
    <Text style={{ 
      fontSize: 24, 
      fontWeight: '700', 
      color: Colors.primary,
      marginHorizontal: 20
    }}>
      {adjustedServings} {recipe.serving_container?.name}
    </Text>
    
    <TouchableOpacity 
      onPress={() => setServingMultiplier(servingMultiplier + 0.5)}
      style={{ padding: 8 }}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>+</Text>
    </TouchableOpacity>
  </View>
  
  {servingMultiplier !== 1 && (
    <Text style={{ fontSize: 12, color: Colors.text.secondary }}>
      {recipe.total_servings} × {servingMultiplier.toFixed(1)}
    </Text>
  )}
</View>
```

**Pass to child components:**
```typescript
// Pass multiplier down so ingredients scale:
<IngredientsList 
  recipe={recipe}
  servingMultiplier={servingMultiplier}  // ✅ ADD
/>
```

---

## ISSUE 4: Tab 2 (Ingredients) - Scale by Serving Multiplier

**Problem:**
- Shows quantities for base servings only (1 portion)
- Should show for actual servings (3 portions × multiplier)

**File:** `Mobile/components/RecipeDetailView.tsx` → Ingredients Tab

**Location:** Where ingredients quantities are displayed

**Current (WRONG):**
```typescript
<Text>{ing.quantity} {ing.unit} {ing.ingredient_name}</Text>
```

**Change to (CORRECT):**
```typescript
// ✅ Receive multiplier as prop
// Calculate scaled quantity:
const scaledQuantity = ing.quantity * recipe.total_servings * servingMultiplier;
// (multiply by total_servings because ing.quantity is likely per 100g, not per portion)

<Text>
  {scaledQuantity.toFixed(1)} {ing.unit} {ing.ingredient_name}
</Text>
```

**OR if quantities are already per-portion:**
```typescript
const scaledQuantity = ing.quantity * servingMultiplier;

<Text>
  {scaledQuantity.toFixed(1)} {ing.unit} {ing.ingredient_name}
</Text>
```

---

## ISSUE 5: Tab 3 (Cooking Mode) - Show Step Ingredients & Equipment

**Problem:**
- Only shows image and timer
- Missing ingredients and equipment lists for step

**File:** Where cooking mode steps are rendered (likely in `recipe-detail/[id].tsx` or `CookingMode.tsx`)

**Location:** Step content area (after image/timer)

**Add:**
```typescript
// ✅ NEW: Show ingredients for this step
{step.ingredient_ids && step.ingredient_ids.length > 0 && (
  <View style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
    <Text style={{ fontWeight: '600', marginBottom: 8, fontSize: 14 }}>
      🥄 Съставки за тази стъпка:
    </Text>
    {recipe.recipe_ingredients
      ?.filter(ing => step.ingredient_ids.includes(ing.id))
      .map(ing => {
        const scaledQty = ing.quantity * recipe.total_servings * servingMultiplier;
        return (
          <Text key={ing.id} style={{ fontSize: 13, marginVertical: 4, color: '#555' }}>
            • {scaledQty.toFixed(1)} {ing.unit} {ing.ingredient_name}
          </Text>
        );
      })
    }
  </View>
)}

// ✅ NEW: Show equipment for this step
{step.equipment_needed && step.equipment_needed.length > 0 && (
  <View style={{ marginTop: 12, padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
    <Text style={{ fontWeight: '600', marginBottom: 8, fontSize: 14 }}>
      🍳 Посуда за тази стъпка:
    </Text>
    {equipment
      ?.filter(eq => step.equipment_needed.includes(eq.id))
      .map(eq => (
        <Text key={eq.id} style={{ fontSize: 13, marginVertical: 4, color: '#555' }}>
          • {eq.name} / {eq.name_en}
        </Text>
      ))
    }
  </View>
)}
```

**Ensure equipment is available:**
```typescript
// In recipe-detail/[id].tsx, load equipment:
const { data: equipment } = useQuery({
  queryKey: ['equipment'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('equipment')
      .select('id, name, name_en');
    
    return data || [];
  }
});

// Pass to RecipeDetailView:
<RecipeDetailView 
  recipe={recipe}
  equipment={equipment}  // ✅ ADD
  servingMultiplier={servingMultiplier}  // ✅ ADD
/>
```

---

## ISSUE 6: Price Mode - Fix for 3 Servings (Not 8)

**Problem:**
- Calculates price for 8 servings (hardcoded)
- Should calculate for recipe.total_servings (3) × servingMultiplier

**File:** Price calculation logic (likely in recipe-detail or separate component)

**Location:** Where price is calculated

**Current (WRONG):**
```typescript
const totalPrice = ingredientsCost;
const pricePerServing = totalPrice / 8;  // ❌ Hardcoded 8!
```

**Change to (CORRECT):**
```typescript
const totalPrice = ingredientsCost;
const totalServings = recipe.total_servings * servingMultiplier;  // ✅ Use actual
const pricePerServing = totalPrice / totalServings;

<Text>
  Price per {recipe.serving_container?.name}: €{pricePerServing.toFixed(2)}
</Text>
```

---

## Implementation Checklist

### Issue 1: Recipe Name on Home
- [ ] Find home feed recipe card rendering
- [ ] Add recipe.name_en or recipe.name_bg
- [ ] Test with simple recipe (Barry Pana Cotta)

### Issue 2: Recipe Header Title
- [ ] Add header with recipe name
- [ ] Test title displays on recipe detail screen
- [ ] Title should be BG/EN based on language

### Issue 3: Serving +/- Buttons
- [ ] Create state: `servingMultiplier`
- [ ] Add increment/decrement buttons
- [ ] Show "3 × 1.5 = 4.5" when adjusted
- [ ] Test with 0.5, 1, 1.5, 2.0 multipliers

### Issue 4: Scale Ingredients
- [ ] Calculate: `quantity × total_servings × servingMultiplier`
- [ ] Display scaled quantities
- [ ] Test: multiplier 1 → shows 3 portion amounts
- [ ] Test: multiplier 2 → shows 6 portion amounts

### Issue 5: Show Step Details
- [ ] Render ingredients for step (filtered by ingredient_ids)
- [ ] Scale ingredients by multiplier
- [ ] Render equipment for step (filtered by equipment_needed)
- [ ] Load equipment from Supabase
- [ ] Pass equipment to component

### Issue 6: Fix Price Calculation
- [ ] Replace hardcoded "8" with `recipe.total_servings`
- [ ] Apply multiplier: `total_servings × servingMultiplier`
- [ ] Test price scales correctly with servings

---

## Testing Checklist (Barry Pana Cotta)

**Home Tab 1:**
- [ ] Recipe name visible: "Barry pana cotta" / "Яготова панакота"
- [ ] Not blank or missing

**Recipe Detail Header:**
- [ ] Title shows in header
- [ ] Bilingual works (BG/EN toggle)

**Over Image Section:**
- [ ] Shows: "3 винна чаша" (with current multiplier)
- [ ] − button reduces servings
- [ ] + button increases servings
- [ ] Shows multiplier (e.g., "3 × 1.5")

**Tab 2 (Ingredients):**
- [ ] Base (1×): shows 3 portion amounts
- [ ] 0.5×: shows 1.5 portion amounts
- [ ] 2×: shows 6 portion amounts
- [ ] Quantities update when multiplier changes

**Tab 3 (Cooking Mode):**
- [ ] Each step shows its ingredients (not all recipe ingredients)
- [ ] Each step shows its equipment (not all equipment)
- [ ] Ingredients scaled by multiplier
- [ ] No missing data

**Price Mode:**
- [ ] Calculates for 3 servings (not 8)
- [ ] Price per portion updates with multiplier
- [ ] 2× servings = 2× price

---

## Summary

**Issue 1:** Add recipe name to home feed
**Issue 2:** Add recipe title to detail header
**Issue 3:** Add +/- buttons for serving multiplier (state)
**Issue 4:** Scale ingredient quantities (multiply by multiplier + total_servings)
**Issue 5:** Show step ingredients & equipment (already mostly coded, just ensure data loads)
**Issue 6:** Replace hardcoded "8" with `recipe.total_servings × servingMultiplier`

---

## Key Concept: Serving Multiplier

```
Base serving: recipe.total_servings = 3
Multiplier: user-controlled (0.5, 1, 1.5, 2, etc)
Actual servings: 3 × multiplier
Ingredient quantities: ing.quantity × 3 × multiplier
Price: totalCost / (3 × multiplier)
```

---

Ready to implement? 🚀

Execute in order: 1 → 2 → 3 → 4 → 5 → 6
Test after each issue.
Report results!