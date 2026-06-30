# GLOBAL ARCHITECTURAL FIX: Dynamic Serving Container Selection

## Current Problem

**Hardcoded logic:**
```
ALL recipes assume:
├─ 18cm pan
├─ 8 servings
└─ Cakes only
```

**What we need:**
```
Admin CHOOSES serving container:
├─ "18cm cake pan" → 8 slices (cakes, tarts)
├─ "16cm cake pan" → 6 slices
├─ "22cm cake pan" → 10 slices
├─ "glass" → 3 glasses (mousse, pana cotta)
├─ "small cup" → 4 cups
├─ "large bowl" → 2 bowls
└─ Custom options
```

---

## Solution: Create serving_containers Table

### Step 1: Create serving_containers Reference Table

```sql
CREATE TABLE public.serving_containers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_bg VARCHAR(100),
  description TEXT,
  unit_type VARCHAR(50),  -- 'pan', 'glass', 'cup', 'bowl', 'plate', 'custom'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert standard options
INSERT INTO serving_containers (name, name_bg, unit_type, description) VALUES
('18cm cake pan', '18см форма за торта', 'pan', '18cm diameter cake pan - 8 servings'),
('16cm cake pan', '16см форма за торта', 'pan', '16cm diameter cake pan - 6 servings'),
('20cm cake pan', '20см форма за торта', 'pan', '20cm diameter cake pan - 10 servings'),
('22cm cake pan', '22см форма за торта', 'pan', '22cm diameter cake pan - 12 servings'),
('glass', 'стъклена чаша', 'glass', 'Standard wine glass'),
('small cup', 'малка чаша', 'cup', 'Small serving cup'),
('large cup', 'голяма чаша', 'cup', 'Large serving cup'),
('small bowl', 'малка купа', 'bowl', 'Small bowl'),
('large bowl', 'голяма купа', 'bowl', 'Large serving bowl'),
('plate', 'чиния', 'plate', 'Individual serving plate'),
('ramekin', 'рамекин', 'glass', 'Small ramekin dish'),
('jar', 'буркан', 'glass', 'Mason jar or similar');
```

---

## Step 2: Add serving_container_id to ready_recipes

```sql
-- Add FK to serving_containers
ALTER TABLE ready_recipes 
ADD COLUMN serving_container_id INTEGER 
REFERENCES serving_containers(id) ON DELETE SET NULL;

-- Remove old serving_container text column (if it exists)
-- ALTER TABLE ready_recipes DROP COLUMN serving_container;
```

---

## Step 3: Update ready_recipes Query Structure

**For mobile/admin queries:**

```sql
SELECT 
  rr.*,
  sc.id as serving_container_id,
  sc.name as serving_container_name,
  sc.name_bg as serving_container_name_bg,
  sc.unit_type
FROM ready_recipes rr
LEFT JOIN serving_containers sc ON rr.serving_container_id = sc.id
WHERE rr.id = ?;
```

---

## Admin Panel Changes

### In simple-recipes/[id]/page.tsx

**Replace old serving_container TEXT input with dropdown:**

```typescript
// ✅ NEW: Load serving containers
const [servingContainers, setServingContainers] = useState<any[]>([]);
const [selectedServingContainerId, setSelectedServingContainerId] = useState<number | null>(null);

useEffect(() => {
  const loadContainers = async () => {
    const { data } = await supabase
      .from('serving_containers')
      .select('id, name, name_bg, unit_type')
      .eq('is_active', true)
      .order('unit_type, name');
    
    setServingContainers(data || []);
    console.log('[Serving Containers] Loaded:', data?.length, 'options');
  };
  
  loadContainers();
}, []);

// When loading existing recipe
useEffect(() => {
  if (recipe && recipe.serving_container_id) {
    setSelectedServingContainerId(recipe.serving_container_id);
  }
}, [recipe]);

// In form JSX:
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Serving Container (Начин на сервиране) *
  </label>
  
  {/* Group by unit_type for better UX */}
  <select
    value={selectedServingContainerId || ''}
    onChange={(e) => setSelectedServingContainerId(parseInt(e.target.value))}
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  >
    <option value="">-- Select how this is served --</option>
    
    {/* Pans */}
    <optgroup label="Cake Pans">
      {servingContainers
        .filter(sc => sc.unit_type === 'pan')
        .map(sc => (
          <option key={sc.id} value={sc.id}>
            {sc.name} / {sc.name_bg}
          </option>
        ))
      }
    </optgroup>
    
    {/* Glasses */}
    <optgroup label="Glasses & Cups">
      {servingContainers
        .filter(sc => ['glass', 'cup', 'ramekin'].includes(sc.unit_type))
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
        .filter(sc => ['bowl', 'plate'].includes(sc.unit_type))
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

## Update upsertReadyRecipe

**Include serving_container_id:**

```typescript
const readyRecipePayload = {
  id: recipeId,
  name_en: recipe?.name_en || '',
  name_bg: recipe?.name_bg || '',
  dessert_type_id: selectedDessertTypeId,
  serving_container_id: selectedServingContainerId,  // ✅ NEW
  // ... other fields
};
```

---

## Mobile App Changes

### Update recipe-detail/[id].tsx Query

**Include serving_container details:**

```typescript
const { data: recipe } = useQuery({
  queryKey: ['recipe', id],
  queryFn: async () => {
    const { data } = await supabase
      .from('ready_recipes')
      .select(`
        *,
        dessert_type:dessert_types(id, name_en, name_bg),
        serving_container:serving_containers(id, name, name_bg, unit_type)
      `)
      .eq('id', id)
      .single();
    
    return data;
  }
});
```

---

### Mobile - Conditional Display Based on serving_container Type

**Update ServingDisplay.tsx:**

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/Theme';

interface ServingDisplayProps {
  recipe: any;
  language?: 'en' | 'bg';
}

export default function ServingDisplay({ recipe, language = 'en' }: ServingDisplayProps) {
  const container = recipe.serving_container;
  
  if (!container) return null;

  // Get display name
  const containerName = language === 'bg' ? container.name_bg : container.name;

  // Different display logic per unit type
  switch (container.unit_type) {
    case 'pan':
      // For pans: show servings + container
      return (
        <View style={{ marginVertical: Spacing.md }}>
          <Text style={{
            fontSize: Typography.body.fontSize,
            fontWeight: '600',
            color: Colors.text.primary,
            textAlign: 'center'
          }}>
            {recipe.total_servings} slices
          </Text>
          <Text style={{
            fontSize: Typography.caption.fontSize,
            color: Colors.text.secondary,
            textAlign: 'center',
            marginTop: Spacing.xs
          }}>
            from {containerName}
          </Text>
        </View>
      );

    case 'glass':
    case 'cup':
    case 'bowl':
    case 'ramekin':
      // For portions: show count + container
      return (
        <View style={{ marginVertical: Spacing.md }}>
          <Text style={{
            fontSize: Typography.body.fontSize,
            fontWeight: '600',
            color: Colors.text.primary,
            textAlign: 'center'
          }}>
            {recipe.total_servings} {containerName}
          </Text>
          <Text style={{
            fontSize: Typography.caption.fontSize,
            color: Colors.text.secondary,
            textAlign: 'center',
            marginTop: Spacing.xs
          }}>
            Per {containerName}: ~{Math.round(recipe.total_calories / recipe.total_servings)} cal
          </Text>
        </View>
      );

    case 'plate':
      // For plated: show servings
      return (
        <View style={{ marginVertical: Spacing.md }}>
          <Text style={{
            fontSize: Typography.body.fontSize,
            fontWeight: '600',
            color: Colors.text.primary,
            textAlign: 'center'
          }}>
            {recipe.total_servings} plates
          </Text>
          <Text style={{
            fontSize: Typography.caption.fontSize,
            color: Colors.text.secondary,
            textAlign: 'center',
            marginTop: Spacing.xs
          }}>
            Per plate: ~{Math.round(recipe.total_calories / recipe.total_servings)} cal
          </Text>
        </View>
      );

    default:
      return (
        <Text style={{ textAlign: 'center', color: Colors.text.secondary }}>
          {recipe.total_servings} {containerName}
        </Text>
      );
  }
}
```

---

## Benefits of This Approach

✅ **Flexible:** Admin can choose any serving container
✅ **Maintainable:** Centralized list (easy to add new types)
✅ **Scalable:** Handles any dessert type (cakes, portions, plated, etc)
✅ **Mobile-friendly:** Different display per container type
✅ **Bilingual:** Each container has BG + EN names
✅ **Future-proof:** Can add attributes to containers later (size, ml volume, etc)

---

## Data Migration

**For existing recipes (if migrating from old pan column):**

```sql
-- Map old hardcoded values to new serving_containers
UPDATE ready_recipes rr
SET serving_container_id = (
  SELECT id FROM serving_containers 
  WHERE name = '18cm cake pan'
  LIMIT 1
)
WHERE serving_container_id IS NULL
  AND dessert_type_id IN (1, 2, 4);  -- Cakes, cheesecakes, tarts
```

---

## Implementation Checklist

Database:
- [ ] Create serving_containers table
- [ ] Insert standard options
- [ ] Add serving_container_id FK to ready_recipes
- [ ] Migrate existing data

Admin Panel:
- [ ] Load serving_containers in dropdown
- [ ] Group by unit_type
- [ ] Save serving_container_id

Mobile:
- [ ] Update recipe query to include serving_container
- [ ] Update ServingDisplay component
- [ ] Handle different unit_type displays

---

## Result

**Before (hardcoded):**
```
All recipes → "18cm pan, 8 servings"
```

**After (flexible):**
```
Cake → "18cm cake pan, 8 slices"
Mousse → "glass, 3 glasses"
Cheesecake → "18cm pan, 8 slices"
Plated dessert → "plate, 2 plates"
Portion cups → "small cup, 4 cups"
```

---

Much better! Ready? 🚀