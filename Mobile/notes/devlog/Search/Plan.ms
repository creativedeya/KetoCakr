# Claude Code Task — Tab 2 Modern Search Implementation

**Objective:** Completely redesign Tab 2 (Search) with modern UX, advanced filters, and Lab Notes search functionality.

**Timeline:** 6 hours  
**Priority:** HIGH  
**Status:** Ready for execution  

---

## PREREQUISITES

### Required Dependencies
```bash
npm install @react-native-community/slider @tanstack/react-query
```

### Files to Check First
- `Mobile/app/(tabs)/search/index.tsx` (current - will be replaced)
- `Mobile/constants/Colors.ts` (for color references)
- `Mobile/hooks/useLanguage.ts` (for BG/EN support)
- `Mobile/components/RecipeCard.tsx` (reuse for results)

---

## STEP-BY-STEP IMPLEMENTATION

### STEP 1: Create New Search Tab Component (2 hours)

**File:** `Mobile/app/(tabs)/search/index.tsx`

Replace entire file with the code from `/home/claude/CLAUDE_CODE_TAB2_MODERN_SEARCH.md`

Key sections:
1. FilterState interface (defines all filter options)
2. SearchTab main component
3. FilterModal subcomponent
4. LabNotesModal subcomponent (NEW!)
5. StyleSheet at bottom

**Checklist:**
- [ ] Copy main SearchTab component
- [ ] Copy FilterModal component
- [ ] Copy LabNotesModal component
- [ ] Verify all imports are correct
- [ ] Check Colors references exist
- [ ] Verify useLanguage hook works

---

### STEP 2: Create Slider Component (30 min)

**File:** `Mobile/components/SliderComponent.tsx`

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import Colors from '@/constants/Colors';

interface SliderComponentProps {
  label: string;
  min: number;
  max: number;
  value: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

export const SliderComponent = ({
  label,
  min,
  max,
  value,
  step,
  unit = '',
  onChange,
}: SliderComponentProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value}{unit}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={Colors.primary.main}
        maximumTrackTintColor={Colors.background.secondary}
        thumbTintColor={Colors.primary.main}
      />
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{min}{unit}</Text>
        <Text style={styles.rangeLabel}>{max}{unit}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary.main,
  },
  slider: {
    height: 40,
    marginVertical: 8,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});
```

**Checklist:**
- [ ] File created
- [ ] All imports work
- [ ] Export component

---

### STEP 3: Create Lab Notes Query Hook (30 min)

**File:** `Mobile/hooks/useLabNotes.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase';

export const useLabNotes = (query: string) => {
  return useQuery({
    queryKey: ['labNotes', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const { data, error } = await supabase
        .from('lab_notes')
        .select('*')
        .or(
          `title.ilike.%${query}%,note.ilike.%${query}%,tips.ilike.%${query}%`
        )
        .limit(20);

      if (error) {
        console.error('Lab Notes error:', error);
        return [];
      }

      return data || [];
    },
    enabled: query.length > 0,
  });
};
```

**Checklist:**
- [ ] File created
- [ ] useQuery properly configured
- [ ] Export hook

---

### STEP 4: Update RecipeCard to Work in Grid (30 min)

**File:** `Mobile/components/RecipeCard.tsx` (verify/update)

Ensure RecipeCard:
- [ ] Works with 2-column layout
- [ ] Has proper aspect ratio
- [ ] Shows image, title, nutrition badge
- [ ] Responsive to small screens

---

### STEP 5: Create Filter Query Logic (1 hour)

**File:** `Mobile/api/recipeFilters.ts` (NEW)

```typescript
import { supabase } from './supabase';

export interface RecipeFilters {
  searchText: string;
  timeMin: number;
  timeMax: number;
  caloriesMin: number;
  caloriesMax: number;
  carbsMin: number;
  carbsMax: number;
  fatMin: number;
  fatMax: number;
  proteinMin: number;
  proteinMax: number;
  favorites: boolean;
  recent: boolean;
  pinned: boolean;
  sortBy: 'default' | 'rating' | 'time' | 'calories';
  selectedTags: string[];
  includedIngredients: string[];
  excludedIngredients: string[];
}

export const queryRecipes = async (filters: RecipeFilters) => {
  let query = supabase
    .from('base_recipes')
    .select('*, recipe_role:recipe_roles(*), dessert_type:dessert_types(*)');

  // Text search
  if (filters.searchText) {
    query = query.ilike('name', `%${filters.searchText}%`);
  }

  // Nutrition filters
  if (filters.caloriesMin > 0) {
    query = query.gte('total_calories', filters.caloriesMin);
  }
  if (filters.caloriesMax < 1000) {
    query = query.lte('total_calories', filters.caloriesMax);
  }

  if (filters.carbsMin > 0) {
    query = query.gte('total_net_carbs', filters.carbsMin);
  }
  if (filters.carbsMax < 50) {
    query = query.lte('total_net_carbs', filters.carbsMax);
  }

  if (filters.fatMin > 0) {
    query = query.gte('total_fat', filters.fatMin);
  }
  if (filters.fatMax < 100) {
    query = query.lte('total_fat', filters.fatMax);
  }

  if (filters.proteinMin > 0) {
    query = query.gte('total_protein', filters.proteinMin);
  }
  if (filters.proteinMax < 50) {
    query = query.lte('total_protein', filters.proteinMax);
  }

  // Time filter
  if (filters.timeMin > 0 || filters.timeMax < 120) {
    query = query.gte('prep_time', filters.timeMin);
    query = query.lte('prep_time', filters.timeMax);
  }

  // Sorting
  switch (filters.sortBy) {
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'time':
      query = query.order('prep_time', { ascending: true });
      break;
    case 'calories':
      query = query.order('total_calories', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error('Recipe filter error:', error);
    return [];
  }

  return data || [];
};
```

**Checklist:**
- [ ] File created
- [ ] All filter conditions implemented
- [ ] Sorting logic correct
- [ ] Export function

---

### STEP 6: Integrate Search Component (1 hour)

**File:** `Mobile/app/(tabs)/search/index.tsx`

After copying main code:

1. **Verify all imports:**
   ```typescript
   import Colors from '@/constants/Colors';
   import { useLanguage } from '@/hooks/useLanguage';
   import { useLabNotes } from '@/hooks/useLabNotes';
   import { queryRecipes } from '@/api/recipeFilters';
   import RecipeCard from '@/components/RecipeCard';
   ```

2. **Update query logic to use custom API:**
   ```typescript
   const { data: recipes = [], isLoading: recipesLoading } = useQuery({
     queryKey: ['searchRecipes', filters],
     queryFn: () => queryRecipes(filters),
   });
   ```

3. **Replace placeholder lab notes with hook:**
   ```typescript
   const { data: labNotes = [] } = useLabNotes(filters.labNotesQuery);
   ```

**Checklist:**
- [ ] All imports verified
- [ ] useQuery integrated
- [ ] useLabNotes hook integrated
- [ ] Colors applied correctly
- [ ] Language strings BG/EN work

---

### STEP 7: Test on Device (1 hour)

```bash
# Clear cache and start
npx expo start --clear

# Test on device:
```

**Test Cases:**
- [ ] Tab 2 loads without errors
- [ ] Text search works
- [ ] Quick filters toggle (♥, ⏱, 📌)
- [ ] Filter modal opens
- [ ] Sliders adjust values
- [ ] Results update in real-time
- [ ] Clear filters button works
- [ ] Lab Notes modal opens
- [ ] Lab Notes search works
- [ ] Language toggle (BG/EN) works
- [ ] No console errors
- [ ] Smooth animations
- [ ] No lag with 50 recipes

---

## VERIFICATION CHECKLIST

### Before Starting
- [ ] Read `/home/claude/CLAUDE_CODE_TAB2_MODERN_SEARCH.md`
- [ ] Check `Mobile/constants/Colors.ts` exists
- [ ] Check `Mobile/hooks/useLanguage.ts` exists
- [ ] Device ready for testing

### During Development
- [ ] Each file created successfully
- [ ] No import errors
- [ ] Component renders (check console)
- [ ] Supabase queries work (check network tab)
- [ ] Slider library installed

### After Completion
- [ ] All 7 steps completed
- [ ] All test cases pass
- [ ] No console warnings/errors
- [ ] Both BG and EN languages work
- [ ] Video playback still works (doesn't conflict)
- [ ] App doesn't crash on complex filters
- [ ] Ready for commit

---

## COMMON ISSUES & SOLUTIONS

### Issue: "Cannot find module @react-native-community/slider"
**Solution:** 
```bash
npm install @react-native-community/slider
npx expo start --clear
```

### Issue: "useLanguage is not defined"
**Solution:** Check `Mobile/hooks/useLanguage.ts` exists and export default is correct

### Issue: "Colors.primary.main is undefined"
**Solution:** Verify `Mobile/constants/Colors.ts` has all color references

### Issue: "Sliders not working"
**Solution:** Check slider value is between min/max, step is correct

### Issue: "Lab Notes queries slow"
**Solution:** Add indexes to `lab_notes` table:
```sql
CREATE INDEX lab_notes_title_idx ON lab_notes USING gin (title gin_trgm_ops);
CREATE INDEX lab_notes_note_idx ON lab_notes USING gin (note gin_trgm_ops);
```

---

## FILES TO CREATE/MODIFY

### New Files
- [ ] `Mobile/components/SliderComponent.tsx`
- [ ] `Mobile/hooks/useLabNotes.ts`
- [ ] `Mobile/api/recipeFilters.ts`

### Modified Files
- [ ] `Mobile/app/(tabs)/search/index.tsx` (REPLACE)
- [ ] `Mobile/components/RecipeCard.tsx` (VERIFY)

### No Changes Needed
- `Mobile/constants/Colors.ts`
- `Mobile/hooks/useLanguage.ts`
- `Mobile/api/supabase.ts`

---

## ROLLBACK PLAN

If something breaks:

```bash
# Restore previous version
git checkout Mobile/app/(tabs)/search/index.tsx

# Or if not in git:
# Use backup from previous state
```

---

## SUCCESS CRITERIA

✅ **Tab 2 is production-ready when:**
- All 7 implementation steps complete
- All test cases pass
- No console errors
- Smooth performance (no lag)
- Both languages work
- Lab Notes search functional
- Ready for App Store

---

## TIMELINE BREAKDOWN

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Search component | 2h | TODO |
| 2 | Slider component | 30m | TODO |
| 3 | Lab Notes hook | 30m | TODO |
| 4 | RecipeCard verify | 30m | TODO |
| 5 | Filter query logic | 1h | TODO |
| 6 | Integration | 1h | TODO |
| 7 | Testing | 1h | TODO |
| **TOTAL** | **Complete Tab 2** | **6h** | **READY** |

---

## NEXT STEPS AFTER COMPLETION

1. **Commit changes:**
   ```bash
   git add Mobile/
   git commit -m "feat: Redesign Tab 2 with modern search and Lab Notes"
   ```

2. **Test on multiple devices**
3. **Prepare for App Store** (with other critical fixes)
4. **Gather user feedback** on new search UX

---

## QUESTIONS DURING EXECUTION

If stuck:
1. Check error message carefully
2. Verify file paths are correct
3. Check npm install output
4. Review Colors/Language references
5. Check Supabase connection
6. Ask in next standup

---

**Ready to start? Execute Step 1!** 🚀

Generated: 2026-05-22  
Task ID: TAB2-MODERN-SEARCH-001  
Status: READY FOR EXECUTION