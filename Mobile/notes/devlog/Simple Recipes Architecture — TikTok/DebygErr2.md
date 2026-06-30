# REVISED ARCHITECTURE: Serving Containers from Equipment Table

## Overview
Instead of creating new `serving_containers` table, we'll use existing `equipment` table.

**Status:** Architecture Revision
**Complexity:** Low
**Duration:** 1.5-2 hours

---

## Step 1: Add Columns to Equipment Table

```sql
-- Add columns to mark serving containers
ALTER TABLE equipment ADD COLUMN (
  is_serving_container BOOLEAN DEFAULT false,
  serving_container_type VARCHAR(50)  -- 'pan', 'glass', 'cup', 'bowl', 'plate', etc
);

-- Create index for faster queries
CREATE INDEX idx_equipment_serving_container 
ON equipment(is_serving_container, serving_container_type);
```

---

## Step 2: Mark Existing Serving Containers

**Option A: If you already have equipment records for serving vessels**

```sql
-- Mark cake pans
UPDATE equipment
SET 
  is_serving_container = true,
  serving_container_type = 'pan'
WHERE 
  name ILIKE '%cake pan%' 
  OR name_bg ILIKE '%форма за торта%'
  OR name_bg ILIKE '%форма%';

-- Mark glasses
UPDATE equipment
SET 
  is_serving_container = true,
  serving_container_type = 'glass'
WHERE 
  name ILIKE '%glass%' 
  OR name_bg ILIKE '%чаша%'
  OR name_bg ILIKE '%стъкл%';

-- Mark cups
UPDATE equipment
SET 
  is_serving_container = true,
  serving_container_type = 'cup'
WHERE 
  name ILIKE '%cup%' 
  OR name_bg ILIKE '%чаша%'
  OR name_bg ILIKE '%чашка%';

-- Mark bowls
UPDATE equipment
SET 
  is_serving_container = true,
  serving_container_type = 'bowl'
WHERE 
  name ILIKE '%bowl%' 
  OR name_bg ILIKE '%купа%';
```

**Option B: Insert new serving container records**

```sql
-- If serving containers don't exist yet
INSERT INTO equipment (name, name_bg, category, category_bg, is_serving_container, serving_container_type)
VALUES
('18cm cake pan', '18см форма за торта', 'serving container', 'съд за сервиране', true, 'pan'),
('16cm cake pan', '16см форма за торта', 'serving container', 'съд за сервиране', true, 'pan'),
('20cm cake pan', '20см форма за торта', 'serving container', 'съд за сервиране', true, 'pan'),
('22cm cake pan', '22см форма за торта', 'serving container', 'съд за сервиране', true, 'pan'),
('wine glass', 'винна чаша', 'serving container', 'съд за сервиране', true, 'glass'),
('small cup', 'малка чаша', 'serving container', 'съд за сервиране', true, 'cup'),
('large cup', 'голяма чаша', 'serving container', 'съд за сервиране', true, 'cup'),
('small bowl', 'малка купа', 'serving container', 'съд за сервиране', true, 'bowl'),
('large bowl', 'голяма купа', 'serving container', 'съд за сервиране', true, 'bowl'),
('ramekin', 'рамекин', 'serving container', 'съд за сервиране', true, 'glass'),
('serving plate', 'сервирна чиния', 'serving container', 'съд за сервиране', true, 'plate');
```

---

## Step 3: Update ready_recipes Table

```sql
-- Change serving_container_id to reference equipment instead of serving_containers
ALTER TABLE ready_recipes
ADD COLUMN serving_container_id INTEGER 
REFERENCES equipment(id) ON DELETE SET NULL;

-- Drop old serving_container TEXT column if it exists
-- ALTER TABLE ready_recipes DROP COLUMN serving_container;
```

---

## Step 4: Update Barry Pana Cotta Record

```sql
-- Find glass equipment ID
SELECT id, name, name_bg FROM equipment 
WHERE is_serving_container = true 
AND serving_container_type = 'glass' 
LIMIT 1;
-- Result: id = X

-- Update Barry Pana Cotta
UPDATE ready_recipes
SET serving_container_id = X  -- Replace X with actual ID
WHERE id = '96325c6c-398d-45c8-912f-4ae728567347';

-- Verify
SELECT 
  rr.name_en,
  e.name as serving_container,
  e.serving_container_type
FROM ready_recipes rr
LEFT JOIN equipment e ON rr.serving_container_id = e.id
WHERE rr.id = '96325c6c-398d-45c8-912f-4ae728567347';
```

---

## Step 5: Update Mobile Query

**File:** `Mobile/app/recipe-detail/[id].tsx`

**Old query (BROKEN):**
```typescript
.select(`
  *,
  dessert_type:dessert_types(id, name_en, name_bg),
  serving_container:serving_containers(id, name, name_bg, unit_type)
`)
```

**New query (CORRECT):**
```typescript
.select(`
  *,
  dessert_type:dessert_types(id, name_en, name_bg),
  serving_container:equipment(id, name, name_bg, serving_container_type)
`)
```

---

## Step 6: Update Mobile Component

**File:** `Mobile/components/ServingDisplay.tsx`

**Change property name:**
```typescript
// OLD
const container = recipe.serving_container;
const unitType = container.unit_type;

// NEW
const container = recipe.serving_container;
const unitType = container.serving_container_type;
```

---

## Step 7: Update Admin Panel

**File:** `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

**Load serving containers from equipment:**

```typescript
// ✅ NEW: Load serving containers from equipment table
const [servingContainers, setServingContainers] = useState<any[]>([]);
const [selectedServingContainerId, setSelectedServingContainerId] = useState<number | null>(null);

useEffect(() => {
  const loadServingContainers = async () => {
    const { data } = await supabase
      .from('equipment')
      .select('id, name, name_bg, serving_container_type')
      .eq('is_serving_container', true)
      .order('serving_container_type, name');
    
    setServingContainers(data || []);
    console.log('[Serving Containers] Loaded:', data?.length, 'options');
  };
  
  loadServingContainers();
}, []);

// When loading existing recipe
useEffect(() => {
  if (recipe && recipe.serving_container_id) {
    setSelectedServingContainerId(recipe.serving_container_id);
  }
}, [recipe]);

// In form JSX: Group by serving_container_type
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Serving Container (Начин на сервиране) *
  </label>
  
  <select
    value={selectedServingContainerId || ''}
    onChange={(e) => setSelectedServingContainerId(parseInt(e.target.value))}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  >
    <option value="">-- Select how this is served --</option>
    
    {/* Pans */}
    <optgroup label="Cake Pans">
      {servingContainers
        .filter(sc => sc.serving_container_type === 'pan')
        .map(sc => (
          <option key={sc.id} value={sc.id}>
            {sc.name} / {sc.name_bg}
          </option>
        ))
      }
    </optgroup>
    
    {/* Glasses & Cups */}
    <optgroup label="Glasses & Cups">
      {servingContainers
        .filter(sc => ['glass', 'cup', 'ramekin'].includes(sc.serving_container_type))
        .map(sc => (
          <option key={sc.id} value={sc.id}>
            {sc.name} / {sc.name_bg}
          </option>
        ))
      }
    </optgroup>
    
    {/* Bowls & Plates */}
    <optgroup label="Bowls & Plates">
      {servingContainers
        .filter(sc => ['bowl', 'plate'].includes(sc.serving_container_type))
        .map(sc => (
          <option key={sc.id} value={sc.id}>
            {sc.name} / {sc.name_bg}
          </option>
        ))
      }
    </optgroup>
  </select>
  
  {!selectedServingContainerId && (
    <p className="text-red-500 text-sm mt-1">⚠️ Required field</p>
  )}
</div>
```

---

## Step 8: Update upsertReadyRecipe

**File:** `Admin/app/dashboard/simple-recipes/[id]/page.tsx`

```typescript
const readyRecipePayload = {
  id: recipeId,
  name_en: recipe?.name_en || '',
  name_bg: recipe?.name_bg || '',
  dessert_type_id: selectedDessertTypeId,
  serving_container_id: selectedServingContainerId,  // ✅ From equipment
  // ... other fields ...
};
```

---

## Benefits of This Approach

✅ **No new tables** - reuse existing equipment table
✅ **Equipment management unified** - admin can edit serving containers with other equipment
✅ **Can add image** - equipment has image_url column!
✅ **Future-proof** - can add more attributes to equipment later
✅ **Cleaner architecture** - single source of truth for all equipment/containers
✅ **Already categorized** - equipment has category field for grouping

---

## Implementation Checklist

Database:
- [ ] Add is_serving_container BOOLEAN to equipment
- [ ] Add serving_container_type VARCHAR to equipment
- [ ] Mark existing serving containers OR insert new ones
- [ ] Add serving_container_id FK to ready_recipes
- [ ] Update Barry Pana Cotta record

Mobile:
- [ ] Update recipe query (join to equipment instead of serving_containers)
- [ ] Update ServingDisplay component (use serving_container_type instead of unit_type)

Admin:
- [ ] Load serving containers from equipment WHERE is_serving_container=true
- [ ] Group dropdown by serving_container_type
- [ ] Save serving_container_id to ready_recipes

---

## Verification

**After implementation:**

```sql
-- Check equipment table
SELECT id, name, name_bg, is_serving_container, serving_container_type
FROM equipment
WHERE is_serving_container = true
ORDER BY serving_container_type;

-- Check ready_recipes joined
SELECT 
  rr.name_en,
  rr.total_servings,
  e.name as serving_container,
  e.serving_container_type
FROM ready_recipes rr
LEFT JOIN equipment e ON rr.serving_container_id = e.id
WHERE rr.id = '96325c6c-398d-45c8-912f-4ae728567347';
```

Should show:
```
name_en: "Barry pana cotta"
total_servings: 3
serving_container: "wine glass"
serving_container_type: "glass"
```

---

## Mobile Test

```
Open recipe detail
Logs should show:
[Recipe Detail] ✅ ready_recipes loaded
[RecipeDetailView] serving_container: {id: X, name: "wine glass", serving_container_type: "glass"}
[ServingDisplay] ✅ Portion case executed
```

---

Much cleaner! Ready? 🚀