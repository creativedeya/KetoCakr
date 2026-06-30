# CLAUDE CODE TASK: Language, Header Title, Remove Calories, Add Step Details

## Overview
4 targeted fixes:
1. Home recipe name: Use BG when language=bg, EN when language=en
2. Recipe detail header: Add recipe title
3. Over image section: Remove unnecessary calories display
4. Cooking mode: Debug + fix step ingredients/equipment display

**Status:** Bug Fixes
**Complexity:** Medium
**Duration:** 1-1.5 hours

---

## ISSUE 1: Home Tab Recipe Name - Bilingual Support

**Problem:**
- Always shows name_en
- Should show name_bg when language='bg'

**File:** `Mobile/app/(tabs)/home/index.tsx` or `Mobile/components/RecipeCard.tsx`

**Location:** Where recipe name is displayed in card

**Current (WRONG):**
```typescript
<Text>{recipe.name_en}</Text>  // ❌ Always EN
```

**Change to (CORRECT):**
```typescript
// Get language from your context/store
const { language } = useAppContext();  // or however you access language

<Text>
  {language === 'bg' ? recipe.name_bg : recipe.name_en}
</Text>
```

**Or pass language as prop:**
```typescript
// In home page:
<RecipeCard recipe={recipe} language={language} />

// In RecipeCard:
<Text>
  {language === 'bg' ? recipe.name_bg : recipe.name_en}
</Text>
```

**Test:**
- Toggle language to BG → should show "Яготова панакота"
- Toggle language to EN → should show "Barry pana cotta"

---

## ISSUE 2: Recipe Detail Header - Add Recipe Title

**Problem:**
- Header is empty/missing recipe name

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** SafeAreaView header section

**Current (likely missing or empty):**
```typescript
<View style={styles.header}>
  <TouchableOpacity onPress={() => goBack()}>
    <Text>←</Text>
  </TouchableOpacity>
  {/* Missing: Recipe title here! */}
  <View style={{ flex: 1 }} />
</View>
```

**Change to (CORRECT):**
```typescript
// Get language and recipe
const { language } = useAppContext();

<View style={styles.header}>
  <TouchableOpacity onPress={() => goBack()}>
    <Text style={{ fontSize: 20 }}>←</Text>
  </TouchableOpacity>
  
  <Text style={{ 
    flex: 1, 
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary
  }}>
    {language === 'bg' ? recipe.name_bg : recipe.name_en}
  </Text>
  
  <View style={{ width: 30 }} />  {/* For centering */}
</View>
```

**Test:**
- Open recipe detail
- Title should show in header
- Should match language setting

---

## ISSUE 3: Over Image - Remove Calories Display

**Problem:**
- Shows unnecessary calories information
- Example: "73 kcal per glass" is not needed in this section

**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Section over/near recipe image with serving info

**Current (WRONG - shows calories):**
```typescript
<View>
  <Text>3 винна чаша</Text>
  <Text>~73 kcal per glass</Text>  // ❌ REMOVE THIS LINE
  <Text>Total: 220 kcal</Text>     // ❌ REMOVE THIS LINE TOO
</View>
```

**Change to (CORRECT - only servings):**
```typescript
<View style={{ 
  alignItems: 'center', 
  marginVertical: 16,
  padding: 12,
  backgroundColor: Colors.background.secondary,
  borderRadius: 8
}}>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <TouchableOpacity onPress={() => setServingMultiplier(Math.max(0.5, servingMultiplier - 0.5))}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>−</Text>
    </TouchableOpacity>
    
    <Text style={{ 
      fontSize: 24, 
      fontWeight: '700', 
      color: Colors.primary,
      marginHorizontal: 20
    }}>
      {adjustedServings} {
        language === 'bg' 
          ? recipe.serving_container?.name 
          : recipe.serving_container?.name_en
      }
    </Text>
    
    <TouchableOpacity onPress={() => setServingMultiplier(servingMultiplier + 0.5)}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>+</Text>
    </TouchableOpacity>
  </View>
  
  {servingMultiplier !== 1 && (
    <Text style={{ fontSize: 12, color: Colors.text.secondary, marginTop: 8 }}>
      {recipe.total_servings} × {servingMultiplier.toFixed(1)}
    </Text>
  )}
  {/* ✅ NO calorie info here */}
</View>
```

---

## ISSUE 4: Cooking Mode - Debug + Fix Step Ingredients/Equipment

**Problem:**
- Step ingredients and equipment not showing
- Data exists in database but UI isn't rendering

**File:** Where cooking mode steps render (find this first!)

**Location:** Step content area

### Step A: Find the rendering location

Search for one of these patterns:
```typescript
// Search for:
step.description
StepNumber
"Стъпка"
CookingMode
step_title
```

### Step B: Add detailed logging

```typescript
// Add console logs to debug:
console.log('[Cooking Mode] Step data:', {
  id: step.id,
  ingredient_ids: step.ingredient_ids,
  equipment_needed: step.equipment_needed,
  has_ing: !!step.ingredient_ids?.length,
  has_eq: !!step.equipment_needed?.length,
});

console.log('[Cooking Mode] Available ingredients:', recipe.recipe_ingredients?.length);
console.log('[Cooking Mode] Available equipment:', equipment?.length);

// Check filtering:
const stepIngs = recipe.recipe_ingredients?.filter(ing => 
  step.ingredient_ids?.includes(ing.id)
);
console.log('[Cooking Mode] Filtered ingredients for this step:', stepIngs);
```

### Step C: Add rendering code

**After step description/image, add:**

```typescript
{/* ✅ NEW: Show ingredients for this step */}
{step.ingredient_ids && step.ingredient_ids.length > 0 && (
  <View style={{ 
    marginTop: 16, 
    padding: 12, 
    backgroundColor: '#f5f5f5', 
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary
  }}>
    <Text style={{ 
      fontWeight: '600', 
      marginBottom: 8, 
      fontSize: 14,
      color: Colors.text.primary
    }}>
      🥄 {language === 'bg' ? 'Съставки за тази стъпка:' : 'Ingredients for this step:'}
    </Text>
    
    {recipe.recipe_ingredients
      ?.filter(ing => step.ingredient_ids.includes(ing.id))
      .map(ing => {
        const scaledQty = ing.quantity * recipe.total_servings * servingMultiplier;
        return (
          <Text 
            key={ing.id} 
            style={{ 
              fontSize: 13, 
              marginVertical: 4, 
              color: Colors.text.secondary,
              lineHeight: 18
            }}
          >
            • {scaledQty.toFixed(1)} {ing.unit} {ing.ingredient_name}
          </Text>
        );
      })
    }
    
    {(!recipe.recipe_ingredients || !recipe.recipe_ingredients.some(ing => 
      step.ingredient_ids.includes(ing.id)
    )) && (
      <Text style={{ fontSize: 13, color: '#999' }}>
        {language === 'bg' ? 'Няма съставки' : 'No ingredients'}
      </Text>
    )}
  </View>
)}

{/* ✅ NEW: Show equipment for this step */}
{step.equipment_needed && step.equipment_needed.length > 0 && (
  <View style={{ 
    marginTop: 12, 
    padding: 12, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary
  }}>
    <Text style={{ 
      fontWeight: '600', 
      marginBottom: 8, 
      fontSize: 14,
      color: Colors.text.primary
    }}>
      🍳 {language === 'bg' ? 'Посуда за тази стъпка:' : 'Equipment for this step:'}
    </Text>
    
    {equipment
      ?.filter(eq => step.equipment_needed.includes(eq.id))
      .map(eq => (
        <Text 
          key={eq.id} 
          style={{ 
            fontSize: 13, 
            marginVertical: 4, 
            color: Colors.text.secondary,
            lineHeight: 18
          }}
        >
          • {language === 'bg' ? eq.name : eq.name_en}
        </Text>
      ))
    }
    
    {(!equipment || !equipment.some(eq => 
      step.equipment_needed.includes(eq.id)
    )) && (
      <Text style={{ fontSize: 13, color: '#999' }}>
        {language === 'bg' ? 'Няма посуда' : 'No equipment'}
      </Text>
    )}
  </View>
)}
```

### Step D: Ensure data is loaded

**In recipe-detail/[id].tsx, verify:**

```typescript
// Equipment should be loaded:
const { data: equipment, error: equipError } = useQuery({
  queryKey: ['equipment'],
  queryFn: async () => {
    console.log('[Equipment] Loading...');
    const { data, error } = await supabase
      .from('equipment')
      .select('id, name, name_en');
    
    if (error) {
      console.error('[Equipment] Error:', error);
      throw error;
    }
    
    console.log('[Equipment] Loaded:', data?.length, 'items');
    return data || [];
  }
});

// Pass to RecipeDetailView:
<RecipeDetailView 
  recipe={recipe}
  equipment={equipment}  // ✅ Make sure this is passed
  servingMultiplier={servingMultiplier}
  language={language}
/>
```

### Step E: Check database

```sql
-- Verify step has ingredient_ids and equipment_needed:
SELECT 
  id,
  step_number,
  ingredient_ids,
  equipment_needed,
  array_length(ingredient_ids, 1) as ing_count,
  array_length(equipment_needed, 1) as eq_count
FROM recipe_instruction_steps
WHERE recipe_id = '96325c6c-398d-45c8-912f-4ae728567347'
ORDER BY step_number;
```

Should show non-empty arrays for ingredient_ids and equipment_needed.

---

## Testing Checklist

### Issue 1: Bilingual Recipe Name (Home)
- [ ] Toggle BG: Shows "Яготова панакота"
- [ ] Toggle EN: Shows "Barry pana cotta"
- [ ] Name matches language setting

### Issue 2: Recipe Header Title
- [ ] Open recipe detail
- [ ] Title visible in header
- [ ] Updates with language toggle

### Issue 3: Remove Calories
- [ ] Over image shows ONLY serving info
- [ ] NO "73 kcal" text
- [ ] NO "Total calories" text
- [ ] Only +/- buttons and serving count

### Issue 4: Cooking Mode Step Details
- [ ] Console logs show step data is present
- [ ] Ingredients section appears with items
- [ ] Equipment section appears with items
- [ ] Both sections bilingual (BG/EN)
- [ ] Quantities scale with multiplier
- [ ] Test: multiplier 1, 0.5, 2

---

## Debugging Tips

**If step ingredients still don't show:**

1. Check console for:
   - `[Cooking Mode] Step data:` - should show ingredient_ids array
   - `[Cooking Mode] Filtered ingredients:` - should show matching items
   - `[Equipment] Loaded:` - should show count > 0

2. Run SQL query above to verify data in database

3. Check if step.ingredient_ids is actually an array:
   ```typescript
   console.log('Type:', typeof step.ingredient_ids);
   console.log('Is array:', Array.isArray(step.ingredient_ids));
   ```

4. If ingredient_ids is NULL in DB:
   - Data wasn't migrated properly during setup
   - Need to populate from admin panel

---

## Summary

**Issue 1:** Use `language === 'bg' ? name_bg : name_en`
**Issue 2:** Add recipe title to header
**Issue 3:** Delete all calorie-related text from over-image section
**Issue 4:** Add console logs, render ingredients/equipment, verify data loading

---

Ready to implement? 🚀

Do Issues 1 → 2 → 3 first (quick fixes).
Then Issue 4 (debug + add code).
Report console logs for Issue 4!