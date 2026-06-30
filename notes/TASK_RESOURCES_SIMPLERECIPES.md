# Task: Fix Ready Recipes — Resources + Simple Recipe Auto-load

## Fix 1: Show ALL resources in ready_recipes edit (both 'ready' and 'simple' types)

### File: `Admin/hooks/useRecipeResources.ts`

The hook currently filters by exact `recipe_type`. For ready recipes that are simple recipes,
resources are stored with `recipe_type='simple'` but the edit form passes `recipe_type='ready'`.

Change the hook to accept optional multiple types:

Find:
```typescript
export function useRecipeResources(recipeId: string, recipeType: 'base' | 'ready' | 'simple') {
  const [resources, setResources] = useState<RecipeResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!recipeId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('recipe_resources')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('recipe_type', recipeType)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setResources((data as RecipeResource[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [recipeId, recipeType]);
```

Replace with:
```typescript
export function useRecipeResources(
  recipeId: string,
  recipeType: 'base' | 'ready' | 'simple',
  extraTypes?: Array<'base' | 'ready' | 'simple'>
) {
  const [resources, setResources] = useState<RecipeResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allTypes = [recipeType, ...(extraTypes ?? [])];

  const load = useCallback(async () => {
    if (!recipeId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('recipe_resources')
        .select('*')
        .eq('recipe_id', recipeId)
        .in('recipe_type', allTypes)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setResources((data as RecipeResource[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [recipeId, JSON.stringify(allTypes)]);
```

### File: `Admin/app/dashboard/ready-recipes/[id]/edit/page.tsx`

Find the RecipeResourcesManager at the bottom:
```typescript
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <RecipeResourcesManager recipeId={recipeId} recipeType="ready" />
      </div>
```

Replace with:
```typescript
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <RecipeResourcesManager recipeId={recipeId} recipeType="ready" extraTypes={['simple']} />
      </div>
```

### File: `Admin/components/RecipeResourcesManager.tsx`

Update the Props interface to accept extraTypes:

Find:
```typescript
interface Props {
  recipeId: string;
  recipeType: 'base' | 'ready' | 'simple';
}

export default function RecipeResourcesManager({ recipeId, recipeType }: Props) {
  const { resources, loading, addResource, deleteResource } = useRecipeResources(recipeId, recipeType);
```

Replace with:
```typescript
interface Props {
  recipeId: string;
  recipeType: 'base' | 'ready' | 'simple';
  extraTypes?: Array<'base' | 'ready' | 'simple'>;
}

export default function RecipeResourcesManager({ recipeId, recipeType, extraTypes }: Props) {
  const { resources, loading, addResource, deleteResource } = useRecipeResources(recipeId, recipeType, extraTypes);
```

---

## Fix 2: Simple Recipes section auto-loads existing record from base_recipes

The issue: when opening ready_recipes edit for a simple recipe, the selected_components
already contains `{ role: 'simple', base_recipe_id: '69533fef-...', ... }`.
But `loadBaseRecipes` only runs when `selectedDessertType` changes — and simple recipes
are NOT filtered by dessert type.

### File: `Admin/app/dashboard/ready-recipes/[id]/edit/page.tsx`

The `loadBaseRecipes` function already loads simple recipes in the combined query (from Fix in previous task).
The problem is the Simple Recipes section uses `recipe_role_id === 0` to filter components,
but the existing component from simple-recipes page has `role: 'simple'` (string field), not `recipe_role_id: 0`.

Find in the Simple Recipes section JSX:
```typescript
                  const simpleComponents = components.filter(c => c.recipe_role_id === 0);
```

Replace with:
```typescript
                  const simpleComponents = components.filter(c => c.recipe_role_id === 0 || (c as any).role === 'simple');
```

Also find the addComponent call for Simple Recipes section:
```typescript
                  onClick={() => addComponent(0)}
```

This is correct — role_id 0 for simple.

Also ensure when saving, simple components are saved correctly.
Find in `updateRecipe` function, the `hasInvalidComponents` check:
```typescript
    const hasInvalidComponents = components.some(c => !c.base_recipe_id);
```

This is fine — base_recipe_id must be set for all components including simple.

---

## Fix 3: Load simple recipes even without dessert type filter

The simple recipes section must always show all simple recipes regardless of selected dessert type.
The current `loadBaseRecipes` only runs when `selectedDessertType` is set.

### File: `Admin/app/dashboard/ready-recipes/[id]/edit/page.tsx`

Add a separate load for simple recipes on mount (independent of dessert type).

Find the `loadInitialData` function:
```typescript
  async function loadInitialData() {
    try {
      const [dessertTypesRes, rolesRes] = await Promise.all([
        supabase.from('dessert_types').select('*').order('name'),
        supabase.from('recipe_roles').select('*').order('id')
      ]);

      if (dessertTypesRes.data) setDessertTypes(dessertTypesRes.data);
      if (rolesRes.data) setRecipeRoles(rolesRes.data);
      
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }
```

Replace with:
```typescript
  async function loadInitialData() {
    try {
      const [dessertTypesRes, rolesRes, simpleRes] = await Promise.all([
        supabase.from('dessert_types').select('*').order('name'),
        supabase.from('recipe_roles').select('*').order('id'),
        supabase.from('base_recipes').select('*').eq('is_simple_recipe', true).order('name'),
      ]);

      if (dessertTypesRes.data) setDessertTypes(dessertTypesRes.data);
      if (rolesRes.data) setRecipeRoles(rolesRes.data);
      // Pre-load simple recipes so they're available immediately
      if (simpleRes.data) setBaseRecipes(prev => [
        ...prev.filter(br => !(br as any).is_simple_recipe),
        ...simpleRes.data,
      ]);
      
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }
```

---

## Summary of changes
1. `useRecipeResources.ts` — accepts `extraTypes` array, loads with `.in()` instead of `.eq()`
2. `RecipeResourcesManager.tsx` — passes `extraTypes` to hook
3. `ready-recipes/[id]/edit/page.tsx` — 3 surgical edits:
   - RecipeResourcesManager gets `extraTypes={['simple']}`
   - simpleComponents filter includes `role === 'simple'`
   - loadInitialData pre-loads all simple recipes on mount

## Rules
- Surgical edits only
- Do NOT change how addResource works — new resources still save with the primary recipeType
- Do NOT touch simple-recipes admin pages
