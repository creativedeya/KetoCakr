# Task 1: Load YouTube from recipe_resources in Ready Recipes Detail Page

**Status:** CRITICAL - Feature implementation  
**Timeline:** 1-2 hours  
**Priority:** HIGH  
**Objective:** When user clicks YouTube button on ready_recipes detail page, load YouTube video from recipe_resources table (same as simple_recipes implementation)

---

## CURRENT BEHAVIOR

Ready recipes detail page:
- ✅ Shows recipe details
- ❌ No YouTube button visible
- ❌ No code to load video from recipe_resources

Simple recipes detail page:
- ✅ Shows recipe details
- ✅ YouTube button appears (if source_url exists)
- ✅ Loads video when clicked
- ✅ Modal with WebView player

---

## DESIRED BEHAVIOR

Ready recipes detail page should:
- ✅ Check if recipe has YouTube resource in recipe_resources table
- ✅ If YouTube exists → Show YouTube button
- ✅ Click button → Opens YouTubePlayerModal
- ✅ Video plays in WebView (same as simple recipes)

---

## STEP-BY-STEP IMPLEMENTATION

### STEP 1: Identify the File (5 min)

**File:** `Mobile/app/recipe-detail/[id].tsx`

**ACTION:** Find where recipe detail page renders for ready_recipes

This is the main detail page that shows both simple_recipes and ready_recipes.

---

### STEP 2: Check useRecipeResources Hook Exists (5 min)

**File:** `Mobile/hooks/useRecipeResources.ts`

**ACTION:** Verify this hook exists and exports properly:

```typescript
export const useRecipeResources = (recipeId: string, recipeType: 'base' | 'ready' | 'simple')
```

If it doesn't exist, create it:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

export interface RecipeResource {
  id: string;
  recipe_id: string;
  recipe_type: 'base' | 'ready' | 'simple';
  resource_type: 'youtube' | 'instagram' | 'tiktok' | 'pinterest' | 'blog' | 'idea_source';
  url: string;
  title?: string;
  description?: string;
}

export const useRecipeResources = (recipeId: string, recipeType: 'base' | 'ready' | 'simple') => {
  return useQuery({
    queryKey: ['recipe-resources', recipeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_resources')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('recipe_type', recipeType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as RecipeResource[]) || [];
    },
  });
};
```

---

### STEP 3: Add Hook to Detail Page (10 min)

**File:** `Mobile/app/recipe-detail/[id].tsx`

**ACTION 1:** Add import at top:

```typescript
import { useRecipeResources } from '@/hooks/useRecipeResources';
```

**ACTION 2:** In component, add hook call (in RecipeDetailView section):

```typescript
// Fetch resources for this recipe
const { data: resources = [] } = useRecipeResources(recipe.id, recipeType);

// Find YouTube resource
const youtubeResource = resources.find(r => r.resource_type === 'youtube');
```

---

### STEP 4: Find YouTube Button Code (10 min)

**File:** `Mobile/components/RecipeDetailView.tsx`

**ACTION:** Find the YouTube button code section. It should look something like:

```typescript
{/* YouTube Button */}
{recipe.source_url && recipe.source_type === 'youtube' && (
  <VideoButton sourceUrl={recipe.source_url} />
)}
```

This code checks `recipe.source_url` and `recipe.source_type`.

---

### STEP 5: Update YouTube Button Logic (15 min)

**File:** `Mobile/components/RecipeDetailView.tsx`

**ACTION:** Replace the YouTube button code:

**FIND THIS:**
```typescript
{/* YouTube Button */}
{recipe.source_url && recipe.source_type === 'youtube' && (
  <VideoButton sourceUrl={recipe.source_url} />
)}
```

**REPLACE WITH THIS:**
```typescript
{/* YouTube Button - From recipe_resources OR legacy source_url */}
{(youtubeResource?.url || recipe.source_url) && (
  <VideoButton 
    sourceUrl={youtubeResource?.url || recipe.source_url || ''}
    sourceType={youtubeResource ? 'youtube' : (recipe.source_type || 'youtube')}
  />
)}
```

**EXPLANATION:**
- Check if YouTube resource exists in `recipe_resources` → use it
- Otherwise, fallback to legacy `recipe.source_url` (for backward compatibility)
- Pass URL to VideoButton component

---

### STEP 6: Update RecipeDetailView Component Props (10 min)

**File:** `Mobile/components/RecipeDetailView.tsx`

**ACTION:** Ensure component receives resources data:

```typescript
interface RecipeDetailViewProps {
  recipe: any;
  recipeType: 'base' | 'ready' | 'simple';
  language: 'en' | 'bg';
  resources?: any[]; // ADD THIS
}

export const RecipeDetailView = ({
  recipe,
  recipeType,
  language,
  resources = [], // ADD THIS
}: RecipeDetailViewProps) => {
  // Find YouTube resource
  const youtubeResource = resources.find(r => r.resource_type === 'youtube');
  
  // ... rest of component
}
```

---

### STEP 7: Pass Resources from Parent (10 min)

**File:** `Mobile/app/recipe-detail/[id].tsx`

**ACTION:** Pass resources to RecipeDetailView component:

**FIND THIS:**
```typescript
<RecipeDetailView
  recipe={recipe}
  recipeType={recipeType}
  language={language}
/>
```

**REPLACE WITH THIS:**
```typescript
<RecipeDetailView
  recipe={recipe}
  recipeType={recipeType}
  language={language}
  resources={resources} // ADD THIS
/>
```

---

### STEP 8: Verify VideoButton Component (5 min)

**File:** `Mobile/components/VideoButton.tsx`

**ACTION:** Verify component accepts sourceUrl parameter:

```typescript
interface VideoButtonProps {
  sourceUrl: string;
  sourceType?: string;
}

export const VideoButton = ({ sourceUrl, sourceType = 'youtube' }: VideoButtonProps) => {
  // ... component code
}
```

If this component doesn't exist or doesn't accept sourceUrl, create/update it.

---

### STEP 9: Test on Device (30 min)

```bash
npx expo start --clear
# Open on Android via Expo Go
```

**Test Cases:**

1. **Test Ready Recipe with YouTube Resource:**
   - [ ] Navigate to ready_recipes detail page (one with YouTube resource added via admin)
   - [ ] Scroll to find YouTube button
   - [ ] Button visible? (if recipe has YouTube resource in recipe_resources)
   - [ ] Click button → YouTubePlayerModal opens
   - [ ] Video loads and plays
   - [ ] Close modal → returns to detail page

2. **Test Ready Recipe without YouTube Resource:**
   - [ ] Navigate to ready_recipes detail page (one WITHOUT YouTube resource)
   - [ ] No YouTube button visible ✓

3. **Test Simple Recipe (Backward Compatibility):**
   - [ ] Simple recipes still work the same way
   - [ ] YouTube button still appears for simple_recipes with source_url
   - [ ] Video loads correctly

4. **Test Fallback:**
   - [ ] If recipe has legacy source_url but no recipe_resources → uses source_url
   - [ ] If recipe has recipe_resources YouTube → uses recipe_resources

---

## KEY POINTS

✅ **What stays the same:**
- Simple recipes YouTube functionality (unchanged)
- VideoButton component works identically
- YouTubePlayerModal works identically

✅ **What changes:**
- Ready recipes now check recipe_resources table for YouTube
- Fallback to legacy source_url if recipe_resources doesn't exist
- Same UX as simple recipes

---

## VERIFICATION CHECKLIST

### Code Changes:
- [ ] `useRecipeResources` hook exists and works
- [ ] Hook imported in recipe-detail page
- [ ] Resources fetched with correct recipeType ('ready')
- [ ] YouTube resource extracted from resources array
- [ ] VideoButton updated to use youtubeResource.url
- [ ] RecipeDetailView receives resources prop
- [ ] Parent page passes resources to RecipeDetailView

### Functionality:
- [ ] YouTube button shows for ready_recipes with YouTube resource
- [ ] YouTube button hidden for recipes without YouTube resource
- [ ] Click button → modal opens
- [ ] Video loads from recipe_resources URL
- [ ] Fallback to source_url works
- [ ] Simple recipes unaffected

### Testing:
- [ ] No console errors
- [ ] Smooth video loading
- [ ] Modal opens/closes correctly
- [ ] Both languages work (BG/EN)

---

## TIMELINE BREAKDOWN

| Step | Task | Time |
|------|------|------|
| 1 | Identify file | 5m |
| 2 | Check hook exists | 5m |
| 3 | Add hook to detail page | 10m |
| 4 | Find YouTube button code | 10m |
| 5 | Update button logic | 15m |
| 6 | Update component props | 10m |
| 7 | Pass resources from parent | 10m |
| 8 | Verify VideoButton | 5m |
| 9 | Test on device | 30m |
| **TOTAL** | **Task 1 Complete** | **1.5-2h** |

---

## SUCCESS CRITERIA

✅ **Task 1 complete when:**
1. Ready recipes show YouTube button when recipe has YouTube resource in recipe_resources
2. Click button → loads video from recipe_resources.url
3. Modal works identically to simple_recipes
4. No console errors
5. Fallback to source_url works for backward compatibility
6. Simple recipes unaffected

---

**EXECUTE STEPS 1-9 in order.** 🚀

Generated: 2026-05-23
Priority: HIGH
Status: READY FOR EXECUTION