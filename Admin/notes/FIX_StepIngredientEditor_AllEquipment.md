# Fix: StepIngredientEditor — Load All Equipment (Not Just Recipe Equipment)

**File:** `admin/app/dashboard/base-recipes/[id]/StepIngredientEditor.tsx`  
**Time:** 5 min — change 1 query

---

## Problem

Equipment loads only from `recipe_equipment` (items linked to THIS recipe):
```typescript
supabase
  .from('recipe_equipment')
  .select('equipment_id, equipment:equipment(id, name, name_en, icon)')
  .eq('recipe_id', recipeId)
```
Result: only 6-7 items shown.

---

## Fix

In `loadOptions()`, replace the equipment query:

```typescript
// BEFORE — only recipe-specific equipment:
supabase
  .from('recipe_equipment')
  .select('equipment_id, equipment:equipment(id, name, name_en, icon)')
  .eq('recipe_id', recipeId),
```

```typescript
// AFTER — all equipment, sorted by name:
supabase
  .from('equipment')
  .select('id, name, name_en, icon')
  .order('name'),
```

Also update the result handling — the shape changes from nested to flat:

Find:
```typescript
if (eqsResult.data) {
  const uniqueEq = (eqsResult.data as any[])
    .map(row => row.equipment)
    .filter((eq): eq is EquipmentOption => !!eq && eq.id != null);
  setAllEquipment(uniqueEq);
}
```

Replace with:
```typescript
if (eqsResult.data) {
  setAllEquipment(eqsResult.data as EquipmentOption[]);
}
```

---

## Rules
- Only change the equipment query and its result handler
- Do NOT touch ingredients query
- Do NOT change save logic

---

## Verification
1. Admin → base recipe → any step → expand
2. Equipment list shows ALL items from equipment table (not just 6-7)
3. Search/scroll through full list
4. Select items → Запази стъпката → saved correctly
