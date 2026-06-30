# KetoCakR Mobile — Add Component Avatars in Cooking Mode
**Task for Claude Code execution**

---

## Problem

**In Cooking Mode (Steps Tab), component headers show only text + role name with large font.**

Currently:
- Shows only: "Блат" (role name)
- Should show: [Avatar image] "Блат Сахер" (with image from base_recipe.image_url)
- Text is TOO LARGE → causes text wrapping and overlapping

---

## Solution

### Step 1: Add image_url to components object

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Location:** Lines 180-206 (where components are built in transform function)

**In the `components.push()` block, ADD this field:**

```typescript
components.push({
  id: componentId,
  name: br.name,
  roleName,
  imageUrl: (br as any).image_url || null,  // ← ADD THIS LINE!
  totalWeightGrams: br.total_weight_grams != null
    ? Math.round(br.total_weight_grams * comp.multiplier)
    : undefined,
  // ... rest of fields ...
});
```

---

### Step 2: Update ComponentItem interface

**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Lines 67-77 (ComponentItem interface)

**ADD this field to the interface:**

```typescript
export interface ComponentItem {
  id: string;
  name: string;
  roleName: string;
  imageUrl?: string | null;  // ← ADD THIS!
  totalWeightGrams?: number;
  totalCalories?: number;
  // ... rest of fields ...
}
```

---

### Step 3: Update component header in Steps Tab

**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Lines 987-988 (where component header is rendered)

**REPLACE:**
```typescript
<View key={component.id} style={styles.stepGroup}>
  <Text style={styles.categoryLabel}>{component.roleName}</Text>
```

**WITH:**
```typescript
<View key={component.id} style={styles.stepGroup}>
  <View style={styles.componentHeader}>
    {component.imageUrl ? (
      <Image
        source={{ uri: component.imageUrl }}
        style={styles.componentAvatar}
        resizeMode="cover"
      />
    ) : (
      <View style={styles.componentAvatarFallback}>
        <Text style={styles.componentAvatarEmoji}>🍰</Text>
      </View>
    )}
    <View style={styles.componentHeaderText}>
      <Text style={styles.componentName} numberOfLines={1}>{component.name}</Text>
      <Text style={styles.componentRole} numberOfLines={1}>{component.roleName}</Text>
    </View>
    <Text style={styles.stepsCount}>{compSteps.length} {language === 'bg' ? 'стъпки' : 'steps'}</Text>
  </View>
```

---

### Step 4: Add styles for component header

**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** At the end of `const styles = StyleSheet.create({` (around line 1700+)

**ADD these styles:**

```typescript
// Component header in Steps tab
componentHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
  paddingBottom: 12,
  borderBottomWidth: 1,
  borderBottomColor: Colors.border.light,
},
componentAvatar: {
  width: 48,
  height: 48,
  borderRadius: 24,
  marginRight: 12,
},
componentAvatarFallback: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: Colors.background.tertiary,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},
componentAvatarEmoji: {
  fontSize: 24,
},
componentHeaderText: {
  flex: 1,
},
componentName: {
  fontSize: 14,  // ← SMALLER than before (was categoryLabel at 17)
  fontWeight: '600',
  color: Colors.primary.main,
  marginBottom: 2,
},
componentRole: {
  fontSize: 12,  // ← SMALLER
  color: Colors.text.secondary,
},
stepsCount: {
  fontSize: 12,
  color: Colors.text.secondary,
  marginLeft: 'auto',  // Push to right
  paddingLeft: 12,
},
```

---

## How It Works

1. **Step 1:** Add `imageUrl` to component data in `[id].tsx`
2. **Step 2:** Update TypeScript interface so RecipeDetailView knows about `imageUrl`
3. **Step 3:** Replace text-only header with Image + smaller text
4. **Step 4:** Add CSS styles for the new layout

**Result:**
```
Before:
  Блат (large text, no image)

After:
  [🍰 image] Блат Сахер (smaller text)    8 стъпки
              Блат (role)                 (on right)
```

---

## Testing

**Setup:**
- Close and reopen Expo Go
- Navigate to: Recipe Detail → Any complex recipe (e.g., Tropical)
- Go to Tab 3 (Steps/Готвя)
- TEXT VIEW mode

**Expected:**
- [ ] Component header shows image avatar (from base_recipe.image_url)
- [ ] Text is smaller: component name ~14px, role ~12px
- [ ] Step count visible on the right (e.g., "8 стъпки")
- [ ] No text wrapping/overlapping
- [ ] Fallback emoji 🍰 if no image
- [ ] Works for all components
- [ ] Works in TEXT and GALLERY modes

---

## Files to Modify

| File | Changes |
|------|---------|
| `Mobile/app/recipe-detail/[id].tsx` | Add `imageUrl` to components object (Step 1) |
| `Mobile/components/RecipeDetailView.tsx` | Update interface (Step 2) + replace header JSX (Step 3) + add styles (Step 4) |

---

## Code Locations

### [id].tsx changes:
- Lines 180-206: components.push() block
- Add: `imageUrl: (br as any).image_url || null,`

### RecipeDetailView.tsx changes:
- Lines 67-77: ComponentItem interface
- Add: `imageUrl?: string | null;`
- Lines 987-988: Component header rendering
- Replace text-only with Image + text layout
- Line 1700+: Add styles

---

## Success Criteria

✅ Component avatars show in Cooking Mode
✅ Font sizes reduced: name 14px, role 12px
✅ No text overlapping/wrapping
✅ Fallback emoji works
✅ Image loads correctly
✅ Works for all recipes (simple + complex)
✅ Works in TEXT and GALLERY modes
✅ No console errors

---

## Time Estimate

20-25 minutes

---

## Debug Tips

If avatars don't show:
1. Check `component.imageUrl` in logs:
```typescript
console.log('🎯 Component:', component.id, 'ImageUrl:', component.imageUrl);
```

2. Verify `image_url` is loaded in baseRecipes query — check SQL:
```sql
SELECT id, name, image_url FROM base_recipes LIMIT 5;
```

3. Check if image URL is valid (can open in browser)