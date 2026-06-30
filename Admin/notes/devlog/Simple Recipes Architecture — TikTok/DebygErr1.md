# CLAUDE CODE TASK: Add Debugging Logs to Recipe Detail Screen

## Goal
Add console.log statements at every critical point to trace where execution stops.

---

## Task 1: Add Logs to recipe-detail/[id].tsx - Query Loading

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Add logs at these locations:**

### Location 1: Component Mount
```typescript
useEffect(() => {
  console.log('[Recipe Detail] Component mounted, id:', id);
}, [id]);
```

### Location 2: Type Detection Query
```typescript
const { data: detectedType, isLoading: typeLoading, error: typeError } = useQuery({
  queryKey: ['detectRecipeType', id],
  queryFn: async () => {
    console.log('[Recipe Detail] Starting type detection for id:', id);
    // ... existing code ...
    
    // After each check, add:
    const { data: readyData } = await supabase.from('ready_recipes').select('id').eq('id', id).maybeSingle();
    if (readyData) {
      console.log('[Recipe Detail] ✅ Found in ready_recipes');
      return 'ready';
    }
    
    const { data: userData } = await supabase.from('user_recipes').select('id').eq('id', id).maybeSingle();
    if (userData) {
      console.log('[Recipe Detail] ✅ Found in user_recipes');
      return 'user';
    }
    
    const { data: simpleData } = await supabase.from('base_recipes').select('id').eq('id', id).eq('is_simple_recipe', true).maybeSingle();
    if (simpleData) {
      console.log('[Recipe Detail] ✅ Found in base_recipes (simple)');
      return 'simple';
    }
    
    console.log('[Recipe Detail] ❌ Recipe not found!');
    throw new Error('Recipe not found');
  },
  staleTime: Infinity,
});

console.log('[Recipe Detail] Type detection result:', detectedType, 'Loading:', typeLoading, 'Error:', typeError);
```

### Location 3: Recipe Data Query
```typescript
const { data: recipe, isLoading: recipeLoading, error: recipeError } = useQuery({
  queryKey: ['recipe', id, recipeType],
  queryFn: async () => {
    console.log('[Recipe Detail] Loading recipe data, type:', recipeType);
    
    if (recipeType === 'ready') {
      console.log('[Recipe Detail] Querying ready_recipes...');
      const { data, error } = await supabase
        .from('ready_recipes')
        .select(`
          *,
          dessert_type:dessert_types(id, name_en, name_bg),
          serving_container:serving_containers(id, name, name_bg, unit_type)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('[Recipe Detail] ready_recipes query error:', error);
        throw error;
      }
      console.log('[Recipe Detail] ✅ ready_recipes loaded:', data?.name_en);
      return data;
    }
    
    // Similar for other types with logs...
    console.log('[Recipe Detail] Unknown type:', recipeType);
    throw new Error('Unknown recipe type');
  },
  enabled: !!id && !!recipeType,
});

console.log('[Recipe Detail] Recipe loaded:', recipe?.name_en, 'Loading:', recipeLoading, 'Error:', recipeError);
```

---

## Task 2: Add Logs to RecipeDetailView.tsx - Rendering

**File:** `Mobile/components/RecipeDetailView.tsx`

**At component start:**
```typescript
export default function RecipeDetailView({ recipe, recipeType, language }: Props) {
  console.log('[RecipeDetailView] Rendering, recipe:', recipe?.name_en, 'type:', recipeType);
  
  if (!recipe) {
    console.log('[RecipeDetailView] ⚠️ Recipe is null/undefined!');
    return <Text>No recipe data</Text>;
  }
  
  console.log('[RecipeDetailView] Recipe has:', {
    dessert_type: recipe.dessert_type,
    serving_container: recipe.serving_container,
    total_servings: recipe.total_servings,
    selected_components: recipe.selected_components?.length,
  });
```

**In each tab/section:**
```typescript
// Ingredients tab
{recipe.components?.length > 0 && (
  <View>
    {console.log('[RecipeDetailView] Rendering ingredients tab, components:', recipe.components.length)}
    {/* ... render ingredients ... */}
  </View>
)}

// Steps tab
{recipe.components?.length > 0 && (
  <View>
    {console.log('[RecipeDetailView] Rendering steps tab')}
    {/* ... render steps ... */}
  </View>
)}

// Serving display
{console.log('[RecipeDetailView] About to render serving display, dessert_type_id:', recipe.dessert_type?.id)}
{recipe.dessert_type?.id === 3 ? (
  <>
    {console.log('[RecipeDetailView] Rendering portion dessert')}
    <ServingDisplay recipe={recipe} language={language} />
  </>
) : (
  <>
    {console.log('[RecipeDetailView] Rendering cake/standard dessert')}
    {/* PanSelector or other */}
  </>
)}
```

---

## Task 3: Add Logs to ServingDisplay.tsx

**File:** `Mobile/components/ServingDisplay.tsx`

```typescript
export default function ServingDisplay({ recipe, language = 'en' }: ServingDisplayProps) {
  console.log('[ServingDisplay] Rendering, container:', recipe.serving_container);
  
  const container = recipe.serving_container;
  
  if (!container) {
    console.log('[ServingDisplay] ⚠️ No serving_container!');
    return (
      <Text style={{ color: 'red' }}>
        Debug: serving_container is NULL
      </Text>
    );
  }

  const containerName = language === 'bg' ? container.name_bg : container.name;
  console.log('[ServingDisplay] Container name:', containerName, 'unit_type:', container.unit_type);

  switch (container.unit_type) {
    case 'pan':
      console.log('[ServingDisplay] Rendering pan display');
      return (
        <View>
          {console.log('[ServingDisplay] ✅ Pan case executed')}
          {/* ... render ... */}
        </View>
      );

    case 'glass':
    case 'cup':
    case 'bowl':
      console.log('[ServingDisplay] Rendering portion display');
      return (
        <View>
          {console.log('[ServingDisplay] ✅ Portion case executed')}
          {/* ... render ... */}
        </View>
      );

    default:
      console.log('[ServingDisplay] ⚠️ Unknown unit_type:', container.unit_type);
      return <Text>Unknown container type: {container.unit_type}</Text>;
  }
}
```

---

## Task 4: Add Network Request Logging

**File:** `Mobile/app/recipe-detail/[id].tsx`

**After Supabase queries, add:**

```typescript
// In ready_recipes query:
const { data, error } = await supabase
  .from('ready_recipes')
  .select(`
    *,
    dessert_type:dessert_types(id, name_en, name_bg),
    serving_container:serving_containers(id, name, name_bg, unit_type)
  `)
  .eq('id', id)
  .single();

if (error) {
  console.error('[Supabase] ready_recipes error:', {
    code: error.code,
    message: error.message,
    details: error.details
  });
  throw error;
}

if (!data) {
  console.error('[Supabase] ready_recipes returned no data');
  throw new Error('No data returned');
}

console.log('[Supabase] ✅ ready_recipes success:', {
  id: data.id,
  name_en: data.name_en,
  dessert_type: data.dessert_type,
  serving_container: data.serving_container,
});
```

---

## Task 5: Add Screen Rendering Log

**File:** `Mobile/app/recipe-detail/[id].tsx`

**At the end, before return statement:**

```typescript
console.log('[Recipe Detail Screen] About to render with state:', {
  id,
  recipeType,
  recipeLoaded: !!recipe,
  recipeError: recipeError?.message,
  typeLoading,
  recipeLoading,
  recipe: {
    name_en: recipe?.name_en,
    dessert_type_id: recipe?.dessert_type?.id,
    serving_container_id: recipe?.serving_container?.id,
  }
});

return (
  <SafeAreaView>
    {console.log('[Recipe Detail Screen] ✅ Rendering screen')}
    {/* ... render ... */}
  </SafeAreaView>
);
```

---

## Task 6: Add Error Boundary

**Wrap RecipeDetailView with error logging:**

```typescript
try {
  return <RecipeDetailView recipe={recipe} recipeType={recipeType} language={language} />;
} catch (error) {
  console.error('[Recipe Detail] RecipeDetailView render error:', error);
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: 'red', fontSize: 16, marginBottom: 10 }}>
        Error rendering recipe:
      </Text>
      <Text style={{ color: 'red', fontSize: 12 }}>
        {error?.message || JSON.stringify(error)}
      </Text>
    </View>
  );
}
```

---

## How to Use These Logs

### Open Mobile Console

1. Shake device
2. Select "Debug JS Remotely" or "Dev Menu"
3. Open console

### Navigate to Recipe

1. Open app
2. Click on a recipe
3. **Watch console as page loads**

### Follow the Flow

```
[Recipe Detail] Component mounted ✅
[Recipe Detail] Starting type detection ✅
[Recipe Detail] Found in ready_recipes ✅
[Supabase] ready_recipes query... ✅
[Supabase] Error: ... ❌ STOPS HERE
```

Wherever you see the ❌, that's where the problem is!

---

## Expected Console Output (Success)

```
[Recipe Detail] Component mounted, id: 96325c6c...
[Recipe Detail] Starting type detection for id: 96325c6c...
[Recipe Detail] ✅ Found in ready_recipes
[Recipe Detail] Type detection result: ready Loading: false
[Recipe Detail] Loading recipe data, type: ready
[Recipe Detail] Querying ready_recipes...
[Supabase] ✅ ready_recipes success: {id: ..., name_en: "Barry pana cotta", dessert_type: {...}, serving_container: {...}}
[Recipe Detail] ✅ Recipe loaded: Barry pana cotta
[RecipeDetailView] Rendering, recipe: Barry pana cotta type: ready
[RecipeDetailView] Recipe has: {dessert_type: {...}, serving_container: {...}, ...}
[ServingDisplay] Rendering, container: {id: ..., name: "glass", unit_type: "glass"}
[ServingDisplay] ✅ Portion case executed
[Recipe Detail Screen] ✅ Rendering screen
```

---

## If You See Errors

Report back:
1. The EXACT error message
2. Where in the console logs it stops
3. What the previous successful log was

---

Ready to implement? 🚀

Execute all 6 tasks, then test and report what you see in console!