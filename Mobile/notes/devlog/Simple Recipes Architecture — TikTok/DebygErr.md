# DIAGNOSTIC: Mobile App Not Loading After Changes

## Problem
App crashes when viewing recipe detail.

## Immediate Fixes

### Fix 1: Component Exports

**File:** `Mobile/app/recipe-detail/components/StepsImagesTextMode.tsx`
```typescript
// Change from:
export const StepsImagesTextMode = () => { ... }

// To:
export default function StepsImagesTextMode() { ... }
```

**File:** `Mobile/app/recipe-detail/components/StepsModeToggle.tsx`
```typescript
// Change from:
export const StepsModeToggle = () => { ... }

// To:
export default function StepsModeToggle() { ... }
```

---

## Debug Steps

### Step 1: Check Console Errors

**Mobile Console (Expo shake → Debug menu):**
```
Look for:
❌ "Cannot find module"
❌ "Cannot read property of undefined"
❌ "Query error"
❌ Any other JS errors
```

**Report exact error message!**

---

### Step 2: Check if Query Loads Data

**In `recipe-detail/[id].tsx`, add console logs:**

```typescript
const { data: recipe, isLoading, error } = useQuery({
  // ...
});

console.log('[Recipe Detail] Loading:', isLoading);
console.log('[Recipe Detail] Error:', error);
console.log('[Recipe Detail] Recipe:', recipe);
```

---

### Step 3: Check Dessert Type Join

**Problem might be:** dessert_type FK returns NULL

```typescript
// In query:
.select(`
  *,
  dessert_type:dessert_types(id, name_en, name_bg),  // ← Might fail
  serving_container:serving_containers(...)          // ← Might fail
`)
```

**If serving_containers table doesn't exist yet**, query fails!

---

### Step 4: Simplify Query Temporarily

**Test with basic query first:**

```typescript
const { data: recipe } = useQuery({
  queryKey: ['recipe', id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('ready_recipes')
      .select('*')  // ← NO joins, just basic data
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('[Recipe] Query error:', error);
      throw error;
    }
    
    console.log('[Recipe] Loaded:', data?.name_en);
    return data;
  }
});
```

If this works → problem is with JOINs
If this fails → problem is with data loading

---

## Most Likely Problem

**You did PHASE 2 (serving_containers) but:**

❌ Created table in DATABASE
❌ BUT mobile still tries to JOIN to it in query
❌ Table doesn't exist → query crashes

---

## Solutions

### Option A: Complete PHASE 2 (Recommended)
1. Create `serving_containers` table
2. Update admin panel dropdown
3. Update mobile query with JOINs
4. Everything works ✅

### Option B: Revert to Simple Query (Quick Fix)
1. Remove JOINs from mobile query
2. App loads again
3. Later: Add JOINs back after Phase 2

---

## What to Report

1. **Mobile console error:** (exact message)
2. **Does simplified query work?** (yes/no)
3. **Does serving_containers table exist?** (yes/no)
4. **Did Phase 2 SQL run successfully?** (yes/no)

---

## Quick Test

**Run in mobile console:**

```javascript
// Test if Supabase works
supabase.from('ready_recipes').select('*').limit(1)
  .then(res => console.log('Query works:', res.data?.length))
  .catch(err => console.error('Query failed:', err));
```

---

Ready to debug? Start with console logs! 🔍