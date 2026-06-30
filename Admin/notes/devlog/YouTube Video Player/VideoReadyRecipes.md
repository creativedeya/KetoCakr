# Admin Panel Task: Duplicate Functions + YouTube Link Support

**Status:** CRITICAL  
**Timeline:** 3-4 hours  
**Priority:** HIGH  
**Complexity:** MEDIUM  

---

## OBJECTIVE

Add 3 features to Admin Panel:

1. ✅ **Duplicate base_recipes** (list + edit page)
2. ✅ **Duplicate simple_recipes** (list + edit page)
3. ✅ **Add source_url field to ready_recipes** edit page (like simple_recipes)

---

## FILE STRUCTURE

### Files to Modify:
```
Admin/app/dashboard/base-recipes/page.tsx              (list + duplicate button)
Admin/app/dashboard/base-recipes/[id]/page.tsx         (edit + duplicate button)
Admin/app/dashboard/simple-recipes/page.tsx            (list + duplicate button)
Admin/app/dashboard/simple-recipes/[id]/page.tsx       (edit + duplicate button)
Admin/app/dashboard/ready-recipes/[id]/page.tsx        (add source_url field)
Admin/components/BaseRecipeEditForm.tsx                (add duplicate function)
Admin/components/SimpleRecipeEditForm.tsx              (add duplicate function)
Admin/components/ReadyRecipeEditForm.tsx               (add source_url field)
```

### Files to Create (Optional):
```
Admin/utils/duplicateRecipe.ts                         (shared duplicate logic)
```

---

## STEP-BY-STEP IMPLEMENTATION

### STEP 1: Create Shared Duplicate Utility (15 min)

**File:** `Admin/utils/duplicateRecipe.ts`

```typescript
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface DuplicateRecipeParams {
  originalId: string;
  tableName: 'base_recipes' | 'simple_recipes' | 'ready_recipes';
  excludeFields?: string[];
}

/**
 * Duplicates a recipe and returns the new recipe ID
 * New recipe gets name appended with " 1", " 2", etc.
 * 
 * Example: "Ягодова панакота" → "Ягодова панакота 1"
 */
export const duplicateRecipe = async ({
  originalId,
  tableName,
  excludeFields = ['id', 'created_at', 'updated_at'],
}: DuplicateRecipeParams): Promise<string | null> => {
  try {
    // Step 1: Fetch original recipe
    const { data: originalRecipe, error: fetchError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', originalId)
      .single();

    if (fetchError || !originalRecipe) {
      console.error('Error fetching recipe:', fetchError);
      return null;
    }

    // Step 2: Generate new name with counter
    const baseName = originalRecipe.name || originalRecipe.name_bg || 'Recipe';
    let newName = `${baseName} 1`;
    let counter = 1;

    // Check if "Recipe 1" already exists, try "Recipe 2", etc.
    while (true) {
      const { data: existing } = await supabase
        .from(tableName)
        .select('id')
        .eq('name', newName)
        .maybeSingle();

      if (!existing) break;
      counter++;
      newName = `${baseName} ${counter}`;
    }

    // Step 3: Create new recipe object
    const newRecipe = { ...originalRecipe };
    delete newRecipe.id;
    delete newRecipe.created_at;
    delete newRecipe.updated_at;

    newRecipe.id = uuidv4();
    newRecipe.name = newName;

    // For simple_recipes that have name_bg
    if (newRecipe.name_bg) {
      const baseNameBg = newRecipe.name_bg;
      newRecipe.name_bg = `${baseNameBg} 1`;
    }

    // Step 4: Insert new recipe
    const { error: insertError } = await supabase
      .from(tableName)
      .insert([newRecipe]);

    if (insertError) {
      console.error('Error inserting duplicate recipe:', insertError);
      return null;
    }

    console.log(`✅ Recipe duplicated: ${newName}`);
    return newRecipe.id;
  } catch (error) {
    console.error('Unexpected error in duplicateRecipe:', error);
    return null;
  }
};
```

**Checklist:**
- [ ] File created at `Admin/utils/duplicateRecipe.ts`
- [ ] Function handles name generation correctly
- [ ] Exports properly

---

### STEP 2: Modify BaseRecipeEditForm (20 min)

**File:** `Admin/components/BaseRecipeEditForm.tsx`

**Action:** Add Duplicate button and function

```typescript
// AT THE TOP - add import
import { duplicateRecipe } from '@/utils/duplicateRecipe';

// IN THE COMPONENT - add state
const [isDuplicating, setIsDuplicating] = useState(false);

// ADD THIS FUNCTION (before return statement)
const handleDuplicate = async () => {
  if (!recipe?.id) {
    toast.error('Cannot duplicate: Recipe ID missing');
    return;
  }

  setIsDuplicating(true);
  try {
    const newRecipeId = await duplicateRecipe({
      originalId: recipe.id,
      tableName: 'base_recipes',
    });

    if (newRecipeId) {
      toast.success('Recipe duplicated successfully!');
      // Navigate to new recipe
      router.push(`/dashboard/base-recipes/${newRecipeId}`);
    } else {
      toast.error('Failed to duplicate recipe');
    }
  } catch (error) {
    toast.error('Error duplicating recipe');
    console.error(error);
  } finally {
    setIsDuplicating(false);
  }
};

// IN THE FORM - ADD BUTTON (next to Save/Delete buttons)
<View style={styles.buttonRow}>
  <TouchableOpacity 
    style={[styles.btn, styles.btnSecondary]}
    onPress={handleDuplicate}
    disabled={isDuplicating}
  >
    <Icon name="content-duplicate" size={18} />
    <Text>{isDuplicating ? 'Duplicating...' : 'Duplicate'}</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={[styles.btn, styles.btnPrimary]}
    onPress={handleSave}
    disabled={isLoading}
  >
    <Text>{isLoading ? 'Saving...' : 'Save'}</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={[styles.btn, styles.btnDanger]}
    onPress={handleDelete}
  >
    <Icon name="trash-2" size={18} />
    <Text>Delete</Text>
  </TouchableOpacity>
</View>
```

**Checklist:**
- [ ] Import added
- [ ] handleDuplicate function added
- [ ] Button added to form
- [ ] Button styling matches existing buttons

---

### STEP 3: Add Duplicate Button to Base Recipes List (20 min)

**File:** `Admin/app/dashboard/base-recipes/page.tsx`

**Action:** Add Duplicate button to table rows

```typescript
// FIND the table where recipes are displayed
// ADD THIS COLUMN before Edit/Delete columns:

<TableCell>
  <IconButton
    icon={<DuplicateIcon size={18} />}
    onClick={() => handleDuplicateRecipe(recipe.id)}
    title="Duplicate recipe"
  />
</TableCell>

// ADD THIS FUNCTION (in the component)
const handleDuplicateRecipe = async (recipeId: string) => {
  if (!window.confirm('Duplicate this recipe?')) return;

  try {
    const newRecipeId = await duplicateRecipe({
      originalId: recipeId,
      tableName: 'base_recipes',
    });

    if (newRecipeId) {
      toast.success('Recipe duplicated! Redirecting...');
      setTimeout(() => {
        window.location.href = `/dashboard/base-recipes/${newRecipeId}`;
      }, 1000);
    } else {
      toast.error('Failed to duplicate recipe');
    }
  } catch (error) {
    toast.error('Error duplicating recipe');
    console.error(error);
  }
};

// ADD import at top
import { duplicateRecipe } from '@/utils/duplicateRecipe';
```

**Checklist:**
- [ ] Duplicate column added to table
- [ ] handleDuplicateRecipe function added
- [ ] Import added
- [ ] Button icon visible

---

### STEP 4: Modify SimpleRecipeEditForm (20 min)

**File:** `Admin/components/SimpleRecipeEditForm.tsx`

**Action:** Add Duplicate button (same as BaseRecipeEditForm)

```typescript
// AT THE TOP - add import
import { duplicateRecipe } from '@/utils/duplicateRecipe';

// IN THE COMPONENT - add state
const [isDuplicating, setIsDuplicating] = useState(false);

// ADD THIS FUNCTION
const handleDuplicate = async () => {
  if (!recipe?.id) {
    toast.error('Cannot duplicate: Recipe ID missing');
    return;
  }

  setIsDuplicating(true);
  try {
    const newRecipeId = await duplicateRecipe({
      originalId: recipe.id,
      tableName: 'simple_recipes',  // ← IMPORTANT: use 'simple_recipes'
    });

    if (newRecipeId) {
      toast.success('Recipe duplicated successfully!');
      router.push(`/dashboard/simple-recipes/${newRecipeId}`);
    } else {
      toast.error('Failed to duplicate recipe');
    }
  } catch (error) {
    toast.error('Error duplicating recipe');
    console.error(error);
  } finally {
    setIsDuplicating(false);
  }
};

// IN THE FORM - ADD BUTTON (same layout as BaseRecipeEditForm)
<View style={styles.buttonRow}>
  <TouchableOpacity 
    style={[styles.btn, styles.btnSecondary]}
    onPress={handleDuplicate}
    disabled={isDuplicating}
  >
    <Icon name="content-duplicate" size={18} />
    <Text>{isDuplicating ? 'Duplicating...' : 'Duplicate'}</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={[styles.btn, styles.btnPrimary]}
    onPress={handleSave}
    disabled={isLoading}
  >
    <Text>{isLoading ? 'Saving...' : 'Save'}</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={[styles.btn, styles.btnDanger]}
    onPress={handleDelete}
  >
    <Icon name="trash-2" size={18} />
    <Text>Delete</Text>
  </TouchableOpacity>
</View>
```

**Checklist:**
- [ ] Import added
- [ ] handleDuplicate function added
- [ ] tableName is 'simple_recipes' (NOT 'base_recipes')
- [ ] Button added

---

### STEP 5: Add Duplicate Button to Simple Recipes List (20 min)

**File:** `Admin/app/dashboard/simple-recipes/page.tsx`

**Action:** Add Duplicate button to table rows (same as base-recipes)

```typescript
// ADD import
import { duplicateRecipe } from '@/utils/duplicateRecipe';

// IN TABLE - add column
<TableCell>
  <IconButton
    icon={<DuplicateIcon size={18} />}
    onClick={() => handleDuplicateRecipe(recipe.id)}
    title="Duplicate recipe"
  />
</TableCell>

// ADD FUNCTION
const handleDuplicateRecipe = async (recipeId: string) => {
  if (!window.confirm('Duplicate this recipe?')) return;

  try {
    const newRecipeId = await duplicateRecipe({
      originalId: recipeId,
      tableName: 'simple_recipes',  // ← IMPORTANT
    });

    if (newRecipeId) {
      toast.success('Recipe duplicated! Redirecting...');
      setTimeout(() => {
        window.location.href = `/dashboard/simple-recipes/${newRecipeId}`;
      }, 1000);
    } else {
      toast.error('Failed to duplicate recipe');
    }
  } catch (error) {
    toast.error('Error duplicating recipe');
    console.error(error);
  }
};
```

**Checklist:**
- [ ] Duplicate column added
- [ ] Function uses 'simple_recipes'
- [ ] Button works

---

### STEP 6: Add source_url Field to ReadyRecipeEditForm (30 min)

**File:** `Admin/components/ReadyRecipeEditForm.tsx`

**Action:** Add YouTube link input field (like SimpleRecipeEditForm has)

```typescript
// IN THE FORM - ADD THIS SECTION (after name/basic fields)

{/* Source URL Section */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>📹 Video Presentation</Text>
  
  <View style={styles.formGroup}>
    <Label htmlFor="source_url">YouTube Link</Label>
    <TextInput
      id="source_url"
      placeholder="https://youtube.com/watch?v=..."
      value={formData.source_url || ''}
      onChangeText={(value) =>
        setFormData({ ...formData, source_url: value })
      }
      style={styles.input}
    />
    <HelperText>
      Optional: Add a YouTube video link showing how the dessert is presented/served
    </HelperText>
  </View>

  <View style={styles.formGroup}>
    <Label htmlFor="source_type">Source Type</Label>
    <Select
      id="source_type"
      value={formData.source_type || 'youtube_presentation'}
      onChange={(value) =>
        setFormData({ ...formData, source_type: value })
      }
    >
      <option value="youtube_presentation">YouTube Presentation</option>
      <option value="tutorial">Tutorial</option>
      <option value="showcase">Showcase</option>
    </Select>
  </View>
</View>
```

**Checklist:**
- [ ] source_url input added
- [ ] source_type dropdown added
- [ ] Fields appear in edit form
- [ ] Data saves to database

---

### STEP 7: Add source_url to Ready Recipes List (15 min)

**File:** `Admin/app/dashboard/ready-recipes/page.tsx`

**Action:** Show YouTube indicator in table if source_url exists

```typescript
// IN TABLE - add column before Edit/Delete

<TableCell>
  {recipe.source_url ? (
    <IconButton
      icon={<PlayIcon size={18} />}
      onClick={() => window.open(recipe.source_url, '_blank')}
      title="Watch video"
      style={{ color: '#e74c3c' }}
    />
  ) : (
    <Text style={{ color: '#999' }}>-</Text>
  )}
</TableCell>
```

**Checklist:**
- [ ] Column shows YouTube icon if link exists
- [ ] Icon is clickable
- [ ] Opens link in new tab

---

### STEP 8: Update Database Schema (5 min)

**OPTIONAL - Check if fields exist:**

```sql
-- Check base_recipes has necessary fields
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'base_recipes';

-- Check simple_recipes has source_url
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'simple_recipes';

-- Check ready_recipes has source_url
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'ready_recipes';
```

**If source_url missing from ready_recipes, add it:**

```sql
ALTER TABLE ready_recipes ADD COLUMN source_url TEXT;
ALTER TABLE ready_recipes ADD COLUMN source_type VARCHAR(50);
```

**Checklist:**
- [ ] All tables have source_url column
- [ ] No schema errors

---

## TESTING CHECKLIST

### Test Base Recipes Duplicate:
- [ ] Navigate to `/dashboard/base-recipes`
- [ ] Click [DUPLICATE] button on any recipe
- [ ] Confirm dialog appears
- [ ] New recipe created with " 1" appended to name
- [ ] Redirects to new recipe edit page
- [ ] All fields copied correctly

### Test Simple Recipes Duplicate:
- [ ] Navigate to `/dashboard/simple-recipes`
- [ ] Click [DUPLICATE] button on any recipe
- [ ] Confirm dialog appears
- [ ] New recipe created with " 1" appended to name
- [ ] Redirects to new recipe edit page
- [ ] source_url copied correctly

### Test Ready Recipes YouTube Link:
- [ ] Navigate to `/dashboard/ready-recipes`
- [ ] Edit any ready recipe
- [ ] New "Video Presentation" section visible
- [ ] Add YouTube URL: `https://youtube.com/watch?v=...`
- [ ] Save recipe
- [ ] In list view, YouTube icon appears
- [ ] Click icon → opens video in new tab

### General:
- [ ] No console errors
- [ ] All toast notifications work
- [ ] Database updates correctly
- [ ] Navigation smooth

---

## VERIFICATION CHECKLIST

### Files Modified:
- [ ] `Admin/utils/duplicateRecipe.ts` (CREATED)
- [ ] `Admin/components/BaseRecipeEditForm.tsx` (modified)
- [ ] `Admin/app/dashboard/base-recipes/page.tsx` (modified)
- [ ] `Admin/components/SimpleRecipeEditForm.tsx` (modified)
- [ ] `Admin/app/dashboard/simple-recipes/page.tsx` (modified)
- [ ] `Admin/components/ReadyRecipeEditForm.tsx` (modified)
- [ ] `Admin/app/dashboard/ready-recipes/page.tsx` (modified)

### Functionality:
- [ ] Base recipes duplicate works (list + edit)
- [ ] Simple recipes duplicate works (list + edit)
- [ ] Ready recipes YouTube field works
- [ ] All buttons visible and functional
- [ ] No crashes or errors
- [ ] Database updates correctly

### UX:
- [ ] Duplicate buttons have clear icons
- [ ] Confirmation dialogs work
- [ ] Toast notifications show
- [ ] Navigation smooth
- [ ] New recipe names have " 1" suffix

---

## COMMON ISSUES & SOLUTIONS

### Issue: "duplicateRecipe is not defined"
**Solution:**
```typescript
// Check import is correct
import { duplicateRecipe } from '@/utils/duplicateRecipe';

// Clear cache
npm run build
npx next build
```

### Issue: Duplicate creates recipe with same name
**Solution:** Check duplicateRecipe function is appending " 1", " 2", etc.

### Issue: YouTube link not saving
**Solution:** Verify ready_recipes table has source_url column:
```sql
ALTER TABLE ready_recipes ADD COLUMN source_url TEXT;
```

### Issue: Redirect not working after duplicate
**Solution:** Check router.push() path is correct:
```typescript
router.push(`/dashboard/base-recipes/${newRecipeId}`);
```

---

## TIMELINE BREAKDOWN

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Create duplicateRecipe utility | 15m | TODO |
| 2 | Modify BaseRecipeEditForm | 20m | TODO |
| 3 | Add duplicate to base list | 20m | TODO |
| 4 | Modify SimpleRecipeEditForm | 20m | TODO |
| 5 | Add duplicate to simple list | 20m | TODO |
| 6 | Add source_url to ReadyRecipeEditForm | 30m | TODO |
| 7 | Add source_url to ready list | 15m | TODO |
| 8 | Update schema (if needed) | 5m | TODO |
| 9 | Testing | 30m | TODO |
| **TOTAL** | **All 3 features** | **3-4h** | **READY** |

---

## SUCCESS CRITERIA

✅ **Task complete when:**
- Base recipes can be duplicated (list + edit)
- Simple recipes can be duplicated (list + edit)
- Ready recipes have YouTube link field
- All buttons visible and working
- No console errors
- Database updates correctly
- Redirects work smoothly

---

**Execute STEP 1-9 in order. This is critical for admin workflow!** 🚀

Generated: 2026-05-23
Priority: CRITICAL
Status: READY FOR EXECUTION
Timeline: 3-4 hours