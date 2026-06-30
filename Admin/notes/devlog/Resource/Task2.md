# Task 2: Remove Legacy source_url/source_type from base_recipes

**Status:** CRITICAL - Database cleanup  
**Timeline:** 1-1.5 hours  
**Priority:** HIGH  
**Objective:** 
- Part A: Delete source_url and source_type columns from base_recipes table
- Part B: Remove code in Admin Panel that references these fields

---

## CURRENT STATE

**base_recipes table has:**
- ✅ id, name, image_url, ... (good)
- ❌ source_url (LEGACY - remove)
- ❌ source_type (LEGACY - remove)

**Admin Panel code:**
- ❌ BaseRecipeEditForm references source_url (REMOVE)
- ❌ BaseRecipeEditForm references source_type (REMOVE)
- ✅ RecipeResourcesManager handles all resources now (keep)

---

## PART A: Delete Columns from Database (10 min)

### STEP A1: Create SQL Migration

**File:** Supabase Console → SQL Editor

**ACTION:** Execute this SQL:

```sql
-- Drop source columns from base_recipes
ALTER TABLE base_recipes 
DROP COLUMN IF EXISTS source_url,
DROP COLUMN IF EXISTS source_type;
```

**Checklist:**
- [ ] Copy SQL above
- [ ] Paste in Supabase SQL Editor
- [ ] Click "Run" button
- [ ] See success message (no errors)

---

## PART B: Remove Code from Admin Panel (50 min)

### STEP B1: Clean BaseRecipeEditForm (40 min)

**File:** `Admin/components/BaseRecipeEditForm.tsx`

**ACTION 1:** Find and DELETE this import (if it exists):

```typescript
// ❌ DELETE (if present)
import { VideoButton } from './VideoButton';
```

**ACTION 2:** Find where formData is initialized and DELETE these fields:

```typescript
// ❌ FIND AND DELETE
const [formData, setFormData] = useState({
  ...other fields...,
  source_url: recipe?.source_url || '', // DELETE THIS LINE
  source_type: recipe?.source_type || '', // DELETE THIS LINE
});
```

**ACTION 3:** Find the form input fields and DELETE entire sections:

**Search for:** "YouTube" or "source_url"

Delete any sections like:

```typescript
// ❌ DELETE ENTIRE SECTION
<View style={styles.formGroup}>
  <Label htmlFor="source_url">YouTube Link</Label>
  <TextInput
    id="source_url"
    placeholder="https://youtube.com/..."
    value={formData.source_url || ''}
    onChangeText={(value) =>
      setFormData({ ...formData, source_url: value })
    }
  />
</View>
```

```typescript
// ❌ DELETE ENTIRE SECTION
<View style={styles.formGroup}>
  <Label htmlFor="source_type">Source Type</Label>
  <Select
    id="source_type"
    value={formData.source_type || ''}
    onChange={(value) =>
      setFormData({ ...formData, source_type: value })
    }
  >
    <option value="youtube">YouTube</option>
  </Select>
</View>
```

**ACTION 4:** Find save function and DELETE source_url/source_type from insert/update:

**Search for:** "supabase.from('base_recipes')" or "handleSave"

Find the data being saved:

```typescript
// ❌ DELETE THESE LINES from save operation
source_url: formData.source_url,
source_type: formData.source_type,
```

**ACTION 5:** Verify RecipeResourcesManager exists:

```typescript
// ✅ KEEP - This should already be there
<RecipeResourcesManager
  recipeId={recipe.id}
  recipeType="base"
  language={language}
/>
```

If it's NOT there, ADD it before Save/Delete buttons.

**Checklist:**
- [ ] source_url field deleted from form
- [ ] source_type field deleted from form
- [ ] formData initialization cleaned
- [ ] Save function cleaned
- [ ] No references to source_url left in this file
- [ ] No references to source_type left in this file
- [ ] RecipeResourcesManager present
- [ ] No console errors after save

---

### STEP B2: Check Other Files (10 min)

**File:** `Admin/components/BaseRecipeListItem.tsx` (if exists)

**ACTION:** Check if this component displays source_url or source_type

Search for: "source_url" or "source_type"

If found, DELETE those references.

---

### STEP B3: Verify Admin Page Loads (5 min)

**File:** Browser

**ACTION:** Test that base-recipes edit page works:

1. Navigate to: http://localhost:3000/dashboard/base-recipes
2. Click Edit on any recipe
3. Verify:
   - [ ] Page loads without errors
   - [ ] No "source_url" input field visible
   - [ ] No "source_type" input field visible
   - [ ] Resources section visible (RecipeResourcesManager)
   - [ ] Can add/edit/delete resources
   - [ ] Form saves successfully
   - [ ] No console errors

---

## VERIFICATION: Search for Remnants (5 min)

**File:** `Admin/components/BaseRecipeEditForm.tsx`

**ACTION:** Use Find (Ctrl+F) to verify no remnants:

```
Search for "source_url" → Should find 0 results
Search for "source_type" → Should find 0 results
Search for "YouTube Link" → Should find 0 results
```

If any results appear, DELETE those occurrences.

---

## SUMMARY OF CHANGES

### Database Changes:
- ❌ DROP source_url column from base_recipes
- ❌ DROP source_type column from base_recipes

### Code Changes (BaseRecipeEditForm):
- ❌ DELETE source_url form field
- ❌ DELETE source_type form field
- ❌ DELETE from formData state
- ❌ DELETE from save/insert operation
- ✅ KEEP RecipeResourcesManager component
- ✅ KEEP all other form fields

---

## TIMELINE BREAKDOWN

| Step | Task | Time |
|------|------|------|
| A1 | Create SQL migration | 5m |
| B1 | Clean BaseRecipeEditForm | 40m |
| B2 | Check other files | 10m |
| B3 | Test page | 5m |
| **TOTAL** | **Task 2 Complete** | **1-1.5h** |

---

## SUCCESS CRITERIA

✅ **Task 2 complete when:**

1. ✅ source_url column removed from base_recipes table (SQL)
2. ✅ source_type column removed from base_recipes table (SQL)
3. ✅ All source_url references deleted from BaseRecipeEditForm
4. ✅ All source_type references deleted from BaseRecipeEditForm
5. ✅ Admin page loads without errors
6. ✅ Can still manage resources via RecipeResourcesManager
7. ✅ No console errors
8. ✅ Search for "source_url" in code → 0 results in BaseRecipeEditForm

---

## IMPORTANT NOTES

⚠️ **DO NOT DELETE:**
- [ ] source_url/source_type from simple_recipes (they ARE still used there)
- [ ] recipe_resources table (keep it!)
- [ ] RecipeResourcesManager component (keep it!)

✅ **ONLY DELETE FROM:**
- [ ] base_recipes DATABASE COLUMNS
- [ ] BaseRecipeEditForm CODE

---

**EXECUTE PART A (SQL) THEN PART B (Code) in order.** 🚀

Generated: 2026-05-23
Priority: HIGH
Status: READY FOR EXECUTION