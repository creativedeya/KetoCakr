# URGENT Claude Code Task: Fix Ready Recipes Detail Page Route

**Status:** CRITICAL - BLOCKING ERROR  
**Timeline:** 1-2 hours  
**Priority:** HIGHEST  
**Issue:** Ready recipes detail page shows "Unmatched Route" error - page cannot be found

---

## PROBLEM

When clicking on ready_recipes or navigating to detail page:

```
Unmatched Route
Page could not be found
exp://192.168.1.8:8081/--/
```

**Root Cause:** One of the following:
1. RecipeDetailView was updated and broke ready_recipes routing
2. Ready recipes detail page file is missing or misconfigured
3. Route parameters not passed correctly
4. Navigation logic broken

---

## INVESTIGATION & FIX

### STEP 1: Find Current Implementation (15 min)

**File:** `Mobile/app/recipe-detail/[id].tsx`

**ACTION:** Search this file and answer these questions:

1. **Does it handle ready_recipes?**
   - Search for: `ready_recipes`
   - Search for: `recipeType === 'ready'`
   - Search for: `'ready'`

2. **Is navigation working?**
   - Search for: `router.push`
   - Search for: `navigation.navigate`
   - Check if ready_recipes IDs are passed correctly

**Checklist:**
- [ ] File exists at correct path
- [ ] Has logic to handle different recipe types
- [ ] ready_recipes handling code present

---

### STEP 2: Check RecipeDetailView Component (15 min)

**File:** `Mobile/components/RecipeDetailView.tsx`

**ACTION:** Verify this component:

1. **Accepts recipeType prop:**
```typescript
interface RecipeDetailViewProps {
  recipeType: 'base' | 'ready' | 'simple'; // ✅ Must have this
}
```

2. **Handles ready type:**
```typescript
if (recipeType === 'ready') {
  // Handle ready recipes
}
```

3. **No hardcoded assumptions:**
- Search for: `base_recipes` (should not assume only base)
- Search for: `simple_recipes` (should not assume only simple)

**Checklist:**
- [ ] Component accepts recipeType
- [ ] All recipeTypes handled
- [ ] No hardcoded assumptions

---

### STEP 3: Verify Navigation from Ready Recipes List (20 min)

**File:** `Mobile/app/(tabs)/search/index.tsx` (or wherever ready_recipes are listed)

**ACTION:** Find where ready_recipes are displayed and clicked:

1. **Search for:** `ready_recipes`
2. **Search for:** Where recipe cards are tapped/pressed
3. **Check navigation:**

```typescript
// ✅ CORRECT - Pass full route with type
onPress={() => router.push({
  pathname: '/recipe-detail/[id]',
  params: { 
    id: recipe.id,
    type: 'ready' // OR however it's passed
  }
})}

// ❌ WRONG - Missing parameters
onPress={() => router.push(`/recipe-detail/${recipe.id}`)}
```

**Checklist:**
- [ ] Ready recipes are clickable
- [ ] Navigation passes all required params
- [ ] Recipe ID passed correctly

---

### STEP 4: Fix recipe-detail/[id].tsx (40 min)

**File:** `Mobile/app/recipe-detail/[id].tsx`

**ACTION 1:** Check structure of main file:

```typescript
// ✅ Should have this structure
export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  
  // Determine recipeType (from params OR from which table has this ID)
  const recipeType = determineRecipeType(id); // base | ready | simple
  
  // Fetch recipe from correct table
  const { data: recipe } = useQuery({
    queryKey: ['recipe', id, recipeType],
    queryFn: () => fetchRecipeByType(id, recipeType),
  });
  
  return (
    <RecipeDetailView
      recipe={recipe}
      recipeType={recipeType}
      language={language}
      resources={resources}
    />
  );
}
```

**ACTION 2:** Implement fetchRecipeByType function:

If it doesn't exist, CREATE it:

```typescript
const fetchRecipeByType = async (
  id: string, 
  type: 'base' | 'ready' | 'simple'
) => {
  try {
    // Try the specific table
    const { data, error } = await supabase
      .from(type === 'base' ? 'base_recipes' 
           : type === 'ready' ? 'ready_recipes' 
           : 'simple_recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching ${type} recipe:`, error);
    return null;
  }
};
```

**ACTION 3:** Implement determineRecipeType function:

If it doesn't exist, CREATE it:

```typescript
const determineRecipeType = async (id: string): Promise<'base' | 'ready' | 'simple'> => {
  // Check route params first
  const params = useLocalSearchParams();
  if (params.type) {
    return params.type as 'base' | 'ready' | 'simple';
  }

  // Otherwise, search all tables to find which one has this ID
  const [baseRes, readyRes, simpleRes] = await Promise.all([
    supabase.from('base_recipes').select('id').eq('id', id).maybeSingle(),
    supabase.from('ready_recipes').select('id').eq('id', id).maybeSingle(),
    supabase.from('simple_recipes').select('id').eq('id', id).maybeSingle(),
  ]);

  if (baseRes.data) return 'base';
  if (readyRes.data) return 'ready';
  if (simpleRes.data) return 'simple';
  
  return 'base'; // default
};
```

**Checklist:**
- [ ] Main function properly structured
- [ ] fetchRecipeByType implemented
- [ ] determineRecipeType implemented
- [ ] All recipe types fetchable

---

### STEP 5: Verify Navigation from Home/Search Tabs (20 min)

**File:** `Mobile/components/RecipesGrid.tsx` (or wherever recipes are displayed)

**ACTION:** Check how recipes are clicked:

```typescript
// ✅ CORRECT
<TouchableOpacity
  onPress={() => {
    // Determine type based on recipe source
    const recipeType = recipe.recipe_role_id ? 'base' : 'ready'; // logic
    router.push({
      pathname: '/recipe-detail/[id]',
      params: { 
        id: recipe.id,
        type: recipeType
      }
    });
  }}
>
```

If recipes don't pass `type` param, UPDATE to pass it.

**Checklist:**
- [ ] Recipe cards pass correct type
- [ ] Navigation includes all params
- [ ] No missing parameters

---

### STEP 6: Add Error Boundary (15 min)

**File:** `Mobile/app/recipe-detail/[id].tsx`

**ACTION:** Add error handling:

```typescript
if (!recipe) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>
        {language === 'bg' ? 'Рецептата не е намерена' : 'Recipe not found'}
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
      >
        <Text style={styles.backBtnText}>
          {language === 'bg' ? 'Назад' : 'Go Back'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

if (!recipeType) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>
        {language === 'bg' ? 'Грешка при зареждане' : 'Error loading recipe'}
      </Text>
    </View>
  );
}
```

**Checklist:**
- [ ] Error handling added
- [ ] Shows message if recipe not found
- [ ] User can go back

---

### STEP 7: Clear Cache and Test (20 min)

```bash
# Clear Metro cache
npx expo start --clear

# OR if that doesn't work
rm -rf node_modules/.cache
npx expo start
```

**Test Cases:**

1. **Test Ready Recipes:**
   - [ ] Click on ready_recipes from search/home
   - [ ] Detail page loads without error
   - [ ] All recipe info displays correctly
   - [ ] Resources section shows
   - [ ] YouTube button works (if resource exists)

2. **Test Simple Recipes:**
   - [ ] Click on simple_recipes
   - [ ] Detail page loads
   - [ ] All info displays correctly
   - [ ] No regressions

3. **Test Base Recipes:**
   - [ ] Click on base_recipes (components)
   - [ ] Detail page loads
   - [ ] All info displays correctly

4. **Test Edge Cases:**
   - [ ] Click non-existent recipe ID
   - [ ] Shows error message (not blank)
   - [ ] Can go back to previous page

---

## KEY CODE PATTERNS

### Pattern 1: Route Parameters

```typescript
// ✅ CORRECT - Include type info
router.push({
  pathname: '/recipe-detail/[id]',
  params: { 
    id: recipe.id,
    type: 'ready' // IMPORTANT
  }
});

// ❌ WRONG - Missing type
router.push(`/recipe-detail/${recipe.id}`);
```

### Pattern 2: Fetching by Type

```typescript
// ✅ CORRECT - Choose table by type
const tableName = type === 'base' ? 'base_recipes' 
                : type === 'ready' ? 'ready_recipes' 
                : 'simple_recipes';

const { data } = await supabase
  .from(tableName)
  .select('*')
  .eq('id', id);

// ❌ WRONG - Assume only base_recipes
const { data } = await supabase.from('base_recipes').select('*');
```

### Pattern 3: Recipe Type Handling

```typescript
// ✅ CORRECT - Handle all types
if (recipeType === 'base') {
  // base-specific logic
} else if (recipeType === 'ready') {
  // ready-specific logic
} else if (recipeType === 'simple') {
  // simple-specific logic
}

// ❌ WRONG - Ignore ready recipes
if (recipe.source_url) { // Only simple/base
  // video logic
}
```

---

## VERIFICATION CHECKLIST

### Code Structure:
- [ ] `recipe-detail/[id].tsx` exists
- [ ] Main component properly defined
- [ ] fetchRecipeByType function exists
- [ ] determineRecipeType function exists
- [ ] Error handling implemented

### Navigation:
- [ ] Ready recipes clickable
- [ ] Type parameter passed
- [ ] ID parameter passed
- [ ] RecipeDetailView receives all props

### Functionality:
- [ ] Ready recipes detail page loads
- [ ] All recipe types work (base, ready, simple)
- [ ] No "Unmatched Route" error
- [ ] No console errors
- [ ] Resources display correctly
- [ ] YouTube button works

### Testing:
- [ ] Ready recipes load and display
- [ ] Simple recipes still work
- [ ] Base recipes still work
- [ ] Error page shows for missing recipes
- [ ] Can navigate back

---

## COMMON ISSUES & SOLUTIONS

### Issue: "Unmatched Route"
**Solution:** Verify route parameters are complete and type is determined correctly

### Issue: Blank screen
**Solution:** Add console.log to debug which step is failing

### Issue: Recipe not found
**Solution:** Check if recipeType matches correct table, verify ID exists in that table

### Issue: Resources not showing
**Solution:** Verify useRecipeResources hook receives correct recipeType

---

## TIMELINE

| Step | Task | Time |
|------|------|------|
| 1 | Investigate current code | 15m |
| 2 | Check RecipeDetailView | 15m |
| 3 | Verify navigation | 20m |
| 4 | Fix recipe-detail/[id].tsx | 40m |
| 5 | Verify from other tabs | 20m |
| 6 | Add error handling | 15m |
| 7 | Test and debug | 20m |
| **TOTAL** | **Complete fix** | **1.5-2h** |

---

## SUCCESS CRITERIA

✅ **Task complete when:**

1. ✅ No "Unmatched Route" error
2. ✅ Ready recipes detail page loads
3. ✅ All recipe types work (base, ready, simple)
4. ✅ Resources display correctly
5. ✅ YouTube button functional
6. ✅ No console errors
7. ✅ Error handling for missing recipes
8. ✅ Can navigate back from detail page

---

**EXECUTE STEPS 1-7 IN ORDER. This is a critical routing fix!** 🚀

Generated: 2026-05-23
Priority: CRITICAL - BLOCKING ERROR
Status: READY FOR EXECUTION