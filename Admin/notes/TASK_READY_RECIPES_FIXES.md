# Task: Fix Ready Recipes Admin — Status + Simple Recipe Support

## Fix 1: Status always saves as 'draft' for simple recipes

### File: `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

Find `upsertReadyRecipe` function. Inside it find:
```typescript
status: 'draft',
```

Replace with:
```typescript
status: 'published',
```

That's it — simple recipes should always publish as 'published' since the user explicitly clicks "Публикувай".

---

## Fix 2: Ready recipe edit — show simple recipes in components tab

### File: `Admin/app/dashboard/ready-recipes/[id]/edit/page.tsx`

### 2a: Load simple recipes alongside base recipes

Find `loadBaseRecipes` function:
```typescript
async function loadBaseRecipes(dessertTypeId: number) {
    const { data, error } = await supabase
      .from('base_recipes')
      .select('*')
      .contains('compatible_dessert_types', [dessertTypeId])
      .order('recipe_role_id')
      .order('name');

    if (error) console.error('Error loading base recipes:', error);
    if (data) setBaseRecipes(data);
  }
```

Replace with:
```typescript
async function loadBaseRecipes(dessertTypeId: number) {
    // Load both puzzle components AND simple recipes for this dessert type
    const [{ data: puzzleData, error: puzzleError }, { data: simpleData, error: simpleError }] = await Promise.all([
      supabase
        .from('base_recipes')
        .select('*')
        .contains('compatible_dessert_types', [dessertTypeId])
        .eq('is_simple_recipe', false)
        .order('recipe_role_id')
        .order('name'),
      supabase
        .from('base_recipes')
        .select('*')
        .eq('is_simple_recipe', true)
        .order('name'),
    ]);

    if (puzzleError) console.error('Error loading base recipes:', puzzleError);
    if (simpleError) console.error('Error loading simple recipes:', simpleError);

    const combined = [...(puzzleData || []), ...(simpleData || [])];
    setBaseRecipes(combined);
  }
```

### 2b: Add Simple Recipes section in Components tab

Find the Components tab JSX. After the closing `</div>` of the `recipeRoles.map(...)` block (after the last role section), add a new section for simple recipes.

Find this closing pattern in the components tab:
```typescript
              )}
            </div>
          )}
```

The last `</div>` before `)}` closes the components tab div. Before that closing `</div>`, add:

```typescript
              {/* Simple Recipes Section */}
              <div className="mt-6 p-4 border-2 border-rose-200 rounded-lg bg-rose-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-rose-800">
                    ⚡ Simple Recipes
                    <span className="text-sm text-rose-600 ml-2 font-normal">
                      (самостоятелни рецепти)
                    </span>
                  </h3>
                  <button
                    onClick={() => addComponent(0)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                  >
                    <Plus size={16} />
                    Добави
                  </button>
                </div>
                {(() => {
                  const simpleRecipes = baseRecipes.filter(br => (br as any).is_simple_recipe);
                  const simpleComponents = components.filter(c => c.recipe_role_id === 0);
                  return simpleComponents.length === 0 ? (
                    <p className="text-rose-400 text-sm italic">Няма simple рецепти</p>
                  ) : (
                    <div className="space-y-3">
                      {simpleComponents.map((comp) => {
                        const globalIndex = components.indexOf(comp);
                        return (
                          <div key={globalIndex} className="flex gap-3 items-center p-3 bg-white rounded-lg border border-rose-200">
                            <div className="flex-1">
                              <select
                                value={comp.base_recipe_id}
                                onChange={(e) => updateComponent(globalIndex, 'base_recipe_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                              >
                                <option value="">Избери simple рецепта...</option>
                                {simpleRecipes.map(br => (
                                  <option key={br.id} value={br.id}>{br.name}</option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => removeComponent(globalIndex)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
```

---

## Fix 3: Ready recipes list — show simple recipe indicator

### File: `Admin/app/dashboard/ready-recipes/page.tsx`

This is informational only — add a visual indicator when a recipe is a simple recipe.
The `ready_recipes` table has `selected_components` jsonb field. Simple recipes have `role: 'simple'` in their component.

Find the recipe name cell in the table:
```typescript
                        <div>
                          <p className="font-medium">{recipe.name_en}</p>
                          {recipe.name_bg && (
                            <p className="text-sm text-gray-500">{recipe.name_bg}</p>
                          )}
```

Replace with:
```typescript
                        <div>
                          <p className="font-medium">{recipe.name_en}</p>
                          {recipe.name_bg && (
                            <p className="text-sm text-gray-500">{recipe.name_bg}</p>
                          )}
                          {(recipe as any).selected_components?.some((c: any) => c.role === 'simple') && (
                            <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-medium">
                              ⚡ Simple
                            </span>
                          )}
```

Also update the ReadyRecipe type at the top to include selected_components:
Find:
```typescript
  source_url?: string;
};
```
Replace with:
```typescript
  source_url?: string;
  selected_components?: any[];
};
```

---

## Notes
- Fix 1 is the most important — status must be 'published' when user clicks publish
- Fix 2 allows editing simple recipes through ready_recipes edit form
- Fix 3 is cosmetic only
- Do NOT rewrite entire files — surgical edits only
