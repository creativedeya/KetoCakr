# Fix: SimpleRecipeForm — Missing fields + ready_recipes sync

## Files to edit
1. `Admin/components/simple-recipes/SimpleRecipeForm.tsx`
2. `Admin/app/api/simple-recipes/route.ts`

---

## PART 1: SimpleRecipeForm.tsx

### Change 1a: Add 3 new fields to FormState interface

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
  dessert_type_id: string;
  serving_container_id: number | null;
  difficulty_level: number;
}
```

---

### Change 1b: Add dessert_types + servingContainers state + fetch

After the existing imports block, add a new interface and state.

OLD:
```typescript
const UNITS = ['g', 'ml', 'tsp', 'tbsp', 'cup', 'piece', 'pkg'];
```
NEW:
```typescript
const UNITS = ['g', 'ml', 'tsp', 'tbsp', 'cup', 'piece', 'pkg'];

interface DessertType {
  id: number;
  name_bg: string | null;
  name_en: string | null;
  name: string | null;
}

interface ServingContainer {
  id: number;
  name: string;
  name_en: string | null;
  serving_container_type: string | null;
}
```

---

### Change 1c: Add 3 fields to useState initializer

OLD:
```typescript
  const [form, setForm] = useState<FormState>({
    name: initialData?.name || '',
    name_en: initialData?.name_en || '',
    description: initialData?.description || '',
    description_en: initialData?.description_en || '',
    ingredients_text_bg: initialData?.ingredients_text_bg || '',
    ingredients_text_en: initialData?.ingredients_text_en || '',
    instructions: initialData?.instructions || '',
    image_url: initialData?.image_url || '',
    servings: initialData?.servings || 1,
    published_at: initialData?.published_at || null,
    total_calories: initialData?.total_calories || 0,
    total_protein: initialData?.total_protein || 0,
    total_fat: initialData?.total_fat || 0,
    total_carbs: initialData?.total_carbs || 0,
    total_net_carbs: initialData?.total_net_carbs || 0,
    total_weight_grams: initialData?.total_weight_grams || 0,
  });
```
NEW:
```typescript
  const [form, setForm] = useState<FormState>({
    name: initialData?.name || '',
    name_en: initialData?.name_en || '',
    description: initialData?.description || '',
    description_en: initialData?.description_en || '',
    ingredients_text_bg: initialData?.ingredients_text_bg || '',
    ingredients_text_en: initialData?.ingredients_text_en || '',
    instructions: initialData?.instructions || '',
    image_url: initialData?.image_url || '',
    servings: initialData?.servings || 1,
    published_at: initialData?.published_at || null,
    total_calories: initialData?.total_calories || 0,
    total_protein: initialData?.total_protein || 0,
    total_fat: initialData?.total_fat || 0,
    total_carbs: initialData?.total_carbs || 0,
    total_net_carbs: initialData?.total_net_carbs || 0,
    total_weight_grams: initialData?.total_weight_grams || 0,
    dessert_type_id: initialData?.dessert_type_id ? String(initialData.dessert_type_id) : '',
    serving_container_id: initialData?.serving_container_id || null,
    difficulty_level: initialData?.difficulty_level || 2,
  });

  const [dessertTypes, setDessertTypes] = useState<DessertType[]>([]);
  const [servingContainers, setServingContainers] = useState<ServingContainer[]>([]);

  useEffect(() => {
    supabase.from('dessert_types').select('id, name_bg, name_en, name').order('name_bg')
      .then(({ data }) => { if (data) setDessertTypes(data); });
    supabase.from('equipment')
      .select('id, name, name_en, serving_container_type')
      .eq('is_serving_container', true)
      .order('name')
      .then(({ data }) => { if (data) setServingContainers(data); });
  }, []);
```

---

### Change 1d: Replace the Publish tab content

OLD:
```tsx
        {/* ─── PUBLISHING ─── */}
        {tab === 'publish' && (
          <div className="space-y-4 max-w-lg">
            <div className={`p-4 rounded-lg border ${form.published_at ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${form.published_at ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="font-medium text-gray-700">
                  {form.published_at ? '🟢 Published' : '⚫ Draft'}
                </span>
              </div>
              {form.published_at && (
                <p className="text-xs text-gray-500">
                  {new Date(form.published_at).toLocaleString('bg-BG')}
                </p>
              )}
            </div>

            {form.total_calories > 0 && (
              <div className="p-4 bg-white border rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3 text-sm">Nutrition Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Calories: <strong>{form.total_calories}</strong></div>
                  <div>Protein: <strong>{form.total_protein}g</strong></div>
                  <div>Fat: <strong>{form.total_fat}g</strong></div>
                  <div>Net Carbs: <strong>{form.total_net_carbs}g</strong></div>
                  <div>Total Weight: <strong>{form.total_weight_grams}g</strong></div>
                  <div>Servings: <strong>{form.servings}</strong></div>
                </div>
                {form.servings > 1 && (
                  <div className="mt-2 pt-2 border-t text-sm text-gray-500">
                    Per serving: <strong>{Math.round(form.total_calories / form.servings)} cal</strong> ·{' '}
                    <strong>{(form.total_net_carbs / form.servings).toFixed(1)}g NC</strong>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-400 space-y-1">
              <p>• Draft → рецептата се вижда само в admin панела</p>
              <p>• Published → показва се на всички потребители</p>
            </div>
          </div>
        )}
```
NEW:
```tsx
        {/* ─── PUBLISHING ─── */}
        {tab === 'publish' && (
          <div className="space-y-4">

            {/* Status indicator */}
            <div className={`p-4 rounded-lg border ${form.published_at ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-3 h-3 rounded-full ${form.published_at ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="font-medium text-gray-700">
                  {form.published_at ? '🟢 Публикувано' : '⚫ Чернова'}
                </span>
              </div>
              {form.published_at && (
                <p className="text-xs text-gray-500">
                  {new Date(form.published_at).toLocaleString('bg-BG')}
                </p>
              )}
            </div>

            {/* Ready_recipes fields */}
            <div className="border border-green-200 rounded-xl p-4 bg-green-50 space-y-3">
              <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">
                📱 Информация за мобилното приложение
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={lbl}>
                    Тип десерт <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.dessert_type_id}
                    onChange={e => setForm(p => ({ ...p, dessert_type_id: e.target.value }))}
                    className={inp}
                  >
                    <option value="">— Избери тип —</option>
                    {dessertTypes.map(type => (
                      <option key={type.id} value={String(type.id)}>
                        {type.name_bg || type.name_en || type.name}
                      </option>
                    ))}
                  </select>
                  {dessertTypes.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">⚠️ Няма типове в dessert_types</p>
                  )}
                </div>
                <div>
                  <label className={lbl}>Посуда за сервиране</label>
                  <select
                    value={form.serving_container_id ?? ''}
                    onChange={e => setForm(p => ({ ...p, serving_container_id: e.target.value ? parseInt(e.target.value) : null }))}
                    className={inp}
                  >
                    <option value="">— Без посуда —</option>
                    {servingContainers.map(sc => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}{sc.name_en ? ` / ${sc.name_en}` : ''}{sc.serving_container_type ? ` [${sc.serving_container_type}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Ниво на трудност</label>
                  <select
                    value={form.difficulty_level}
                    onChange={e => setForm(p => ({ ...p, difficulty_level: parseInt(e.target.value) }))}
                    className={inp}
                  >
                    <option value="1">1 — Много лесно</option>
                    <option value="2">2 — Лесно</option>
                    <option value="3">3 — Средно</option>
                    <option value="4">4 — Трудно</option>
                    <option value="5">5 — Много трудно</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Nutrition summary */}
            {form.total_calories > 0 && (
              <div className="p-4 bg-white border rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3 text-sm">Nutrition Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>Calories: <strong>{form.total_calories}</strong></div>
                  <div>Protein: <strong>{form.total_protein}g</strong></div>
                  <div>Fat: <strong>{form.total_fat}g</strong></div>
                  <div>Net Carbs: <strong>{form.total_net_carbs}g</strong></div>
                  <div>Total Weight: <strong>{form.total_weight_grams}g</strong></div>
                  <div>Servings: <strong>{form.servings}</strong></div>
                </div>
                {form.servings > 1 && (
                  <div className="mt-2 pt-2 border-t text-sm text-gray-500">
                    Per serving: <strong>{Math.round(form.total_calories / form.servings)} cal</strong> ·{' '}
                    <strong>{(form.total_net_carbs / form.servings).toFixed(1)}g NC</strong>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-gray-400 space-y-1">
              <p>• Чернова → рецептата се вижда само в admin панела</p>
              <p>• Публикувано → показва се на всички потребители</p>
            </div>
          </div>
        )}
```

---

## PART 2: route.ts — Fix ready_recipes insert + add new fields

### Change 2a: Fix the ready_recipes insert block

OLD:
```typescript
    // Mirror to ready_recipes (best-effort — base_recipes is source of truth)
    const { error: readyError } = await supabase
      .from('ready_recipes')
      .insert({
        id: recipe.id,
        name_bg: body.name,
        name_en: body.name_en || body.name,
        description_bg: body.description || '',
        description_en: body.description_en || '',
        hero_image_url: body.image_url || '',
        is_featured: false,
        is_free: body.is_free ?? false,
        difficulty_level: body.difficulty_level || 2,
        total_servings: body.servings || 1,
        total_weight_grams: body.total_weight_grams || 0,
        total_calories: body.total_calories || 0,
        total_protein: body.total_protein || 0,
        total_fat: body.total_fat || 0,
        total_carbs: body.total_carbs || 0,
        total_net_carbs: body.total_net_carbs || 0,
        published_at: body.published_at || null,
        status: body.published_at ? 'published' : 'draft',
        slug: generateSlug(body.name),
        cost_currency: 'BGN',
        price_currency: 'BGN',
        is_simple_recipe: true,
        selected_components: [{
          base_recipe_id: recipe.id,
          recipe_id: recipe.id,
          role: 'simple',
          order_index: 0,
          multiplier: 1,
        }],
      });
    if (readyError) console.error('[Simple Recipes API] ready_recipes insert failed:', readyError.message);
```
NEW:
```typescript
    // Mirror to ready_recipes (best-effort — base_recipes is source of truth)
    // NOTE: no `id` field — ready_recipes generates its own uuid
    const { error: readyError } = await supabase
      .from('ready_recipes')
      .insert({
        name_en: body.name_en || body.name,        // NOT NULL — fallback to BG name
        name_bg: body.name || null,
        description_en: body.description_en || body.description || null,
        description_bg: body.description || null,
        hero_image_url: body.image_url || null,
        is_featured: false,
        is_free: body.is_free ?? false,
        difficulty_level: body.difficulty_level || 2,
        dessert_type_id: body.dessert_type_id ? parseInt(body.dessert_type_id) : null,
        serving_container_id: body.serving_container_id || null,
        total_servings: body.servings || 1,
        total_weight_grams: body.total_weight_grams || null,
        total_calories: body.total_calories || null,
        total_protein: body.total_protein || null,
        total_fat: body.total_fat || null,
        total_carbs: body.total_carbs || null,
        total_net_carbs: body.total_net_carbs || null,
        published_at: body.published_at || null,
        status: body.published_at ? 'published' : 'draft',
        slug: generateSlug(body.name_en || body.name),
        selected_components: [{
          base_recipe_id: recipe.id,
          recipe_id: recipe.id,
          role: 'simple',
          order_index: 0,
          multiplier: 1,
        }],
      });
    if (readyError) {
      console.error('[Simple Recipes API] ready_recipes insert failed:',
        readyError.message, readyError.details, readyError.hint);
    } else {
      console.log('[Simple Recipes API] ready_recipes mirrored OK for base_recipe:', recipe.id);
    }
```

---

## PART 3: [id]/route.ts — Need file content to write PATCH fix

Paste `Admin/app/api/simple-recipes/[id]/route.ts` to get the PATCH sync fix.
The PATCH handler needs to also sync dessert_type_id, serving_container_id,
difficulty_level, hero_image_url, name changes to ready_recipes.

---

## Verify after fix

Run in Supabase SQL Editor after creating a new simple recipe with all 3 fields set:
```sql
SELECT
  br.name,
  br.is_simple_recipe,
  rr.id as ready_id,
  rr.name_en,
  rr.dessert_type_id,
  rr.serving_container_id,
  rr.difficulty_level,
  rr.status
FROM base_recipes br
LEFT JOIN ready_recipes rr
  ON rr.selected_components @> jsonb_build_array(jsonb_build_object('base_recipe_id', br.id))
WHERE br.is_simple_recipe = true
ORDER BY br.created_at DESC
LIMIT 5;
```
Expected: dessert_type_id, serving_container_id, difficulty_level all populated.
