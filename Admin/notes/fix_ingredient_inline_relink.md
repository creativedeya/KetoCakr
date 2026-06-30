# Fix: Inline autocomplete for unmatched ingredients after Bulk Parse

## Overview
After Bulk Parse, unmatched ingredients (those with ⚠️ "не е свързана")
should show an IngredientAutocomplete input instead of static text,
so the user can search and link them to ingredients_database.

Matched ingredients stay as static text (no need to re-link).

---

## File to edit
`Admin/components/simple-recipes/SimpleRecipeForm.tsx`

---

## Change 1: Add editingIngredient state

Find existing state declarations. After:
```typescript
  const [ingredientsMode, setIngredientsMode] = useState<'manual' | 'bulk'>('manual');
```
Add:
```typescript
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  const [editIngredientSearch, setEditIngredientSearch] = useState('');
```

---

## Change 2: Replace the ingredient list render in manual mode

Find this section inside `{ingredientsMode === 'manual' && (`:

OLD:
```tsx
                  <div className="space-y-2">
                    {ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <span className={`flex-1 text-sm font-medium truncate ${
                          ing.ingredient_database_id ? 'text-gray-700' : 'text-amber-600'
                        }`}>
                          {ing.ingredient_name}
                          {!ing.ingredient_database_id && (
                            <span className="ml-1 text-xs">⚠️ не е свързана</span>
                          )}
                        </span>
                        <input
                          type="number" min={0} step={0.1} value={ing.quantity}
                          onChange={e => updateIngredient(i, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <select value={ing.unit}
                          onChange={e => updateIngredient(i, 'unit', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm">
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <span className="text-xs text-gray-400 w-16 text-right">
                          {ing._calories && ing.unit === 'g' ? `${Math.round(ing._calories * ing.quantity / 100)} cal` : ''}
                        </span>
                        <button type="button"
                          onClick={() => setIngredients(prev => prev.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 px-1 text-lg leading-none">×</button>
                      </div>
                    ))}
                  </div>
```
NEW:
```tsx
                  <div className="space-y-2">
                    {ingredients.map((ing, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        {/* Name — autocomplete if unmatched and editing, else static */}
                        {editingIngredientIndex === i ? (
                          <div className="flex-1">
                            <IngredientAutocomplete
                              value={editIngredientSearch}
                              onChange={setEditIngredientSearch}
                              onSelect={async (selected) => {
                                // Fetch nutrition data for selected ingredient
                                const { data } = await supabase
                                  .from('ingredients_database')
                                  .select('calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, is_sugar_alcohol, default_piece_weight_grams')
                                  .eq('id', selected.id)
                                  .single();
                                // Update ingredient row with new match
                                setIngredients(prev => {
                                  const updated = [...prev];
                                  updated[i] = {
                                    ...updated[i],
                                    ingredient_database_id: selected.id,
                                    ingredient_name: selected.name_bg,
                                    _calories: data?.calories_per_100g,
                                    _protein: data?.protein_per_100g,
                                    _fat: data?.fat_per_100g,
                                    _carbs: data?.carbs_per_100g,
                                    _fiber: data?.fiber_per_100g,
                                    _is_sugar_alcohol: data?.is_sugar_alcohol || false,
                                    _piece_weight: data?.default_piece_weight_grams || null,
                                  };
                                  return updated;
                                });
                                setEditingIngredientIndex(null);
                                setEditIngredientSearch('');
                              }}
                              placeholder={ing.ingredient_name}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => { setEditingIngredientIndex(null); setEditIngredientSearch(''); }}
                              className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                            >
                              Откажи
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            <span className={`text-sm font-medium truncate ${
                              ing.ingredient_database_id ? 'text-gray-700' : 'text-amber-600'
                            }`}>
                              {ing.ingredient_name}
                            </span>
                            {!ing.ingredient_database_id ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingIngredientIndex(i);
                                  setEditIngredientSearch(ing.ingredient_name);
                                }}
                                className="shrink-0 text-xs text-amber-600 hover:text-amber-800 border border-amber-300 hover:border-amber-500 rounded px-2 py-0.5 transition whitespace-nowrap"
                              >
                                ⚠️ Свържи
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingIngredientIndex(i);
                                  setEditIngredientSearch(ing.ingredient_name);
                                }}
                                className="shrink-0 text-xs text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition"
                              >
                                ✏️
                              </button>
                            )}
                          </div>
                        )}

                        {/* Quantity */}
                        <input
                          type="number" min={0} step={0.1} value={ing.quantity}
                          onChange={e => updateIngredient(i, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />

                        {/* Unit */}
                        <select value={ing.unit}
                          onChange={e => updateIngredient(i, 'unit', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm">
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>

                        {/* Calories hint or piece weight hint */}
                        <span className="text-xs text-gray-400 w-20 text-right shrink-0">
                          {ing.unit === 'бр' && ing._piece_weight
                            ? `= ${Math.round(ing.quantity * ing._piece_weight)}г`
                            : ing.unit === 'бр' && !ing._piece_weight
                            ? <span className="text-amber-400">няма тегло</span>
                            : ing._calories && (ing.unit === 'g' || ing.unit === 'г')
                            ? `${Math.round(ing._calories * ing.quantity / 100)} cal`
                            : ''
                          }
                        </span>

                        {/* Delete */}
                        <button type="button"
                          onClick={() => {
                            setIngredients(prev => prev.filter((_, j) => j !== i));
                            if (editingIngredientIndex === i) setEditingIngredientIndex(null);
                          }}
                          className="text-red-400 hover:text-red-600 px-1 text-lg leading-none shrink-0">×</button>
                      </div>
                    ))}
                  </div>
```

---

## Behavior after fix

**Unmatched ingredient (⚠️ Свържи button):**
1. User clicks "⚠️ Свържи" on "Еритритол на гранули"
2. IngredientAutocomplete opens with current name pre-filled
3. User types "Еритритол" → sees "Еритритол", "Еритритол на пудра", "Еритритол или Алулоза"
4. User selects → row updates: name changes, nutrition loads, ⚠️ disappears

**Matched ingredient (already linked):**
- Shows static text, no button visible
- (Optional: small ✏️ on hover to re-link if needed)

**No change to:**
- Quantity/unit inputs — work the same
- Delete button — works the same
- Bulk Parse flow — still parses then shows the list
- Manual add via IngredientAutocomplete at top — unchanged
