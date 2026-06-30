# CLAUDE CODE TASK: Fix Equipment Query - Remove name_bg

## Problem
Mobile app query includes `name_bg` field which doesn't exist in equipment table.

**Error:**
```
"column equipment_1.name_bg does not exist"
```

**Root cause:** equipment table has `name` (БГ) and `name_en` (EN), NOT `name_bg`

---

## Task 1: Fix ready_recipes Query

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Find the ready_recipes query in recipe loading function

**Current (WRONG):**
```typescript
.select(`
  *,
  dessert_type:dessert_types(id, name_en, name_bg),
  serving_container:equipment(id, name, name_en, name_bg, serving_container_type)
`)
```

**Change to (CORRECT):**
```typescript
.select(`
  *,
  dessert_type:dessert_types(id, name_en, name_bg),
  serving_container:equipment(id, name, name_en, serving_container_type)
`)
```

**What changed:**
- ❌ Removed `name_bg` from equipment select
- ✅ Keep only: `id, name, name_en, serving_container_type`

---

## Task 2: Update ServingDisplay Component

**File:** `Mobile/components/ServingDisplay.tsx`

**Update to use correct field names:**

```typescript
// Get display name - equipment has 'name' (БГ) and 'name_en' (EN)
const containerName = language === 'bg' ? container.name : container.name_en;
```

---

## Task 3: Test

After changes:
1. Close mobile app completely
2. Clear cache (Settings → Apps → Clear Cache)
3. Reopen app
4. Navigate to recipe detail for Barry Pana Cotta (id: 96325c6c...)
5. Should see:
   - ✅ Recipe loads
   - ✅ "3 wine glasses" (not "8 servings from 18cm pan")
   - ✅ Nutrition per glass
   - ✅ No console errors

---

## Expected Console Logs (Success)

```
[Recipe Detail] Querying ready_recipes...
[Supabase] ✅ ready_recipes success
[Recipe Detail] ✅ Recipe loaded: Barry pana cotta
[RecipeDetailView] Rendering, recipe: Barry pana cotta
[ServingDisplay] Rendering, container: {id: X, name: "винна чаша", name_en: "wine glass", serving_container_type: "glass"}
[ServingDisplay] ✅ Portion case executed
```

---

## Summary

Simple fix: Remove `name_bg` from equipment query since it doesn't exist.
Equipment table structure:
- `name` → Bulgarian
- `name_en` → English
- `serving_container_type` → 'glass', 'pan', 'bowl', 'cup', 'plate'

---

Ready to execute! 🚀