Виждам — за simple recipes нямаш `dessert_type_id` в заявката. За ready recipes го имаш от `ready_recipes` таблицата. За simple recipes трябва отделна заявка към `ready_recipes` (защото simple recipe се публикува там с `dessert_type_id`).

Сега разбирам цялата картина. Ето заданието:

---

**TASK: Add cookies mode for simple recipes in recipe-detail/[id].tsx and RecipeDetailView**

---

**Fix 1 — `Mobile/app/recipe-detail/[id].tsx`**

Add new query after `simpleLabNotesData` query — find:
```tsx
  // Заявка 7 (optional): assembly_template
```
Add BEFORE it:
```tsx
  // Заявка за simple recipe metadata (dessert_type_id, serving_container)
  const { data: simpleReadyMeta } = useQuery({
    queryKey: ['simpleReadyMeta', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('ready_recipes')
        .select('dessert_type_id, serving_container_id, serving_container_info:equipment(id, name, name_en, serving_container_type)')
        .eq('id', id)
        .maybeSingle();
      return data ?? null;
    },
    enabled: !!id && recipeType === 'simple',
  });

```

In `transformedData` dependencies array, find:
```tsx
  }, [recipe, dessertType, baseRecipes, baseRecipeIds, stepsData, readyRecipeIngredientsData, equipmentData, readyEquipmentData, labNotesData, assemblyTemplate, language, recipeType, simpleRecipe, simpleSteps, simpleLabNotesData, simpleEquipmentData]);
```
Replace with:
```tsx
  }, [recipe, dessertType, baseRecipes, baseRecipeIds, stepsData, readyRecipeIngredientsData, equipmentData, readyEquipmentData, labNotesData, assemblyTemplate, language, recipeType, simpleRecipe, simpleSteps, simpleLabNotesData, simpleEquipmentData, simpleReadyMeta]);
```

In the simple recipe return object, find:
```tsx
        isPortionDessert: false,
        servingContainer: null,
```
Replace with:
```tsx
        isPortionDessert: simpleReadyMeta?.dessert_type_id === 8,
        isCookieRecipe: simpleReadyMeta?.dessert_type_id === 7,
        servingContainer: (simpleReadyMeta as any)?.serving_container_info ?? null,
```

---

**Fix 2 — `Mobile/components/RecipeDetailView.tsx`**

Add to `RecipeDetailViewProps` interface — find:
```tsx
  hasFixedPan?: boolean;
```
Add after:
```tsx
  isCookieRecipe?: boolean;
```

Add to component destructuring — find:
```tsx
  hasFixedPan = true,
  isPortionDessert = false,
```
Add after `isPortionDessert`:
```tsx
  isCookieRecipe = false,
```

Find:
```tsx
  const isPortionMode = isPortionDessert || !!servingContainer;
```
Replace with:
```tsx
  const isPortionMode = isPortionDessert || !!servingContainer;
  const isCookieMode = isCookieRecipe && !isPortionMode;
```

Find the `useEffect` that initializes `selectedServings`:
```tsx
    if (isPortionDessert || !!servingContainer) {
      setSelectedServings(totalServings || 1);
      return;
    }
```
Replace with:
```tsx
    if (isPortionDessert || !!servingContainer || isCookieRecipe) {
      setSelectedServings(totalServings || 1);
      return;
    }
```

Find the stepper section — find:
```tsx
                    {(isPortionDessert || !!servingContainer) ? (
                      <View style={styles.servingsCompactCenter}>
                        <TouchableOpacity
                          onPress={() => setSelectedServings(prev => Math.max(1, prev - 1))}
                          style={[styles.stepperBtn, selectedServings <= 1 && styles.stepperBtnDisabled]}
                          disabled={selectedServings <= 1}
                        >
                          <Text style={styles.stepperBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{selectedServings}</Text>
                        <TouchableOpacity
                          onPress={() => setSelectedServings(prev => prev + 1)}
                          style={styles.stepperBtn}
                        >
                          <Text style={styles.stepperBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
```
Replace with:
```tsx
                    {(isPortionDessert || !!servingContainer) ? (
                      <View style={styles.servingsCompactCenter}>
                        <TouchableOpacity
                          onPress={() => setSelectedServings(prev => Math.max(1, prev - 1))}
                          style={[styles.stepperBtn, selectedServings <= 1 && styles.stepperBtnDisabled]}
                          disabled={selectedServings <= 1}
                        >
                          <Text style={styles.stepperBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{selectedServings}</Text>
                        <TouchableOpacity
                          onPress={() => setSelectedServings(prev => prev + 1)}
                          style={styles.stepperBtn}
                        >
                          <Text style={styles.stepperBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : isCookieMode ? (
                      <View style={styles.servingsCompactCenter}>
                        <TouchableOpacity
                          onPress={() => setSelectedServings(prev => Math.max(5, prev - 5))}
                          style={[styles.stepperBtn, selectedServings <= 5 && styles.stepperBtnDisabled]}
                          disabled={selectedServings <= 5}
                        >
                          <Text style={styles.stepperBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.stepperValue}>{selectedServings}</Text>
                        <TouchableOpacity
                          onPress={() => setSelectedServings(prev => prev + 5)}
                          style={styles.stepperBtn}
                        >
                          <Text style={styles.stepperBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
```

Find the pan info block in Intro tab:
```tsx
              ) : panInfoStr ? (
```
Add BEFORE it:
```tsx
              ) : isCookieMode ? (
                <View style={styles.introInfoCard}>
                  <View style={styles.panAvatarContainer}>
                    <Text style={styles.panAvatarEmoji}>🍪</Text>
                    <Text style={styles.panAvatarSize}>Тава</Text>
                  </View>
                  <View style={styles.introInfoContent}>
                    <Text style={styles.introInfoLabel}>
                      {language === 'bg' ? 'ТАВА ЗА ФУРНА' : 'BAKING TRAY'}
                    </Text>
                    <Text style={styles.introInfoValue}>
                      {selectedServings} {language === 'bg' ? 'бр.' : 'pcs'}
                    </Text>
                  </View>
                </View>
```

**Use `str_replace` only. Do not rewrite files.**

---