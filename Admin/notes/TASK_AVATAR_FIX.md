# Task: Fix — Show Recipe Avatar in CookingMode for Simple Recipes

## Root cause
In `Mobile/app/recipe-detail/[id].tsx`, `simpleComponent` object is missing `imageUrl`.
`CookingModeComponentSelector` checks `comp.imageUrl` — if undefined, shows emoji icon instead of avatar.

## Fix in `Mobile/app/recipe-detail/[id].tsx`

Find this block (inside transformedData useMemo, simple recipe path):

```typescript
      const simpleComponent = {
        id: 'simple-main',
        name: language === 'en'
          ? (simpleRecipe.name_en || simpleRecipe.name_bg || simpleRecipe.name || '')
          : (simpleRecipe.name_bg || simpleRecipe.name || ''),
        roleName: '',
        totalWeightGrams: simpleRecipe.total_weight_grams,
        totalCalories: simpleRecipe.total_calories,
        totalProtein: simpleRecipe.total_protein,
        totalFat: simpleRecipe.total_fat,
        totalCarbs: simpleRecipe.total_carbs,
        totalNetCarbs: simpleRecipe.total_net_carbs,
        bakeTime: simpleRecipe.bake_time_minutes,
        prepTime: simpleRecipe.prep_time_minutes,
      };
```

Replace with:

```typescript
      const simpleComponent = {
        id: 'simple-main',
        name: language === 'en'
          ? (simpleRecipe.name_en || simpleRecipe.name_bg || simpleRecipe.name || '')
          : (simpleRecipe.name_bg || simpleRecipe.name || ''),
        roleName: '',
        imageUrl: simpleRecipe.image_url || null,
        totalWeightGrams: simpleRecipe.total_weight_grams,
        totalCalories: simpleRecipe.total_calories,
        totalProtein: simpleRecipe.total_protein,
        totalFat: simpleRecipe.total_fat,
        totalCarbs: simpleRecipe.total_carbs,
        totalNetCarbs: simpleRecipe.total_net_carbs,
        bakeTime: simpleRecipe.bake_time_minutes,
        prepTime: simpleRecipe.prep_time_minutes,
      };
```

## What this fixes
- CookingModeComponentSelector: shows recipe photo instead of 🍰 emoji
- Steps text mode (ComponentHeader): shows recipe photo instead of fallback emoji
- Works for ALL simple recipes automatically

## Rules
- One line added: `imageUrl: simpleRecipe.image_url || null,`
- Do NOT touch ready recipe path
- Do NOT touch CookingModeComponentSelector.tsx
