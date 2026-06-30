# KetoCakR Admin Panel — PRECISE Task: Add Source/Video Section to SimpleRecipeEditForm

## CRITICAL: This task requires EXACT code changes in specific locations

---

## FILE TO MODIFY

**Path:** `Admin/components/SimpleRecipeEditForm.tsx`

---

## STEP 1: CHECK FORM STATE INITIALIZATION

**Find:** The `useState` hook that initializes `formData`

**Look for code like:**
```typescript
const [formData, setFormData] = useState({
  name: recipe?.name || '',
  name_en: recipe?.name_en || '',
  // ... more fields
});
```

**ACTION:** 
Add these TWO lines to the useState object (AFTER all existing fields, BEFORE closing brace):

```typescript
source_type: recipe?.source_type || 'puzzle_component',
source_url: recipe?.source_url || '',
```

**Result should look like:**
```typescript
const [formData, setFormData] = useState({
  name: recipe?.name || '',
  name_en: recipe?.name_en || '',
  description: recipe?.description || '',
  // ... all other existing fields ...
  source_type: recipe?.source_type || 'puzzle_component',
  source_url: recipe?.source_url || '',
});
```

---

## STEP 2: FIND THE SAVE HANDLER

**Find:** The function that saves the recipe (usually `handleSave` or `handleSaveBasic`)

**Look for code that contains:**
```typescript
const { error } = await supabase
  .from('base_recipes')
  .update({
    // fields being updated
  })
  .eq('id', recipe.id);
```

**ACTION:**
In the `.update({...})` object, FIND the closing brace and ADD these TWO lines BEFORE the closing brace:

```typescript
source_type: formData.source_type || 'puzzle_component',
source_url: formData.source_url || null,
```

**Example of CORRECT placement:**
```typescript
const { error } = await supabase
  .from('base_recipes')
  .update({
    name: formData.name,
    name_en: formData.name_en,
    description: formData.description,
    // ... all other fields ...
    source_type: formData.source_type || 'puzzle_component',  // ← ADD THIS
    source_url: formData.source_url || null,                   // ← ADD THIS
  })
  .eq('id', recipe.id);
```

---

## STEP 3: FIND WHERE TO ADD UI SECTION

**Find:** The Dessert Types section in the JSX

**Look for code containing:**
```typescript
{/* DESSERT TYPES SECTION */}
{/* or similar - look for dessert_types checkboxes */}
```

**ACTION:**
AFTER the Dessert Types closing `</div>`, ADD this ENTIRE new section:

```typescript
{/* SOURCE / VIDEO SECTION */}
<div className="space-y-4 border-t pt-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-800">
    Source / Video (YouTube)
  </h3>
  <p className="text-sm text-gray-500">
    Add or edit YouTube unlisted video link for this recipe. Video will be embedded in the mobile app.
  </p>

  {/* Source Type Dropdown */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Source Type
    </label>
    <select
      value={formData.source_type || 'puzzle_component'}
      onChange={(e) =>
        setFormData({ ...formData, source_type: e.target.value })
      }
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
    >
      <option value="puzzle_component">Puzzle Component (No Video)</option>
      <option value="youtube_unlisted">YouTube (Unlisted Video)</option>
    </select>
  </div>

  {/* Source URL Input - Show only if youtube_unlisted is selected */}
  {formData.source_type === 'youtube_unlisted' && (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        YouTube URL
      </label>
      <input
        type="text"
        value={formData.source_url || ''}
        onChange={(e) =>
          setFormData({ ...formData, source_url: e.target.value })
        }
        placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
      />
      <p className="mt-2 text-xs text-gray-500">
        Paste your YouTube unlisted video URL here. Format: https://www.youtube.com/watch?v=VIDEO_ID
      </p>
    </div>
  )}

  {/* Info Message */}
  {formData.source_type === 'youtube_unlisted' && formData.source_url && (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
      <p className="text-sm text-blue-800">
        ✅ Video URL saved. It will be embedded in the mobile app with BG + EN subtitles.
      </p>
    </div>
  )}

  {/* Current URL Display (if exists) */}
  {formData.source_type === 'youtube_unlisted' && formData.source_url && (
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
      <p className="text-xs text-gray-600 font-semibold">Current URL:</p>
      <p className="text-sm text-gray-700 break-all mt-1">{formData.source_url}</p>
    </div>
  )}
</div>
```

---

## VERIFICATION CHECKLIST

After completing ALL 3 steps, verify:

- [ ] Line 1: `source_type` is in useState with default 'puzzle_component'
- [ ] Line 2: `source_url` is in useState with default ''
- [ ] Line 3: Both fields are in the `.update({})` query
- [ ] Line 4: Source/Video section JSX is added after Dessert Types
- [ ] Line 5: Dropdown appears in UI when page loads
- [ ] Line 6: URL field appears ONLY when "YouTube (Unlisted Video)" is selected
- [ ] Line 7: Success message appears when URL has value
- [ ] Line 8: Current URL display shows existing URL
- [ ] Line 9: No TypeScript errors in console
- [ ] Line 10: Changes save to Supabase when Save button clicked

---

## TESTING

1. **Open Admin Panel**
2. **Go to simple recipe edit page** (e.g., Ягодова панакота)
3. **Scroll down to "Source / Video (YouTube)" section**
4. **Verify:**
   - Source Type dropdown visible ✅
   - Currently shows: "Puzzle Component (No Video)" or "YouTube (Unlisted Video)"
   - URL field visible if YouTube is selected
   - Current URL shows if has value
5. **Change Source Type to "YouTube (Unlisted Video)"**
6. **Paste YouTube URL**
7. **Click Save**
8. **Refresh page**
9. **Verify URL persisted and shows in form**

---

## SUCCESS CRITERIA

When complete, you should see:

```
┌─────────────────────────────────────┐
│ Source / Video (YouTube)            │
│                                     │
│ Source Type:                        │
│ [▼ YouTube (Unlisted Video)]        │
│                                     │
│ YouTube URL:                        │
│ [https://www.youtube.com/watch...]  │
│                                     │
│ ✅ Video URL saved...               │
│                                     │
│ Current URL:                        │
│ https://www.youtube.com/watch...    │
└─────────────────────────────────────┘
```

---

## COMMON MISTAKES TO AVOID

❌ **DON'T** add the UI section in the wrong place
✅ **DO** add it AFTER Dessert Types section

❌ **DON'T** forget to add fields to useState
✅ **DO** add both source_type AND source_url

❌ **DON'T** forget to add fields to .update() query
✅ **DO** include source_type and source_url in UPDATE

❌ **DON'T** use wrong syntax for conditional rendering
✅ **DO** use `{formData.source_type === 'youtube_unlisted' && <div>...}</div>`

---

## FILE SUMMARY

**Only ONE file needs modification:**
- `Admin/components/SimpleRecipeEditForm.tsx`

**Three types of changes:**
1. useState: Add 2 fields
2. Save handler: Add 2 fields to .update()
3. JSX: Add 1 new section with UI

---

Generated: 2026-05-21
Priority: BLOCKING
Time: 15 minutes
Difficulty: MODERATE (exact placement is critical)