# Task: Add default_piece_weight_grams to ingredients_database

## Overview
Add a `default_piece_weight_grams` column to `ingredients_database` table
and expose it in the admin ingredients editor UI.

This column stores the average weight in grams of 1 piece/unit of an ingredient
(e.g. 1 egg = 50g, 1 onion = 150g). Used for nutrition calculations when
unit is 'бр', 'piece', 'pkg', 'бр.', etc.

---

## STEP 1: SQL Migration — run in Supabase SQL Editor

```sql
-- Add column
ALTER TABLE ingredients_database
ADD COLUMN IF NOT EXISTS default_piece_weight_grams numeric(8,2) null;

-- Populate common ingredients
UPDATE ingredients_database SET default_piece_weight_grams = 50  WHERE name ILIKE '%яйц%' OR name_en ILIKE '%egg%';
UPDATE ingredients_database SET default_piece_weight_grams = 150 WHERE name ILIKE '%лук%' AND name NOT ILIKE '%праз%' AND name NOT ILIKE '%зелен%';
UPDATE ingredients_database SET default_piece_weight_grams = 80  WHERE name ILIKE '%праз%';
UPDATE ingredients_database SET default_piece_weight_grams = 100 WHERE name ILIKE '%ябълк%' OR name_en ILIKE '%apple%';
UPDATE ingredients_database SET default_piece_weight_grams = 120 WHERE name ILIKE '%банан%' OR name_en ILIKE '%banana%';
UPDATE ingredients_database SET default_piece_weight_grams = 200 WHERE name ILIKE '%портокал%' OR name_en ILIKE '%orange%';
UPDATE ingredients_database SET default_piece_weight_grams = 60  WHERE name ILIKE '%лимон%' OR name_en ILIKE '%lemon%';
UPDATE ingredients_database SET default_piece_weight_grams = 50  WHERE name ILIKE '%лайм%' OR name_en ILIKE '%lime%';
UPDATE ingredients_database SET default_piece_weight_grams = 5   WHERE name ILIKE '%скилидк%' OR name ILIKE '%чесън%' OR name_en ILIKE '%garlic clov%';
UPDATE ingredients_database SET default_piece_weight_grams = 100 WHERE name ILIKE '%авокадо%' OR name_en ILIKE '%avocado%';
UPDATE ingredients_database SET default_piece_weight_grams = 10  WHERE name ILIKE '%фурма%' OR name_en ILIKE '%date%';
UPDATE ingredients_database SET default_piece_weight_grams = 30  WHERE name ILIKE '%шоколад%блок%' OR name_en ILIKE '%chocolate block%';
```

---

## STEP 2: Admin UI — ingredients editor

### File to find
The admin ingredients CRUD page. Likely one of:
- `Admin/app/dashboard/ingredients/page.tsx`
- `Admin/app/dashboard/ingredients-database/page.tsx`
- `Admin/components/IngredientForm.tsx`

Find it with:
```powershell
Get-ChildItem -Recurse -Filter "*.tsx" "C:\Dev\KetoCakR\Admin\app\dashboard" | 
  Where-Object { $_.Name -match "ingredient" } | Select-Object FullName
```

### Changes to make in the ingredient form/editor

#### Add field to the form interface/type

Find the ingredient interface or type definition. Add:
```typescript
default_piece_weight_grams?: number | null;
```

#### Add input field in the form UI

Find where nutrition fields are rendered (calories_per_100g, protein_per_100g etc).
Add this field nearby — preferably after the unit/name fields:

```tsx
<div>
  <label className={lbl}>
    Тегло на 1 бр. (г)
    <span className="ml-1 text-xs text-gray-400 font-normal">
      — само за съставки в бройки
    </span>
  </label>
  <input
    type="number"
    min={0}
    step={0.1}
    value={form.default_piece_weight_grams ?? ''}
    onChange={e => setForm(p => ({
      ...p,
      default_piece_weight_grams: e.target.value ? parseFloat(e.target.value) : null
    }))}
    className={inp}
    placeholder="напр. 50 за яйце, 150 за лук"
  />
</div>
```

#### Include field in save/update payload

Find where the form data is sent to Supabase or API.
Add `default_piece_weight_grams` to the payload:

```typescript
default_piece_weight_grams: form.default_piece_weight_grams ?? null,
```

#### Show value in ingredients list/table

Find the ingredients table/list view.
Add a column or badge showing the piece weight when set:

```tsx
{ingredient.default_piece_weight_grams && (
  <span className="text-xs text-gray-500">
    1 бр. = {ingredient.default_piece_weight_grams}г
  </span>
)}
```

---

## STEP 3: Update nutrition calculation in SimpleRecipeForm.tsx

### File
`Admin/components/simple-recipes/SimpleRecipeForm.tsx`

### Find the UNIT_TO_GRAMS useEffect

OLD:
```typescript
    const UNIT_TO_GRAMS: Record<string, number> = {
      'g': 1, 'г': 1, 'ml': 1, 'мл': 1,
      'tsp': 5, 'ч.л.': 5,
      'tbsp': 15, 'с.л.': 15,
      'cup': 240, 'чаша': 240,
      'kg': 1000, 'кг': 1000,
      'l': 1000, 'л': 1000,
    };
    let cal = 0, prot = 0, fat = 0, carbs = 0, fiber = 0, wt = 0;
    ingredients.forEach(ing => {
      const q = Number(ing.quantity) || 0;
      if (q > 0) {
        const multiplier = UNIT_TO_GRAMS[ing.unit] ?? 1;
        const qg = q * multiplier;
        if (UNIT_TO_GRAMS[ing.unit] !== undefined) wt += qg;
```
NEW:
```typescript
    const UNIT_TO_GRAMS: Record<string, number> = {
      'g': 1, 'г': 1, 'ml': 1, 'мл': 1,
      'tsp': 5, 'ч.л.': 5,
      'tbsp': 15, 'с.л.': 15,
      'cup': 240, 'чаша': 240,
      'kg': 1000, 'кг': 1000,
      'l': 1000, 'л': 1000,
    };
    const PIECE_UNITS = new Set(['бр', 'бр.', 'piece', 'pkg', 'бройк']);
    let cal = 0, prot = 0, fat = 0, carbs = 0, fiber = 0, wt = 0;
    ingredients.forEach(ing => {
      const q = Number(ing.quantity) || 0;
      if (q > 0) {
        let multiplier: number;
        let countForWeight = false;
        if (UNIT_TO_GRAMS[ing.unit] !== undefined) {
          multiplier = UNIT_TO_GRAMS[ing.unit];
          countForWeight = true;
        } else if (PIECE_UNITS.has(ing.unit) && ing._piece_weight) {
          // Use default piece weight from ingredients_database
          multiplier = ing._piece_weight;
          countForWeight = true;
        } else {
          multiplier = 1;
          countForWeight = false;
        }
        const qg = q * multiplier;
        if (countForWeight) wt += qg;
```

### Also add _piece_weight to IngredientRow interface

OLD:
```typescript
interface IngredientRow {
  ingredient_database_id: string | null;
  ingredient_name: string;
  quantity: number;
  unit: string;
  _calories?: number;
  _protein?: number;
  _fat?: number;
  _carbs?: number;
  _fiber?: number;
  _is_sugar_alcohol?: boolean;
}
```
NEW:
```typescript
interface IngredientRow {
  ingredient_database_id: string | null;
  ingredient_name: string;
  quantity: number;
  unit: string;
  _calories?: number;
  _protein?: number;
  _fat?: number;
  _carbs?: number;
  _fiber?: number;
  _is_sugar_alcohol?: boolean;
  _piece_weight?: number | null;
}
```

### Update addIngredient to fetch default_piece_weight_grams

OLD:
```typescript
  const addIngredient = async (ingredient: { id: string; name_bg: string; name_en: string }) => {
    const { data } = await supabase
      .from('ingredients_database')
      .select('calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, is_sugar_alcohol')
      .eq('id', ingredient.id)
      .single();

    setIngredients(prev => [...prev, {
      ingredient_database_id: ingredient.id,
      ingredient_name: ingredient.name_bg,
      quantity: 100,
      unit: 'g',
      _calories: data?.calories_per_100g,
      _protein: data?.protein_per_100g,
      _fat: data?.fat_per_100g,
      _carbs: data?.carbs_per_100g,
      _fiber: data?.fiber_per_100g,
      _is_sugar_alcohol: data?.is_sugar_alcohol || false,
    }]);
```
NEW:
```typescript
  const addIngredient = async (ingredient: { id: string; name_bg: string; name_en: string }) => {
    const { data } = await supabase
      .from('ingredients_database')
      .select('calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, is_sugar_alcohol, default_piece_weight_grams')
      .eq('id', ingredient.id)
      .single();

    // Auto-set unit to 'бр' if ingredient has piece weight and no obvious g/ml unit
    const defaultUnit = data?.default_piece_weight_grams ? 'бр' : 'g';

    setIngredients(prev => [...prev, {
      ingredient_database_id: ingredient.id,
      ingredient_name: ingredient.name_bg,
      quantity: data?.default_piece_weight_grams ? 1 : 100,
      unit: defaultUnit,
      _calories: data?.calories_per_100g,
      _protein: data?.protein_per_100g,
      _fat: data?.fat_per_100g,
      _carbs: data?.carbs_per_100g,
      _fiber: data?.fiber_per_100g,
      _is_sugar_alcohol: data?.is_sugar_alcohol || false,
      _piece_weight: data?.default_piece_weight_grams || null,
    }]);
```

### Add 'бр' to UNITS constant

OLD:
```typescript
const UNITS = ['g', 'ml', 'tsp', 'tbsp', 'cup', 'piece', 'pkg'];
```
NEW:
```typescript
const UNITS = ['g', 'г', 'ml', 'мл', 'бр', 'tsp', 'ч.л.', 'tbsp', 'с.л.', 'cup', 'piece', 'pkg'];
```

### Show piece weight hint in ingredient row

Find the ingredient list render. After the unit selector, add:
```tsx
{ing.unit === 'бр' && ing._piece_weight && (
  <span className="text-xs text-gray-400 whitespace-nowrap">
    = {Math.round(ing.quantity * ing._piece_weight)}г
  </span>
)}
{ing.unit === 'бр' && !ing._piece_weight && (
  <span className="text-xs text-amber-500 whitespace-nowrap">
    ⚠️ няма тегло
  </span>
)}
```

---

## STEP 4: Same changes in page.tsx ingredients section

File: `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

In `addIngredient` function, also fetch and store `default_piece_weight_grams`:

```typescript
  async function addIngredient(ingredient: { id: string; name_bg: string; name_en: string }) {
    const { data } = await supabase
      .from('ingredients_database')
      .select('calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, default_piece_weight_grams')
      .eq('id', ingredient.id)
      .single();
    setIngredients(prev => [...prev, {
      id: '',
      ingredient_database_id: ingredient.id,
      ingredient_name: ingredient.name_bg,
      quantity: data?.default_piece_weight_grams ? 1 : 100,
      unit: data?.default_piece_weight_grams ? 'бр' : 'g',
      _calories: data?.calories_per_100g,
      _protein: data?.protein_per_100g,
      _fat: data?.fat_per_100g,
      _carbs: data?.carbs_per_100g,
      _fiber: data?.fiber_per_100g,
      _piece_weight: data?.default_piece_weight_grams || null,
    }]);
    setIngredientSearch('');
  }
```

---

## Verify after implementation

1. Run SQL migration in Supabase
2. Check яйца have default_piece_weight_grams = 50:
```sql
SELECT name, default_piece_weight_grams 
FROM ingredients_database 
WHERE name ILIKE '%яйц%';
```
3. In admin ingredients editor — open any ingredient and verify the new field shows
4. In SimpleRecipeForm — add яйца, confirm unit auto-sets to 'бр', quantity to 1
5. Recalculate recipe with 3 яйца — total_weight_grams should include 150g for eggs
