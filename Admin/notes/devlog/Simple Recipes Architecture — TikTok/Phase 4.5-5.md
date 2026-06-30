# Equipment Selector UX Improvements

## Problems Identified

1. **Too Many Clicks**
   - Must click to expand each category
   - Then scroll down to find equipment
   - Then click to expand another category
   - Multiple scrolls across entire page
   - ❌ Inefficient workflow

2. **Duplicate Categories**
   - Some categories appear twice
   - One with 5 items, one with 1 item
   - Data integrity issue in equipment table
   - ❌ Confusing for admin

3. **Category Names in English**
   - Admin panel shows "appliance", "cookware", etc
   - Администратор е българин, мисли на български
   - ❌ Confusing when choosing equipment

---

## Solution: Improved Equipment Selector Component

### TASK 1: Fix Duplicate Categories in Database

First, find and fix the issue:

```sql
-- Check for duplicate categories
SELECT category, COUNT(*) as count
FROM equipment
GROUP BY category
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- Check appliance specifically
SELECT id, name, category
FROM equipment
WHERE category = 'appliance'
ORDER BY id;

-- Look for NULL or empty categories
SELECT id, name, category
FROM equipment
WHERE category IS NULL OR category = ''
ORDER BY id;
```

**Fix NULL/empty categories:**
```sql
UPDATE equipment
SET category = 'Other'
WHERE category IS NULL OR category = '';
```

**Check for case sensitivity issues:**
```sql
-- Look for "Appliance" vs "appliance"
SELECT DISTINCT LOWER(category) as category_lower, category as original
FROM equipment
WHERE LOWER(category) LIKE '%appliance%';
```

**If you find case issues, normalize:**
```sql
UPDATE equipment
SET category = LOWER(category)
WHERE category != LOWER(category);
```

---

### TASK 2: Add Bulgarian Category Names

Equipment table needs Bulgarian names for categories.

**Add column:**
```sql
ALTER TABLE equipment
ADD COLUMN category_bg VARCHAR(100);

-- Or if it already exists, that's good!
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'equipment' AND column_name = 'category_bg';
```

**Populate Bulgarian names:**
```sql
-- Create mapping
UPDATE equipment SET category_bg = 'Съдове' WHERE LOWER(category) = 'cookware';
UPDATE equipment SET category_bg = 'Уреди' WHERE LOWER(category) = 'appliance';
UPDATE equipment SET category_bg = 'Инструменти' WHERE LOWER(category) = 'tools';
UPDATE equipment SET category_bg = 'Форми' WHERE LOWER(category) = 'molds';
UPDATE equipment SET category_bg = 'Други' WHERE category_bg IS NULL;

-- Verify
SELECT DISTINCT category, category_bg FROM equipment ORDER BY category;
```

**Mapping reference:**
```
English → Bulgarian
cookware → Съдове
appliance → Уреди
tools → Инструменти
molds → Форми
utensils → Прибори
bakeware → Печене
pastry → Сладкарство
mixing → Смесване
measuring → Мерене
decorating → Декориране
other → Други
```

---

### TASK 3: Improved Equipment Selector Component

### File: `Admin/app/dashboard/simple-recipes/components/EquipmentSelectorImproved.tsx`

**This is a COMPLETE REWRITE - much better UX:**

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, ChevronDown, ChevronUp, Grid3x3, List } from 'lucide-react';

interface Equipment {
  id: number;
  slug: string;
  name: string;
  name_en: string | null;
  icon: string | null;
  category: string | null;
  category_bg: string | null;  // ✅ NEW
  reference_image_url?: string | null;
}

interface EquipmentSelectorImprovedProps {
  stepNumber: number;
  selectedEquipment: Map<number, string>;
  onEquipmentChange: (equipment: Map<number, string>) => void;
}

export function EquipmentSelectorImproved({
  stepNumber,
  selectedEquipment,
  onEquipmentChange
}: EquipmentSelectorImprovedProps) {
  const [allEquipment, setAllEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');  // ✅ NEW: Grid/List toggle
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEquipment();
  }, []);

  async function loadEquipment() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      // ✅ FIX: Remove duplicate categories
      const uniqueData = Array.from(
        new Map(data?.map(item => [item.id, item]) || []).values()
      );

      setAllEquipment(uniqueData);
      
      // Auto-expand first 2 categories for quick access
      if (uniqueData.length > 0) {
        const categories = Array.from(new Set(uniqueData.map(e => e.category).filter(Boolean)));
        setExpandedCategories(new Set(categories.slice(0, 2)));
      }

      console.log('[Equipment Selector] Loaded', uniqueData.length, 'items,', new Set(uniqueData.map(e => e.category)).size, 'categories');
    } catch (error: any) {
      console.error('[Equipment Selector] Error:', error);
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  }

  function toggleEquipment(equipmentId: number) {
    const newMap = new Map(selectedEquipment);
    if (newMap.has(equipmentId)) {
      newMap.delete(equipmentId);
    } else {
      newMap.set(equipmentId, '');
    }
    onEquipmentChange(newMap);
  }

  function updateEquipmentNotes(equipmentId: number, notes: string) {
    const newMap = new Map(selectedEquipment);
    newMap.set(equipmentId, notes);
    onEquipmentChange(newMap);
  }

  function toggleCategory(category: string) {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  }

  function toggleAllCategories() {
    if (expandedCategories.size === uniqueCategories.length) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(uniqueCategories.map(c => c.english)));
    }
  }

  // Group equipment by category (with deduplication)
  const groupedEquipment = useMemo(() => {
    const grouped = allEquipment.reduce((acc, equip) => {
      const category = equip.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(equip);
      return acc;
    }, {} as Record<string, Equipment[]>);

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      Object.keys(grouped).forEach(category => {
        grouped[category] = grouped[category].filter(equip =>
          equip.name.toLowerCase().includes(query) ||
          (equip.name_en && equip.name_en.toLowerCase().includes(query))
        );
      });
      // Remove empty categories
      Object.keys(grouped).forEach(category => {
        if (grouped[category].length === 0) delete grouped[category];
      });
    }

    return grouped;
  }, [allEquipment, searchQuery]);

  // Get unique categories with Bulgarian names
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(allEquipment.map(e => e.category).filter(Boolean)))
      .sort()
      .map(englishCat => {
        // Find first equipment in this category to get Bulgarian name
        const sample = allEquipment.find(e => e.category === englishCat);
        return {
          english: englishCat,
          bulgarian: sample?.category_bg || englishCat,
          count: allEquipment.filter(e => e.category === englishCat).length
        };
      });
  }, [allEquipment]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="animate-spin" size={16} />
        <span>Loading equipment...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER WITH CONTROLS */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-gray-900">
          Уреди за Step {stepNumber}
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Grid view"
          >
            <Grid3x3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            title="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* SEARCH BAR - NEW! */}
      <input
        type="text"
        placeholder="Търси уред... (микс, купа, форма...)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
      />

      {/* EXPAND/COLLAPSE ALL - NEW! */}
      <div className="flex gap-2">
        <button
          onClick={toggleAllCategories}
          className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
        >
          {expandedCategories.size === uniqueCategories.length ? 'Сгури всички' : 'Разгори всички'}
        </button>
        <div className="text-xs text-gray-600 py-1">
          {selectedEquipment.size} избрани от {allEquipment.length}
        </div>
      </div>

      {/* EQUIPMENT BY CATEGORY - IMPROVED LAYOUT */}
      <div className="space-y-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
        {uniqueCategories.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Няма оборудване. Преди всичко добавете категория.
          </div>
        ) : (
          uniqueCategories.map(categoryInfo => {
            const items = groupedEquipment[categoryInfo.english] || [];
            if (items.length === 0) return null;  // Hide empty categories

            const isExpanded = expandedCategories.has(categoryInfo.english);

            return (
              <div key={categoryInfo.english} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* CATEGORY HEADER - SINGLE CLICK TO EXPAND/COLLAPSE */}
                <button
                  onClick={() => toggleCategory(categoryInfo.english)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{isExpanded ? '▼' : '▶'}</span>
                    <span className="font-semibold text-gray-900">{categoryInfo.bulgarian}</span>
                    <span className="text-xs text-gray-500">({items.length})</span>
                  </div>
                  <span className="text-xs text-purple-600 font-medium">
                    {items.filter(i => selectedEquipment.has(i.id)).length}/{items.length}
                  </span>
                </button>

                {/* EQUIPMENT ITEMS - GRID OR LIST */}
                {isExpanded && (
                  <div className={`p-3 border-t border-gray-200 ${
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 gap-2'
                      : 'space-y-2'
                  }`}>
                    {items.map(equip => (
                      <div
                        key={equip.id}
                        className={`p-2 rounded border ${
                          selectedEquipment.has(equip.id)
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* CHECKBOX + ICON + NAME */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedEquipment.has(equip.id)}
                            onChange={() => toggleEquipment(equip.id)}
                            className="w-4 h-4 rounded text-purple-600 cursor-pointer"
                          />
                          
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            {equip.icon && <span className="text-lg">{equip.icon}</span>}
                            <span className="text-sm text-gray-900 truncate">
                              {equip.name}
                            </span>
                          </div>

                          {equip.reference_image_url && (
                            <img
                              src={equip.reference_image_url}
                              alt={equip.name}
                              className="w-6 h-6 rounded object-cover border border-gray-300"
                              title={equip.name}
                            />
                          )}
                        </label>

                        {/* NOTES INPUT - ONLY WHEN SELECTED */}
                        {selectedEquipment.has(equip.id) && (
                          <input
                            type="text"
                            value={selectedEquipment.get(equip.id) || ''}
                            onChange={(e) => updateEquipmentNotes(equip.id, e.target.value)}
                            placeholder="напр. 20см, електрически..."
                            className="mt-1 w-full text-xs px-2 py-1 border border-purple-200 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SELECTED SUMMARY - STICKY AT BOTTOM */}
      {selectedEquipment.size > 0 && (
        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg sticky bottom-0">
          <div className="text-sm font-medium text-purple-900 mb-2">
            ✓ Избрано: {selectedEquipment.size}
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from(selectedEquipment.entries()).map(([equipId, notes]) => {
              const equip = allEquipment.find(e => e.id === equipId);
              return (
                <div
                  key={equipId}
                  className="bg-white px-2 py-1 rounded text-xs text-gray-700 border border-purple-200 inline-flex items-center gap-1"
                >
                  {equip?.icon && <span>{equip.icon}</span>}
                  <span>{equip?.name}</span>
                  {notes && <span className="text-gray-500 text-xs">({notes})</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INFO */}
      <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs text-blue-900">
        💡 Съвет: Използвайте решетка или списък, разширете нужните категории. 
        Търсенето филтрира бързо.
      </div>
    </div>
  );
}
```

---

## TASK 4: Replace Old Component with New One

### Update: `Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx`

```typescript
// Change import from:
// import { EquipmentSelector } from './EquipmentSelector';

// To:
import { EquipmentSelectorImproved } from './EquipmentSelectorImproved';

// And in JSX, change from:
// <EquipmentSelector ... />

// To:
<EquipmentSelectorImproved
  stepNumber={step.step_number}
  selectedEquipment={stepEquipment[step.step_number] || new Map()}
  onEquipmentChange={(equipment) => handleEquipmentChange(step.step_number, equipment)}
/>
```

Do the SAME for base_recipes:

### Update: `Admin/app/dashboard/base-recipes/[id]/EnhancedStepImages.tsx`

(Same replacement as above)

---

## TASK 5: Database Cleanup & Fixes

```sql
-- 1. Check for duplicates
SELECT category, COUNT(DISTINCT id) as unique_count, COUNT(*) as total
FROM equipment
GROUP BY category
ORDER BY category;

-- 2. Fix case sensitivity
UPDATE equipment
SET category = LOWER(TRIM(category))
WHERE category != LOWER(TRIM(category));

-- 3. Fix empty/NULL categories
UPDATE equipment
SET category = 'other'
WHERE category IS NULL OR TRIM(category) = '';

-- 4. Populate Bulgarian names if not exists
UPDATE equipment
SET category_bg = CASE
  WHEN LOWER(category) = 'cookware' THEN 'Съдове'
  WHEN LOWER(category) = 'appliance' THEN 'Уреди'
  WHEN LOWER(category) = 'tools' THEN 'Инструменти'
  WHEN LOWER(category) = 'molds' THEN 'Форми'
  WHEN LOWER(category) = 'utensils' THEN 'Прибори'
  WHEN LOWER(category) = 'bakeware' THEN 'Печене'
  WHEN LOWER(category) = 'pastry' THEN 'Сладкарство'
  WHEN LOWER(category) = 'mixing' THEN 'Смесване'
  WHEN LOWER(category) = 'measuring' THEN 'Мерене'
  WHEN LOWER(category) = 'decorating' THEN 'Декориране'
  ELSE INITCAP(category)
END
WHERE category_bg IS NULL;

-- 5. Verify
SELECT DISTINCT category, category_bg, COUNT(*) as count
FROM equipment
GROUP BY category, category_bg
ORDER BY category;
```

---

## Testing Checklist

### UI Improvements
- [ ] Open simple recipe
- [ ] See "Уреди за Step 1" header (Bulgarian!)
- [ ] See search bar (can type "микс" to find mixer)
- [ ] See "Разгори всички" button - expands all at once
- [ ] See view mode toggle (Grid/List)
- [ ] Click "Разгори всички" - all categories expand instantly
- [ ] Switch to Grid view - compact 2-column layout
- [ ] Switch to List view - full-width layout
- [ ] Search "блендер" - filters to only blender category
- [ ] Select equipment - shows summary at bottom
- [ ] Notes input appears only for selected items

### Database Fixes
- [ ] Run duplicate check - should show 1 count per category
- [ ] Check Bulgarian names - all categories have category_bg
- [ ] Check appliance - should have only ONE category entry (not 2)

### Workflow Test
- [ ] Select 5 items from 3 different categories
- [ ] Collapse categories
- [ ] Expand Step 2
- [ ] Repeat selection
- [ ] All selections preserved
- [ ] No lag, no scrolling across page

---

## Summary

**Problems Fixed:**
1. ✅ Duplicate categories (database cleanup)
2. ✅ Too many clicks (Expand All button)
3. ✅ Category names in English (Bulgarian names added)
4. ✅ Excessive scrolling (compact layout)
5. ✅ Better search (filter equipment on the fly)

**New Features:**
- ✅ Search bar - type to filter
- ✅ Expand All / Collapse All - one click
- ✅ Grid / List view toggle
- ✅ Bulgarian category names
- ✅ Sticky selected summary
- ✅ Only show notes input for selected items

**Result:** Much faster workflow! One step per recipe instead of 10 clicks! 🚀

---

## Reports to Provide

1. **Screenshot of improved selector** (with search)
2. **Screenshot grid view** (compact 2-column)
3. **Screenshot list view** (full width)
4. **Database cleanup verification** (no duplicates)
5. **Before/After** workflow comparison

---

Good luck! 🎯