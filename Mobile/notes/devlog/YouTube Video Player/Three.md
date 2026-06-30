# KetoCakR Admin Panel — Add Source/Video Section to new/page.tsx

## Problem

When creating a NEW simply recipe in Admin Panel (`new/page.tsx`), the **Source/Video section is missing**.

Simply recipes need ability to add YouTube unlisted video links during creation, not just during edit.

## Current State

File: `Admin/app/dashboard/base-recipes/new/page.tsx`

The form creates new base_recipes but doesn't have fields for:
- `source_type` (varchar(50))
- `source_url` (text)

## Solution

### Step 1: Check Form State

File: `Admin/app/dashboard/base-recipes/new/page.tsx`

Find the state initialization (around top of component):

```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  name: '',
  name_en: '',
  description: '',
  // ... etc
});
```

### Step 2: Add Source Fields to State

Add to initial state:

```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  
  // ADD THESE:
  source_type: 'puzzle_component',  // default value
  source_url: '',
});
```

### Step 3: Add Source/Video Section to Form

Find a good location in the form (suggest: after Dessert Types section, before Save button).

Add this new section:

```typescript
{/* SOURCE / VIDEO SECTION */}
<div className="space-y-4 border-t pt-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-800">
    Source / Video (YouTube)
  </h3>
  <p className="text-sm text-gray-500">
    Add a YouTube unlisted video link for this recipe. Video will be embedded in the mobile app.
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
</div>
```

### Step 4: Update Form Submission

Find the save/submit handler (usually `handleSave` or `handleSubmit`).

When inserting into Supabase, include source fields:

```typescript
const handleSave = async () => {
  try {
    const { error } = await supabase
      .from('base_recipes')
      .insert([
        {
          name: formData.name,
          name_en: formData.name_en,
          description: formData.description,
          description_en: formData.description_en,
          image_url: formData.image_url,
          // ... other fields
          
          // ADD THESE:
          source_type: formData.source_type || 'puzzle_component',
          source_url: formData.source_url || null,
          is_simple_recipe: true,  // This is a new simply recipe
          
          // ... rest of fields
        }
      ]);

    if (!error) {
      toast.success('Recipe created successfully');
      // redirect or navigate away
    } else {
      toast.error('Failed to create recipe');
    }
  } catch (err) {
    console.error(err);
    toast.error('Error creating recipe');
  }
};
```

### Step 5: Optional - Add Validation

If you want to validate YouTube URL format:

```typescript
const validateYouTubeUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  
  const youtubeRegex = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=|youtu\.be\//;
  return youtubeRegex.test(url);
};

// In save handler, before insert:
if (formData.source_type === 'youtube_unlisted' && !validateYouTubeUrl(formData.source_url)) {
  toast.error('Invalid YouTube URL format');
  return;
}
```

## Visual Placement

The section should appear in the form like this:

```
┌─────────────────────────────────────┐
│  [Dessert Types checkboxes]         │
├─────────────────────────────────────┤
│  Source / Video (YouTube)           │
│                                     │
│  Source Type:                       │
│  [▼ Puzzle Component (No Video)]    │
│                                     │
│  [SAVE BUTTON]  [CANCEL BUTTON]     │
└─────────────────────────────────────┘
```

When "YouTube (Unlisted Video)" selected:

```
┌─────────────────────────────────────┐
│  Source / Video (YouTube)           │
│                                     │
│  Source Type:                       │
│  [▼ YouTube (Unlisted Video)]       │
│                                     │
│  YouTube URL:                       │
│  [https://www.youtube.com/...]      │
│                                     │
│  ✅ Video URL saved...              │
│                                     │
│  [SAVE BUTTON]  [CANCEL BUTTON]     │
└─────────────────────────────────────┘
```

## Fields Summary

| Field | Type | Default | Required | Notes |
|-------|------|---------|----------|-------|
| `source_type` | varchar(50) | 'puzzle_component' | Yes | 'puzzle_component' or 'youtube_unlisted' |
| `source_url` | text | null | No | Only required if source_type='youtube_unlisted' |

## Test Cases

**Test 1: Create simply recipe WITHOUT video**
- [ ] Open new/page.tsx (create new simply recipe)
- [ ] Fill basic info (name, description, etc.)
- [ ] Go to "Source / Video" section
- [ ] Select "Puzzle Component (No Video)" (default)
- [ ] YouTube URL field is hidden
- [ ] Save
- [ ] Verify in Supabase: source_type='puzzle_component', source_url=null

**Test 2: Create simply recipe WITH YouTube video**
- [ ] Open new/page.tsx
- [ ] Fill basic info
- [ ] Go to "Source / Video" section
- [ ] Select "YouTube (Unlisted Video)"
- [ ] YouTube URL field appears
- [ ] Paste YouTube URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
- [ ] Success message "✅ Video URL saved..." appears
- [ ] Save
- [ ] Verify in Supabase: source_type='youtube_unlisted', source_url populated

**Test 3: Edit and verify**
- [ ] Open Admin Panel
- [ ] Edit the newly created recipe
- [ ] Source/Video section should show correct data
- [ ] Can change source type and URL
- [ ] Changes persist

**Test 4: Mobile app verification**
- [ ] Mobile app loads the recipe
- [ ] If source_url exists → video button appears
- [ ] Click video → YouTube plays
- [ ] If no source_url → no video button

## Verification Checklist

- [ ] Form state includes source_type and source_url
- [ ] Source/Video section visible in new/page.tsx form
- [ ] Source Type dropdown works (toggles YouTube URL field)
- [ ] YouTube URL field only shows when 'youtube_unlisted' selected
- [ ] Success message shows when URL is entered
- [ ] Save button includes source fields in INSERT query
- [ ] New recipes save with correct source_type and source_url
- [ ] Data persists in Supabase
- [ ] No console errors
- [ ] Mobile app correctly loads and displays video button

## Expected Result

1. Admin creates new simply recipe
2. Selects "YouTube (Unlisted Video)" as source type
3. Pastes YouTube URL
4. Saves recipe
5. Mobile app loads recipe with video button
6. User clicks video → YouTube embedded player opens
7. Video plays with BG + EN subtitles

---

Generated: 2026-05-20
Priority: HIGH (blocks video feature for new recipes)
Complexity: SIMPLE (add form section + fields)
Time: 15-20 minutes