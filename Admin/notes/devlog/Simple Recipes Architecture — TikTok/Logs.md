# KetoCakR Mobile — Fix Recipe Builder Bug & Remove Debug Logs
**Task for Claude Code execution**

---

## Objectives

1. **Fix Recipe Builder Bug** — "Encountered two..." error when switching component roles
2. **Remove All Debug Logs** — Clean up console.log statements added during recent fixes
3. **Verify Production Readiness** — Ensure code is clean for app store submission

---

## Part 1: Fix Recipe Builder Bug

### Problem Statement

**Error:** "Encountered two children with the same key..." appears when users switch roles in Recipe Builder.

**Triggers:** Switching between Crust → Cream → Filling → Decoration roles in the create recipe flow.

**Impact:** Users cannot modify recipe components, blocking the advanced builder feature.

**Likely Cause:** React key duplication in FlatList or component rendering when role changes.

---

### Investigation Steps

1. **Find the Recipe Builder file:**
   - Location: `Mobile/app/(modals)/visual-recipe-builder.tsx` OR similar
   - Alternative: Check `Mobile/app/(tabs)/create/` for builder component

2. **Search for FlatList or ScrollView rendering components:**
   ```typescript
   // Look for patterns like:
   {roles.map(role => (
     <TouchableOpacity key={role.id}>  // ← Check if key is stable
   
   // Or:
   <FlatList
     data={selectedComponents}
     keyExtractor={(item) => ...}  // ← Check if key changes on role switch
   ```

3. **Identify the bug:**
   - Keys should be **stable** (never change based on index)
   - Keys should be **unique** (no duplicates)
   - Keys should be **immutable** (not based on user selections)

4. **Common causes:**
   - Using array index as key: `key={index}` ❌
   - Using non-unique ID: `key={role.name}` (if name repeats) ❌
   - Using user selection state: `key={selectedRole}` (changes) ❌
   - Missing key entirely ❌

---

### Fix Pattern

**WRONG (Don't do this):**
```typescript
{roles.map((role, index) => (
  <TouchableOpacity key={index}>  // ❌ Index changes! Causes "two children" error
    {role.name}
  </TouchableOpacity>
))}
```

**CORRECT (Do this):**
```typescript
{roles.map((role) => (
  <TouchableOpacity key={String(role.id)}>  // ✅ Stable, unique ID
    {role.name}
  </TouchableOpacity>
))}
```

**For FlatList:**
```typescript
<FlatList
  data={selectedComponents}
  keyExtractor={(item, index) => String(item.id)}  // ✅ Use item.id, not index
  renderItem={({ item }) => (
    <ComponentCard component={item} />
  )}
/>
```

---

### Implementation Steps

1. **Locate the builder component** (30 min)
   - Search for "visual-recipe-builder" or "recipe-generator"
   - Identify the role switching UI

2. **Find all key={...} declarations** (30 min)
   - Use regex: `key={` to find all keys
   - Check if any use index, array position, or state-based values

3. **Replace unstable keys with item.id** (30 min)
   - Replace `key={index}` → `key={String(item.id)}`
   - Replace `key={index}` in map() → `key={String(role.id)}`
   - Ensure IDs are unique across all renders

4. **Test on real device** (60 min)
   - Open Expo Go
   - Go to Create tab → Recipe Builder
   - Try switching roles multiple times
   - Verify no "Encountered two..." error

---

## Part 2: Remove All Debug Logs

### Log Files to Clean

Search entire codebase for these patterns and remove:

**Pattern 1: Generic console.log**
```typescript
console.log('...');  // ← Remove or comment
```

**Pattern 2: DEBUG/TEST logs**
```typescript
console.log('🔍 DEBUG: ...');
console.log('✅ TEST: ...');
console.log('❌ ERROR: ...');
console.log('[Something] ...');
```

**Pattern 3: Logs from recent session (2026-05-20)**
- Look for logs with emojis: 🎯, 🔍, 📋, ✅, ❌, 🔧, 📊
- These were added during ingredient fixes

---

### Files to Check (Priority Order)

**HIGH PRIORITY - Recently Modified:**

1. **`Mobile/app/recipe-detail/[id].tsx`**
   - Lines 66, 67 (BASE query logs)
   - Lines 236-247 area (ingredients parsing logs)
   - Anywhere with console.log in the transform function
   
   Remove:
   ```typescript
   console.log('📄 BASE query error:', ...);
   console.log('📄 BASE query data count:', ...);
   console.log('🔍 DEBUG recipe_ingredients for', ...);
   console.log('[Ready Steps] uuidToIngId map for ...', ...);
   console.log('[Ready Steps] recipeIngredientsIdMap:', ...);
   console.log('[Ready Equipment Query] ...', ...);
   console.log('[Recipe Equipment Query] ...', ...);
   console.log('[CookingMode] step ...', ...);
   ```

2. **`Mobile/components/RecipeDetailView.tsx`**
   - Lines ~400 (introData computation)
   - Lines ~980-1050 (Cooking Mode rendering)
   
   Remove:
   ```typescript
   console.log('[RecipeDetailView] Rendering:', ...);
   console.log('[CookingMode] ...');
   console.log('🎯 useEffect triggered, mode: ...', ...);
   console.log('❌ Conditions NOT met!', ...);
   ```

3. **`Mobile/app/(modals)/visual-recipe-builder.tsx` (or similar)**
   - Any console.log related to role switching
   - Any test/debug logs

**MEDIUM PRIORITY - General:**

4. **`Mobile/app/(tabs)/home/index.tsx`**
   - Remove any LOG or DEBUG statements

5. **`Mobile/app/(tabs)/search/index.tsx`**
   - Remove any console.log

6. **All other files in `Mobile/`**
   - Search for: `console.log\(` (regex)
   - Remove test/debug logs
   - **KEEP** error handling logs (console.error for actual errors)

---

### What to Remove vs. Keep

**REMOVE ✂️:**
```typescript
console.log('DEBUG: ...');
console.log('Testing ...');
console.log('🔍 ...');
console.log('[Something] State:', state);
console.log('LOG ...', data);
```

**KEEP ✅:**
```typescript
// For error handling in try-catch
console.error('Failed to fetch:', error);
console.warn('This feature not available');

// For production error tracking (if you use Sentry)
Sentry.captureException(error);
```

---

## Part 3: Verification Checklist

After fixes, verify:

- [ ] **Recipe Builder:**
  - [ ] Switch roles (Crust → Cream → Filling → Decoration) without error
  - [ ] Add multiple components
  - [ ] Remove components
  - [ ] No "Encountered two children with the same key" error
  - [ ] No React warnings in console

- [ ] **All Screens:**
  - [ ] Home tab loads without console errors
  - [ ] Search tab loads without console errors
  - [ ] Recipe Detail loads without console errors
  - [ ] Cooking Mode loads without console errors
  - [ ] No 🔍, 🎯, ✅, ❌ emojis in console

- [ ] **Code Quality:**
  - [ ] Search entire codebase for `console.log(`
  - [ ] Result count should be MINIMAL (only error handling)
  - [ ] All keys in lists are stable and unique
  - [ ] No warnings from React/Expo in console

---

## Implementation Order

1. **Fix Recipe Builder bug** (60 min)
   - Locate builder component
   - Find unstable keys
   - Replace with stable item.id
   - Test thoroughly

2. **Remove logs from [id].tsx** (30 min)
   - Search/replace all console.log calls
   - Focus on ingredient parsing + cooking mode sections

3. **Remove logs from RecipeDetailView.tsx** (20 min)
   - Search/replace all console.log calls
   - Focus on rendering sections

4. **Remove logs from other files** (20 min)
   - Visual-recipe-builder.tsx
   - Home, Search, other screens

5. **Final verification** (30 min)
   - Test on real device (Expo Go)
   - Open browser console
   - Verify clean output (no debug logs, no React errors)

**Total time: 160 minutes (~2.5 hours)**

---

## Testing Procedure

### Test Recipe Builder Bug Fix

**Device:** Android via Expo Go

1. Go to Tab 3 (Create) → Start Recipe Builder
2. Select first role (Crust)
3. Select a component (e.g., Chocolate Cake)
4. **Switch to next role (Cream)**
   - Expected: Smooth transition, no error
   - Current bug: "Encountered two children..." error appears
5. Add another component in Cream role
6. **Switch to Filling role**
   - Repeat test
7. Remove a component
8. **Switch back to Crust**
   - Verify components still there

**Success:** All switches work without "Encountered two..." error

### Test Log Removal

1. Open Expo Go with app running
2. Press 'i' → "View logs"
3. **Verify:**
   - No 🔍, 🎯, ✅, ❌ emojis
   - No "[Recipe Detail] ..." logs
   - No "[CookingMode] ..." logs
   - No "DEBUG:", "TEST:", "LOG" messages
   - Only actual errors appear (if any)

**Success:** Console is clean, only real errors show up

---

## Code Review Checklist

Before committing:

- [ ] All console.log statements removed (except error handling)
- [ ] No commented-out console.log lines left
- [ ] Recipe Builder keys use stable item.id
- [ ] No new React warnings in console
- [ ] All screens tested without console output
- [ ] Code is production-ready

---

## Files to Modify

| File | Changes | Priority |
|------|---------|----------|
| `Mobile/app/(modals)/visual-recipe-builder.tsx` | Fix key duplication bug | P0 |
| `Mobile/app/recipe-detail/[id].tsx` | Remove ~15 console.log calls | P1 |
| `Mobile/components/RecipeDetailView.tsx` | Remove ~10 console.log calls | P1 |
| `Mobile/app/(tabs)/home/index.tsx` | Remove test logs | P2 |
| `Mobile/app/(tabs)/search/index.tsx` | Remove test logs | P2 |
| Other files | Search and remove remaining logs | P2 |

---

## Success Criteria

✅ Recipe Builder bug fixed (no "Encountered two..." error)  
✅ All console.log debug statements removed  
✅ Console is clean (only real errors)  
✅ Code is production-ready  
✅ All screens tested without errors  
✅ Ready for app store submission  

---

## Time Estimate

**160 minutes total (~2.5 hours)**

- Recipe Builder bug fix: 60 min
- Remove logs: 70 min
- Testing & verification: 30 min

---

## Post-Completion

After this task:

1. **Next:** Create production build (signing + config)
2. **Then:** Set up beta testing (TestFlight + Google Play)
3. **Then:** Submit to app stores

**Status after completion:** ~70% ready for launch ✅

---

## Important Notes

1. **Don't remove error logging** — Keep `console.error()` and `console.warn()` for production debugging
2. **Test thoroughly** — Recipe Builder bug fix needs real-device testing
3. **Production-ready** — After this, code should be clean enough for app store review
4. **No hardcoded values** — Ensure no debug URLs or API keys left in code

---

Generated: 2026-05-20  
Priority: HIGH (blocking app store launch)  
Blocks: Everything else in app store roadmap