# Fix: dessert_type_id sent to base_recipes (column doesn't exist)

## Problem
SimpleRecipeForm includes dessert_type_id in FormState and spreads it into
the payload via `...form`. The POST/PATCH handler does `{ ...body }` into
base_recipes — but base_recipes has NO dessert_type_id column.

base_recipes uses: compatible_dessert_types integer[] (array)
ready_recipes uses: dessert_type_id integer (single FK)

## Fix 1: SimpleRecipeForm.tsx — remove dessert_type_id from FormState

These 3 fields belong ONLY to ready_recipes, not to base_recipes.
Move them out of `form` state into separate state variables.

### Change 1a: Remove from FormState interface

OLD:
```typescript
interface FormState {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  ingredients_text_bg: string;
  ingredients_text_en: string;
  instructions: string;
  image_url: string;
  servings: number;
  published_at: string | null;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  total_net_carbs: number;
  total_weight_grams: number;
  dessert_type_id: string;
  serving_container_id: number | null;
  difficulty_level: number;
}
```
NEW:
```typescript
interface FormState {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  ingredients_text_bg: string;
  ingredients_text_en: string;
  instructions: string;
  image_url: string;
  servings: number;
  published_at: string | null;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  total_net_carbs: number;
  total_weight_grams: number;
  // NOTE: dessert_type_id, serving_container_id, difficulty_level are NOT in
  // base_recipes — they live in ready_recipes only. Use separate state vars.
}
```

### Change 1b: Remove 3 fields from useState initializer

OLD:
```typescript
    dessert_type_id: initialData?.dessert_type_id ? String(initialData.dessert_type_id) : '',
    serving_container_id: initialData?.serving_container_id || null,
    difficulty_level: initialData?.difficulty_level || 2,
  });
```
NEW:
```typescript
  });
```

### Change 1c: Add separate state vars for ready_recipes fields
Add these lines immediately AFTER the closing `});` of the useState initializer:

```typescript
  // ready_recipes-only fields — NOT sent to base_recipes
  const [dessertTypeId, setDessertTypeId] = useState<string>(
    initialData?.ready_dessert_type_id ? String(initialData.ready_dessert_type_id) : ''
  );
  const [servingContainerId, setServingContainerId] = useState<number | null>(
    initialData?.ready_serving_container_id || null
  );
  const [difficultyLevel, setDifficultyLevel] = useState<number>(
    initialData?.ready_difficulty_level || 2
  );
```

### Change 1d: Update the save() function — add ready_recipes fields separately

OLD:
```typescript
      const payload = {
        ...form,
        is_simple_recipe: true,
        published_at: publish ? new Date().toISOString() : form.published_at,
        ingredients: ingredients.map((ing, i) => ({
          ingredient_database_id: ing.ingredient_database_id,
          ingredient_name: ing.ingredient_name,
          quantity: ing.quantity,
          unit: ing.unit,
          order_index: i,
        })),
        steps: steps.map((s, i) => ({
          step_number: i + 1,
          step_description_bg: s.step_description_bg,
          step_description_en: s.step_description_en,
          step_duration_minutes: s.step_duration_minutes,
          step_image_url: s.step_image_url || null,
        })),
      };
```
NEW:
```typescript
      const payload = {
        ...form,
        is_simple_recipe: true,
        published_at: publish ? new Date().toISOString() : form.published_at,
        // ready_recipes-only fields — API route strips these from base_recipes insert
        dessert_type_id: dessertTypeId || null,
        serving_container_id: servingContainerId,
        difficulty_level: difficultyLevel,
        ingredients: ingredients.map((ing, i) => ({
          ingredient_database_id: ing.ingredient_database_id,
          ingredient_name: ing.ingredient_name,
          quantity: ing.quantity,
          unit: ing.unit,
          order_index: i,
        })),
        steps: steps.map((s, i) => ({
          step_number: i + 1,
          step_description_bg: s.step_description_bg,
          step_description_en: s.step_description_en,
          step_duration_minutes: s.step_duration_minutes,
          step_image_url: s.step_image_url || null,
        })),
      };
```

### Change 1e: Update the 3 dropdowns in Publish tab to use new state vars

OLD:
```tsx
                  <select
                    value={form.dessert_type_id}
                    onChange={e => setForm(p => ({ ...p, dessert_type_id: e.target.value }))}
                    className={inp}
                  >
```
NEW:
```tsx
                  <select
                    value={dessertTypeId}
                    onChange={e => setDessertTypeId(e.target.value)}
                    className={inp}
                  >
```

OLD:
```tsx
                  <select
                    value={form.serving_container_id ?? ''}
                    onChange={e => setForm(p => ({ ...p, serving_container_id: e.target.value ? parseInt(e.target.value) : null }))}
                    className={inp}
                  >
```
NEW:
```tsx
                  <select
                    value={servingContainerId ?? ''}
                    onChange={e => setServingContainerId(e.target.value ? parseInt(e.target.value) : null)}
                    className={inp}
                  >
```

OLD:
```tsx
                  <select
                    value={form.difficulty_level}
                    onChange={e => setForm(p => ({ ...p, difficulty_level: parseInt(e.target.value) }))}
                    className={inp}
                  >
```
NEW:
```tsx
                  <select
                    value={difficultyLevel}
                    onChange={e => setDifficultyLevel(parseInt(e.target.value))}
                    className={inp}
                  >
```

---

## Fix 2: route.ts (POST) — strip ready_recipes fields before base_recipes insert

OLD:
```typescript
export async function POST(req: NextRequest) {
  try {
    const { ingredients, steps, ...body } = await req.json();
    console.log('[Simple Recipes API] POST:', body.name_en || body.name);

    const { data: recipe, error } = await supabase
      .from('base_recipes')
      .insert([{ ...body, is_simple_recipe: true }])
      .select()
      .single();
```
NEW:
```typescript
export async function POST(req: NextRequest) {
  try {
    const { ingredients, steps, dessert_type_id, serving_container_id, difficulty_level, ...body } = await req.json();
    console.log('[Simple Recipes API] POST:', body.name_en || body.name);

    const { data: recipe, error } = await supabase
      .from('base_recipes')
      .insert([{ ...body, is_simple_recipe: true }])
      .select()
      .single();
```

Then update the ready_recipes insert to use the extracted variables:

OLD:
```typescript
        difficulty_level: body.difficulty_level || 2,
        dessert_type_id: body.dessert_type_id ? parseInt(body.dessert_type_id) : null,
        serving_container_id: body.serving_container_id || null,
```
NEW:
```typescript
        difficulty_level: difficulty_level || 2,
        dessert_type_id: dessert_type_id ? parseInt(String(dessert_type_id)) : null,
        serving_container_id: serving_container_id || null,
```
