# URGENT Claude Code Task: Fix ReadyRecipeEditForm

**Status:** CRITICAL - Blocking error  
**Timeline:** 15-20 minutes  
**Priority:** HIGHEST  
**Issue:** ReadyRecipeEditForm has legacy code referencing non-existent `source_type` and `source_url` fields in ready_recipes table

---

## PROBLEM DESCRIPTION

**Error Message:**
```
Could not find the 'source_type' column of 'ready_recipes' in the schema cache
```

**Root Cause:** 
ReadyRecipeEditForm still contains code trying to use `source_type` and `source_url` fields that don't exist in `ready_recipes` table (these fields were removed when we created the `recipe_resources` table system).

**Solution:**
Remove all legacy source_type/source_url code from ReadyRecipeEditForm and use RecipeResourcesManager component instead (like we did for base_recipes and simple_recipes).

---

## EXECUTION

### STEP 1: Find and Remove Legacy Code (10 min)

**File:** `Admin/components/ReadyRecipeEditForm.tsx`

**ACTION 1:** Find this code block (search for "source_type"):

```typescript
// ❌ FIND AND DELETE - This is legacy code
source_type: formData.source_type,
source_url: formData.source_url,
```

Remove it completely.

**ACTION 2:** Find and DELETE the input fields for source_type and source_url:

Look for sections like:
```typescript
// ❌ FIND AND DELETE
<View style={styles.formGroup}>
  <Label htmlFor="source_type">Source Type</Label>
  <Select
    id="source_type"
    value={formData.source_type || ''}
    onChange={(value) =>
      setFormData({ ...formData, source_type: value })
    }
  >
    {/* options */}
  </Select>
</View>

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

**DELETE all of these sections.**

**ACTION 3:** Find and DELETE from formData initialization:

Look for:
```typescript
// ❌ DELETE from state/formData
source_type: '',
source_url: '',
```

Remove these lines.

---

### STEP 2: Verify Import of RecipeResourcesManager (5 min)

**File:** `Admin/components/ReadyRecipeEditForm.tsx`

**ACTION:** Check if this import exists at the top:

```typescript
import { RecipeResourcesManager } from './RecipeResourcesManager';
```

If NOT present, ADD it.

---

### STEP 3: Add RecipeResourcesManager to Form (5 min)

**File:** `Admin/components/ReadyRecipeEditForm.tsx`

**ACTION:** Find where form ends (before Save/Delete buttons) and ADD this section:

```typescript
{/* Resources Section - Managed by RecipeResourcesManager */}
<RecipeResourcesManager
  recipeId={recipe.id}
  recipeType="ready"
  language={language}
/>
```

**Important:** Place it BEFORE the Save/Delete buttons, in the form area.

---

### STEP 4: Test (5 min)

1. **Save all changes**
2. **Hard refresh browser** (Ctrl+Shift+R)
3. **Navigate to:** http://localhost:3000/dashboard/ready-recipes
4. **Click Edit on any recipe**
5. **Verify:**
   - [ ] NO error message about source_type
   - [ ] Resources section appears in form
   - [ ] Can add/delete resources
   - [ ] Form saves without errors

---

## WHAT YOU'RE CHANGING

### BEFORE (Broken):
```
ReadyRecipeEditForm
├─ Name field
├─ Description field
├─ ❌ source_url field (LEGACY - CAUSES ERROR)
├─ ❌ source_type field (LEGACY - CAUSES ERROR)
├─ Save button
└─ Delete button
```

### AFTER (Fixed):
```
ReadyRecipeEditForm
├─ Name field
├─ Description field
├─ ✅ RecipeResourcesManager component
│  ├─ Add resources (YouTube, Instagram, etc.)
│  ├─ View existing resources
│  └─ Delete resources
├─ Save button
└─ Delete button
```

---

## QUICK REFERENCE: Search Terms

Use Find (Ctrl+F) to locate code to delete:

1. Search: `source_type` → find all occurrences in ReadyRecipeEditForm
2. Search: `source_url` → find all occurrences
3. Search: `formData.source` → find initialization/usage
4. Search: `YouTube Link` → find input field section

Delete ONLY in ReadyRecipeEditForm - do NOT delete from BaseRecipeEditForm or SimpleRecipeEditForm.

---

## CRITICAL NOTES

⚠️ **DO NOT:**
- [ ] Delete source_type/source_url from BASE_RECIPES (they may still be used)
- [ ] Delete source_type/source_url from SIMPLE_RECIPES (they ARE used there)
- [ ] Delete source_type/source_url from DATABASE
- [ ] Delete from wrong components

✅ **DO ONLY IN:**
- [ ] `Admin/components/ReadyRecipeEditForm.tsx` ONLY

---

## SUCCESS CRITERIA

✅ **Task complete when:**

1. ✅ NO error message about source_type
2. ✅ ReadyRecipeEditForm loads without errors
3. ✅ RecipeResourcesManager component visible in form
4. ✅ Can add resources via RecipeResourcesManager
5. ✅ Can delete resources
6. ✅ Form saves successfully
7. ✅ No console errors

---

## TIMELINE

- **STEP 1:** 10 minutes (find and delete legacy code)
- **STEP 2:** 5 minutes (verify import)
- **STEP 3:** 5 minutes (add component)
- **STEP 4:** 5 minutes (test)
- **TOTAL:** 25 minutes

---

**EXECUTE NOW. This is a straightforward cleanup task.** 🚀

Generated: 2026-05-23
Priority: CRITICAL - BLOCKING ERROR
Status: READY FOR EXECUTION