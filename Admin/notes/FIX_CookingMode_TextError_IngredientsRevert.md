# Fix: Cooking Mode — Text String Error + Revert Ingredients Fallback

**Scope:** Mobile cooking mode components  
**Time:** 15 min

---

## Fix 1 — "Text strings must be rendered within a..." error

**Find the file:**
```bash
grep -rn "ingredients_used\|ingredientsUsed\|СЪСТАВКИ" C:/Dev/KetoCakR/Mobile/app/recipe-detail/components/ --include="*.tsx"
grep -rn "ingredients_used\|ingredientsUsed\|СЪСТАВКИ" C:/Dev/KetoCakR/Mobile/components/RecipeDetailView.tsx
```

Look for text rendered outside `<Text>` — common causes:
- `{someNumber}` directly in JSX (number rendered without Text wrapper)
- `{condition && 'some string'}` where condition is 0 (renders "0")
- Array `.join(', ')` result outside Text

Fix: wrap any bare string/number in `<Text>`:
```typescript
// WRONG:
<View>{someValue}</View>

// CORRECT:
<View><Text>{someValue}</Text></View>
```

Also check for `{count && <Component />}` patterns — if count is 0, renders "0":
```typescript
// WRONG:
{ingredients.length && <IngredientsList />}

// CORRECT:
{ingredients.length > 0 && <IngredientsList />}
```

---

## Fix 2 — Revert cooking mode ingredients fallback

Find the cooking mode step component where the fallback was added (from previous fix).

It looks like:
```typescript
const stepIngIds = step.ingredients_used || [];
const displayIngredients = stepIngIds.length > 0
  ? allIngredients.filter(ing => stepIngIds.includes(ing.id))
  : allIngredients;  // ← REMOVE THIS FALLBACK
```

Revert to original behavior — show ingredients ONLY when step has specific ones:
```typescript
const stepIngIds = step.ingredients_used || [];
const displayIngredients = stepIngIds.length > 0
  ? allIngredients.filter(ing => stepIngIds.includes(ing.id))
  : [];  // ← empty when no specific ingredients for this step
```

And the render:
```typescript
{displayIngredients.length > 0 && (
  <View style={styles.ingredientsSection}>
    {/* ingredient items */}
  </View>
)}
```

---

## Rules
- Fix 1: find and fix all bare text rendering in cooking mode
- Fix 2: revert fallback — empty ingredients_used = show nothing
- Do NOT change other tabs (text mode, photos mode)

---

## Verification
1. Mobile → Барчета с фъстъчено масло → СТЪПКИ → Готвя
2. No "Text strings must be rendered" error
3. Steps with empty ingredients_used → no ingredients section shown
4. No crash
