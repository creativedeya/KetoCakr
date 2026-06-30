# CLAUDE CODE TASK: Fix Hardcoded Servings Display

## Problems

### Problem 1: Over Recipe Image
**Current (WRONG):**
```
"6-14 portions" (hardcoded)
```

**Should be:**
```
"3 wine glasses" (from recipe.total_servings + recipe.serving_container.name)
```

### Problem 2: Tab 1 (Info Section)
**Current (WRONG):**
```
"18cm cake pan" (hardcoded)
or
"16cm pan" if 6 portions
```

**Should be:**
```
"3 wine glasses" (from recipe.total_servings + recipe.serving_container.name)
```

---

## Task 1: Fix Servings Display Over Image

**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Find where servings are displayed over/near recipe image

**Current code (likely looks like):**
```typescript
<View style={styles.servingsContainer}>
  <Text style={styles.servingsText}>6-14 portions</Text>
</View>
```

**Change to (CORRECT):**
```typescript
<View style={styles.servingsContainer}>
  <Text style={styles.servingsText}>
    {recipe.total_servings} {recipe.serving_container?.name || 'servings'}
  </Text>
</View>
```

**Or if you want bilingual:**
```typescript
<Text style={styles.servingsText}>
  {recipe.total_servings} {
    language === 'bg' 
      ? recipe.serving_container?.name 
      : recipe.serving_container?.name_en
  }
</Text>
```

---

## Task 2: Fix Tab 1 (Info Section)

**File:** `Mobile/components/RecipeDetailView.tsx` or `Mobile/app/recipe-detail/[id].tsx`

**Location:** Find Tab 1 content where pan size is displayed

**Current code (likely looks like):**
```typescript
{recipe.dessert_type?.id !== 3 && (
  <View>
    <Text>Pan size: 18cm</Text>
    <Text>Slices: 8</Text>
  </View>
)}
```

**Change to (CORRECT):**
```typescript
<View style={styles.infoSection}>
  <Text style={styles.infoLabel}>Servings:</Text>
  <Text style={styles.infoValue}>
    {recipe.total_servings} {
      language === 'bg' 
        ? recipe.serving_container?.name 
        : recipe.serving_container?.name_en
    }
  </Text>
</View>
```

---

## Task 3: Create Reusable Serving Display Component

**File:** `Mobile/components/ServingBadge.tsx` (NEW)

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/Theme';

interface ServingBadgeProps {
  totalServings: number;
  servingContainer?: any;
  language?: 'en' | 'bg';
  size?: 'small' | 'large';
}

export default function ServingBadge({
  totalServings,
  servingContainer,
  language = 'en',
  size = 'large'
}: ServingBadgeProps) {
  if (!servingContainer) {
    return <Text>{totalServings} servings</Text>;
  }

  const containerName = language === 'bg' 
    ? servingContainer.name 
    : servingContainer.name_en;

  if (size === 'small') {
    return (
      <Text style={{
        fontSize: Typography.caption.fontSize,
        color: Colors.text.secondary,
      }}>
        {totalServings} {containerName}
      </Text>
    );
  }

  return (
    <View style={{
      backgroundColor: Colors.background.secondary,
      padding: Spacing.md,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: Spacing.md,
    }}>
      <Text style={{
        fontSize: 24,
        fontWeight: '700',
        color: Colors.primary,
      }}>
        {totalServings}
      </Text>
      <Text style={{
        fontSize: Typography.body.fontSize,
        color: Colors.text.primary,
        marginTop: Spacing.xs,
      }}>
        {containerName}
      </Text>
    </View>
  );
}
```

---

## Task 4: Use ServingBadge in RecipeDetailView

**File:** `Mobile/components/RecipeDetailView.tsx`

**Replace hardcoded servings with component:**

```typescript
// At top of file
import ServingBadge from './ServingBadge';

// In render:
<ServingBadge
  totalServings={recipe.total_servings}
  servingContainer={recipe.serving_container}
  language={language}
  size="large"
/>

// Or for small display in Tab 1:
<ServingBadge
  totalServings={recipe.total_servings}
  servingContainer={recipe.serving_container}
  language={language}
  size="small"
/>
```

---

## Task 5: Verify Data is Available

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Add debugging to confirm data loads:**

```typescript
useEffect(() => {
  if (recipe) {
    console.log('[Recipe Detail] Recipe data:', {
      name: recipe.name_en,
      total_servings: recipe.total_servings,
      serving_container: recipe.serving_container,
    });
  }
}, [recipe]);
```

---

## Testing Checklist

**For Barry Pana Cotta (id: 96325c6c...):**

- [ ] Over image shows: "3 винна чаша" (or "3 wine glass" if EN)
- [ ] Not: "6-14 portions"
- [ ] Tab 1 shows: "3 винна чаша"
- [ ] Not: "18cm cake pan"
- [ ] No console errors
- [ ] Bilingual toggle works (BG/EN)

**For Cakes (e.g., Sacher):**

- [ ] Shows correct servings from recipe
- [ ] Shows correct pan if data exists
- [ ] Otherwise shows fallback text

---

## Expected Result

**Before (Hardcoded):**
```
Over image: "6-14 portions"
Tab 1: "18cm cake pan"
```

**After (Dynamic):**
```
Over image: "3 wine glasses"
Tab 1: "3 wine glasses"

(Or for cakes)
Over image: "8 slices from 18cm pan"
Tab 1: "18cm pan, 8 servings"
```

---

## Implementation Notes

1. Replace ALL hardcoded pan/portion displays
2. Use `recipe.total_servings` + `recipe.serving_container`
3. Handle NULL serving_container gracefully (fallback text)
4. Test with multiple recipe types (portion, cake, tart)

---

Ready to implement? 🚀