# CLAUDE CODE TASK: Fix Serving Display & Show Step Details in Cooking Mode

## Overview
Two issues to fix:
1. Hardcoded "6" servings display over recipe image (should show actual total_servings)
2. Cooking Mode doesn't show ingredients and equipment for each step

**Status:** Bug Fix + Feature Enhancement
**Complexity:** Medium
**Duration:** 1-1.5 hours
**Files:** 1-2 main files

---

## Task 1: Fix Hardcoded "6" Over Recipe Image

**File:** `Mobile/components/RecipeDetailView.tsx` or `Mobile/app/recipe-detail/[id].tsx`

**Location:** Find the section that displays servings over/near the recipe image

**Search for:** Lines containing "6" or "servings" in the image header area

**Current (WRONG):**
```typescript
<View style={styles.servingsContainer}>
  <Text style={styles.servingsText}>6 servings</Text>
</View>

// OR
<Text>6 wine glasses</Text>

// OR just
<Text>6</Text>
```

**Change to (CORRECT):**
```typescript
<View style={styles.servingsContainer}>
  <Text style={styles.servingsText}>
    {recipe.total_servings} {
      language === 'bg' 
        ? recipe.serving_container?.name 
        : recipe.serving_container?.name_en
    }
  </Text>
</View>
```

**Note:** Make sure `recipe`, `total_servings`, `serving_container`, and `language` are all available in this component's scope.

---

## Task 2: Add Ingredients Display in Cooking Mode

**File:** Find where cooking mode steps are rendered (likely `CookingMode.tsx` or step rendering in `recipe-detail/[id].tsx`)

**Location:** Where individual step content is displayed

**Add this code AFTER step description:**

```typescript
// ✅ NEW: Show ingredients for this specific step
{step.ingredient_ids && step.ingredient_ids.length > 0 && (
  <View style={{ 
    marginTop: 12, 
    padding: 12, 
    backgroundColor: '#f5f5f5', 
    borderRadius: 8 
  }}>
    <Text style={{ 
      fontWeight: '600', 
      marginBottom: 8,
      color: '#333',
      fontSize: 14
    }}>
      🥄 Съставки за тази стъпка:
    </Text>
    {recipe.recipe_ingredients
      ?.filter(ing => step.ingredient_ids.includes(ing.id))
      .map(ing => (
        <Text 
          key={ing.id} 
          style={{ 
            fontSize: 13, 
            marginVertical: 4,
            color: '#555',
            lineHeight: 18
          }}
        >
          • {ing.quantity} {ing.unit} {ing.ingredient_name}
        </Text>
      ))
    }
  </View>
)}
```

---

## Task 3: Add Equipment Display in Cooking Mode

**File:** Same file as Task 2 (where step content is rendered)

**Location:** After ingredients display, or after step description

**Add this code:**

```typescript
// ✅ NEW: Show equipment needed for this specific step
{step.equipment_needed && step.equipment_needed.length > 0 && (
  <View style={{ 
    marginTop: 12, 
    padding: 12, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 8 
  }}>
    <Text style={{ 
      fontWeight: '600', 
      marginBottom: 8,
      color: '#333',
      fontSize: 14
    }}>
      🍳 Посуда за тази стъпка:
    </Text>
    {equipment
      ?.filter(eq => step.equipment_needed.includes(eq.id))
      .map(eq => (
        <Text 
          key={eq.id} 
          style={{ 
            fontSize: 13, 
            marginVertical: 4,
            color: '#555',
            lineHeight: 18
          }}
        >
          • {eq.name} / {eq.name_en}
        </Text>
      ))
    }
  </View>
)}
```

**Important:** Make sure `equipment` array is available in this component (may need to load it if not already present).

---

## Task 4: Ensure Equipment Data is Loaded

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Check if equipment is loaded:**

```typescript
// Should have query like:
const { data: equipment } = useQuery({
  queryKey: ['equipment'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('equipment')
      .select('id, name, name_en')
      .eq('is_serving_container', false);  // Get regular equipment, not serving containers
    
    if (error) throw error;
    return data || [];
  }
});
```

If equipment query doesn't exist, add it. If it filters by `is_serving_container=true`, change to `false` or remove filter to get ALL equipment.

---

## Task 5: Pass Equipment to RecipeDetailView

**File:** `Mobile/app/recipe-detail/[id].tsx`

**When rendering RecipeDetailView, pass equipment:**

```typescript
<RecipeDetailView 
  recipe={recipe} 
  recipeType={recipeType} 
  language={language}
  equipment={equipment}  // ✅ ADD THIS
/>
```

---

## Testing Checklist

### For Barry Pana Cotta (id: 96325c6c...):

**Over Image:**
- [ ] Shows: "3 винна чаша" (or "3 wine glass" if EN)
- [ ] NOT: "6" or hardcoded value
- [ ] Bilingual works (BG/EN toggle)

**Cooking Mode - Step 1:**
- [ ] Shows step description
- [ ] Shows "🥄 Съставки за тази стъпка:"
- [ ] Lists ingredients used in this step
- [ ] Shows "🍳 Посуда за тази стъпка:"
- [ ] Lists equipment needed for this step
- [ ] Timer button visible

**All Steps:**
- [ ] Each step shows its own ingredients (not all recipe ingredients)
- [ ] Each step shows its own equipment (not all equipment)
- [ ] Navigation between steps works
- [ ] No console errors

---

## Expected Result

**Before:**
```
Over image: "6"
Cooking Mode Step 1:
  ├─ Step description
  └─ [Nothing else - no ingredients/equipment visible]
```

**After:**
```
Over image: "3 винна чаша"
Cooking Mode Step 1:
  ├─ Step description
  ├─ 🥄 Съставки за тази стъпка:
  │  ├─ 200g ягоди
  │  ├─ 100ml вода
  │  └─ 50g захар
  ├─ 🍳 Посуда за тази стъпка:
  │  ├─ Блендер
  │  └─ Купа
  ├─ ⏱️ Timer button
  └─ Navigation arrows
```

---

## Implementation Notes

1. **Finding hardcoded "6":**
   - Search entire file for string "6"
   - Look for servings/portions/wine glass text
   - Check component structure (likely in header or info section)

2. **Finding Cooking Mode:**
   - Look for step rendering loop
   - Find where step.description is rendered
   - Add ingredient/equipment sections nearby

3. **Equipment availability:**
   - If equipment not loaded, add query in recipe-detail/[id].tsx
   - Pass to RecipeDetailView if needed
   - Ensure equipment has `id, name, name_en` fields

4. **Styling:**
   - Use light gray backgrounds (#f5f5f5, #f0f0f0) to distinguish from recipe content
   - Keep text size 13-14px for readability
   - Use emoji icons (🥄 🍳) for visual clarity

---

## Summary

**Task 1:** Replace hardcoded "6" with `recipe.total_servings + recipe.serving_container.name`
**Task 2:** Add ingredients section in Cooking Mode (filtered by step.ingredient_ids)
**Task 3:** Add equipment section in Cooking Mode (filtered by step.equipment_needed)
**Task 4:** Ensure equipment is loaded from Supabase
**Task 5:** Pass equipment data to RecipeDetailView

---

Ready to implement? 🚀

Execute Tasks in order: 1 → 2 → 3 → 4 → 5
Test after Task 1, then after Task 5.
Report results!