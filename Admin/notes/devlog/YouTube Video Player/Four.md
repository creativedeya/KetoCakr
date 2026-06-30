# KetoCakR Admin Panel — Add Source/Video Section to SimpleRecipeEditForm (Edit Mode)

## Problem

When EDITING a simply recipe in Admin Panel (`[id]/page.tsx` → `SimpleRecipeEditForm`), the **Source/Video section is MISSING**.

The new/page.tsx form (create mode) has Source/Video fields ✅
The [id]/page.tsx form (edit mode) for simply recipes is MISSING them ❌

## Current State

When you edit a simply recipe (e.g., Ягодова панакота):
- ❌ Source/Video section doesn't exist in SimpleRecipeEditForm
- ❌ Can't view or edit source_type
- ❌ Can't view or edit source_url
- ✅ But these fields exist in database with data

## Solution

### Step 1: Verify SimpleRecipeEditForm Location

File: `Admin/components/SimpleRecipeEditForm.tsx`

This component should have been created in previous task. If not, check if code is in `[id]/page.tsx` directly.

### Step 2: Check Form State

SimpleRecipeEditForm should initialize these fields from recipe data:

```typescript
const [formData, setFormData] = useState({
  // ... existing fields (name, description, nutrition, ingredients, etc.)
  
  // VERIFY THESE EXIST:
  source_type: recipe?.source_type || 'puzzle_component',
  source_url: recipe?.source_url || '',
});
```

**If missing**, add them to useState initialization.

### Step 3: Add Source/Video Section to Form

Location: Add AFTER **Dessert Types** section, BEFORE **Lab Notes** (or at end before Save button).

**Paste this section:**

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

### Step 4: Update Save Handler

Find the save/update function in SimpleRecipeEditForm (usually `handleSave` or similar):

When updating the recipe, include source fields:

```typescript
const handleSave = async () => {
  try {
    const { error } = await supabase
      .from('base_recipes')
      .update({
        name: formData.name,
        name_en: formData.name_en,
        description: formData.description,
        description_en: formData.description_en,
        image_url: formData.image_url,
        // ... other fields (nutrition, servings, etc.)
        
        // ADD THESE:
        source_type: formData.source_type || 'puzzle_component',
        source_url: formData.source_url || null,
        
      })
      .eq('id', recipe.id);

    if (!error) {
      toast.success('Recipe updated successfully');
    } else {
      toast.error('Failed to update recipe');
    }
  } catch (err) {
    console.error(err);
    toast.error('Error updating recipe');
  }
};
```

### Step 5: Verify Load Function

When loading recipe data for edit mode:

```typescript
useEffect(() => {
  const loadRecipe = async () => {
    const { data } = await supabase
      .from('base_recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (data) {
      setFormData({
        // ... all existing fields
        
        // ENSURE THESE ARE INCLUDED:
        source_type: data.source_type || 'puzzle_component',
        source_url: data.source_url || '',
      });
    }
  };

  loadRecipe();
}, [recipeId]);
```

## Visual Placement

The section should appear in SimpleRecipeEditForm like this:

```
┌──────────────────────────────────────┐
│  [Nutrition Section]                 │
├──────────────────────────────────────┤
│  [Ingredients List]                  │
├──────────────────────────────────────┤
│  [Dessert Types Checkboxes]          │
├──────────────────────────────────────┤
│  Source / Video (YouTube)     ← NEW  │
│                                      │
│  Source Type:                        │
│  [▼ YouTube (Unlisted Video)]        │
│                                      │
│  YouTube URL:                        │
│  [https://www.youtube.com/watch...]  │
│                                      │
│  Current URL:                        │
│  https://www.youtube.com/...         │
│                                      │
│  [SAVE BUTTON]  [DELETE] [BACK]      │
└──────────────────────────────────────┘
```

## Test Cases

**Test 1: Edit simply recipe WITH existing video**
- [ ] Open Ягодова панакота (has source_url in DB)
- [ ] SimpleRecipeEditForm loads
- [ ] "Source / Video" section visible
- [ ] Source Type shows: "YouTube (Unlisted Video)"
- [ ] YouTube URL field shows existing URL
- [ ] "Current URL:" section displays the URL
- [ ] Can edit URL
- [ ] Save button persists changes
- [ ] Verify in Supabase: source_url updated

**Test 2: Edit simply recipe and CHANGE source type**
- [ ] Open existing recipe with video (source_type='youtube_unlisted')
- [ ] Change Source Type to "Puzzle Component (No Video)"
- [ ] YouTube URL field disappears
- [ ] Save
- [ ] Verify in DB: source_type='puzzle_component'
- [ ] Mobile app: video button disappears

**Test 3: Edit simply recipe and ADD video**
- [ ] Open simply recipe WITHOUT video (source_type='puzzle_component')
- [ ] Change Source Type to "YouTube (Unlisted Video)"
- [ ] YouTube URL field appears
- [ ] Paste new YouTube URL
- [ ] Save
- [ ] Verify in DB: source_url populated
- [ ] Mobile app: video button appears

**Test 4: Clear/Remove video**
- [ ] Edit recipe with video
- [ ] Clear the YouTube URL field (leave empty)
- [ ] Save
- [ ] Verify in DB: source_url is NULL or empty
- [ ] Mobile app: video button doesn't show

## Verification Checklist

- [ ] SimpleRecipeEditForm component has source_type and source_url in state
- [ ] Source/Video section visible in edit form
- [ ] Source Type dropdown loads with correct current value
- [ ] YouTube URL field loads with correct current URL
- [ ] YouTube URL field only shows when 'youtube_unlisted' selected
- [ ] "Current URL" display shows existing URL
- [ ] Can edit both source_type and source_url
- [ ] Save button includes source fields in UPDATE query
- [ ] Changes persist in Supabase
- [ ] Mobile app correctly loads updated video data
- [ ] No console errors

## Expected Result

1. Admin opens simply recipe in edit mode
2. Scrolls to "Source / Video" section
3. Can view existing YouTube URL (if exists)
4. Can change source type and/or URL
5. Saves changes
6. Mobile app reflects updates (video button appears/disappears)

---

Generated: 2026-05-20
Priority: HIGH (blocks video editing for simply recipes)
Complexity: SIMPLE (add form section + include in save)
Time: 10-15 minutes