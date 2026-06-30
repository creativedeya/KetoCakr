# KetoCakR — Master Claude Code Task (All Pending Work)

## Overview

This task combines ALL pending fixes and features for both Admin Panel and Mobile App.

**Estimated time:** 2-3 hours (can be split into 2 sessions)

---

## SESSION 1: Admin Panel Fixes & Features (90 minutes)

### TASK 1.1: Fix Import/Export Error (5 min) ⚡
**File:** `Admin/app/dashboard/base-recipes/new/page.tsx`

**Problem:** DEFAULT import for NAMED exports

**Current (WRONG):**
```typescript
import IngredientAutocomplete from '@/components/IngredientAutocomplete';
import LabNotesManager from '@/components/LabNotesManager';
```

**Fix to:**
```typescript
import { IngredientAutocomplete } from '@/components/IngredientAutocomplete';
import { LabNotesManager } from '@/components/LabNotesManager';
```

**Check:** `Admin/app/dashboard/base-recipes/[id]/page.tsx` for same pattern.

---

### TASK 1.2: Fix Null Reference Error in EditBaseRecipePage (5 min) ⚡
**File:** `Admin/app/dashboard/base-recipes/[id]/page.tsx` (Line 429)

**Problem:** `compatible_dessert_types` is NULL for simply recipes

**Current (WRONG):**
```typescript
checked={formData.compatible_dessert_types.includes(type.id)}
```

**Fix to:**
```typescript
checked={formData.compatible_dessert_types?.includes(type.id) ?? false}
```

**Search:** Find other `.includes(` calls in same file and apply same fix.

---

### TASK 1.3: Add onSelect Prop to IngredientAutocomplete (10 min) ⚡
**Files:** 
- `Admin/app/dashboard/base-recipes/[id]/page.tsx`
- `Admin/app/dashboard/base-recipes/new/page.tsx`

**Problem:** IngredientAutocomplete expects `onSelect` callback but doesn't receive it

**Find:** All `<IngredientAutocomplete` usages (typically 1-2 per file)

**Current (WRONG):**
```typescript
<IngredientAutocomplete
  value={ingredientName}
  onChange={(v) => setIngredientName(v)}
  placeholder="Search..."
/>
```

**Fix to:**
```typescript
<IngredientAutocomplete
  value={ingredientName}
  onChange={(v) => setIngredientName(v)}
  onSelect={(ing) => {
    // Handle selected ingredient
    console.log('Selected:', ing.name_bg, ing.id);
    // Option: Add to ingredients list, update form state, etc.
    // Example:
    // addIngredient({
    //   ingredient_database_id: ing.id,
    //   ingredient_name: ing.name_bg,
    //   quantity: 0,
    //   unit: 'g'
    // });
    // setIngredientName('');
  }}
  placeholder="Search..."
/>
```

**Note:** Handler implementation depends on context. At minimum, clear the input or log selection.

---

### TASK 1.4: Create SimpleRecipeEditForm Component (45 min) 📝
**New File:** `Admin/components/SimpleRecipeEditForm.tsx`

**Purpose:** Separate form for simply recipes (no instruction steps, components, assembly)

**Sections to include:**

1. **Basic Info:**
   - name, name_en
   - description, description_en
   - image_url (with upload)

2. **Nutrition (Per 100g & Total):**
   - calories_per_100g, total_calories
   - protein_per_100g, total_protein
   - carbs_per_100g, total_carbs
   - fat_per_100g, total_fat
   - fiber_per_100g, total_fiber
   - net_carbs_per_100g, total_net_carbs

3. **Recipe Metadata:**
   - prep_time_minutes
   - servings (default 8)
   - difficulty_level
   - is_visible_to_users (checkbox)
   - is_free (checkbox)

4. **Ingredients:**
   - Display list from recipe_ingredients
   - Show: ingredient_name, quantity, unit
   - Add button (with IngredientAutocomplete)
   - Edit/Delete for each ingredient

5. **Dessert Types:**
   - Checkboxes for compatible_dessert_types

6. **Source / Video (YouTube):** ← NEW
   - source_type dropdown: 'puzzle_component' or 'youtube_unlisted'
   - source_url input (conditional on source_type)
   - Info message when URL saved

7. **Action Buttons:**
   - Save
   - Delete
   - Back

**Reference:** Use existing ComplexRecipeEditForm as style guide for UI components, but remove instruction steps, components, assembly sections.

---

### TASK 1.5: Add Conditional Rendering to EditBaseRecipePage (10 min) 🔄
**File:** `Admin/app/dashboard/base-recipes/[id]/page.tsx`

**Add logic:**

```typescript
const isSimpleRecipe = recipe?.is_simple_recipe === true;

return (
  <div>
    {isSimpleRecipe ? (
      <SimpleRecipeEditForm recipe={recipe} onSave={handleSave} />
    ) : (
      <ComplexRecipeEditForm recipe={recipe} onSave={handleSave} />
    )}
  </div>
);
```

**Import SimpleRecipeEditForm** at top of file.

---

### TASK 1.6: Add Source/Video Section to new/page.tsx (10 min) 🎬
**File:** `Admin/app/dashboard/base-recipes/new/page.tsx`

**If this file has separate logic for new recipes**, add same Source/Video section:

```typescript
{/* SOURCE / VIDEO SECTION */}
<div className="space-y-4 border-t pt-6 mt-6">
  <h3 className="text-lg font-semibold text-gray-800">
    Source / Video (YouTube)
  </h3>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Source Type
    </label>
    <select
      value={formData.source_type || 'puzzle_component'}
      onChange={(e) =>
        setFormData({ ...formData, source_type: e.target.value })
      }
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
    >
      <option value="puzzle_component">Puzzle Component (No Video)</option>
      <option value="youtube_unlisted">YouTube (Unlisted Video)</option>
    </select>
  </div>

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
        placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
  )}
</div>
```

---

## SESSION 2: Mobile App Fixes & Features (90 minutes)

### TASK 2.1: Fix Syntax Error in recipes.ts (2 min) ⚡
**File:** `Mobile/api/recipes.ts` (Line 117)

**Problem:** Missing comma in object literal

**Current (WRONG):**
```typescript
{
  recipeName,
  totalServings
  componentsCount: selectedComponents.length,
}
```

**Fix to:**
```typescript
{
  recipeName,
  totalServings,
  componentsCount: selectedComponents.length,
}
```

Verify no syntax errors in Expo bundler logs.

---

### TASK 2.2: Create YouTubePlayerModal Component (20 min) 📺
**New File:** `Mobile/components/YouTubePlayerModal.tsx`

**Purpose:** Full-screen YouTube player in modal

**Features:**
- WebView with embedded YouTube iframe
- Close button (X) in top-right
- Auto-play on open
- Responsive to landscape/portrait

**Code template:**
```typescript
import React from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface YouTubePlayerModalProps {
  visible: boolean;
  videoId: string;
  onClose: () => void;
}

export const YouTubePlayerModal = ({ visible, videoId, onClose }: YouTubePlayerModalProps) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <TouchableOpacity 
          onPress={onClose} 
          style={{ 
            position: 'absolute', 
            top: 50, 
            right: 20, 
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 10,
            borderRadius: 20,
          }}
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <WebView
          source={{
            html: `
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { margin: 0; padding: 0; background: #000; }
                    iframe { width: 100%; height: 100vh; border: none; }
                  </style>
                </head>
                <body>
                  <iframe 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </body>
              </html>
            `,
          }}
          startInLoadingState={true}
          scalesPageToFit
        />
      </View>
    </Modal>
  );
};
```

**Verify:** `react-native-webview` is installed (`npx expo install react-native-webview` if needed)

---

### TASK 2.3: Create VideoButton Component (20 min) 🎬
**New File:** `Mobile/components/VideoButton.tsx`

**Purpose:** Button to trigger YouTube video playback

**Features:**
- Extracts YouTube video ID from source_url
- Shows thumbnail with play button overlay
- Text "WATCH VIDEO" (bilingual)
- Triggers YouTubePlayerModal on tap

**Key function:**
```typescript
const extractYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
};

const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
```

**Styling:**
- Play button: circular, Colors.primary.main background, white ▶ icon
- Thumbnail: full width, 200px height
- Overlay text: "WATCH VIDEO" + "by @blagocake"
- borderRadius: 12px

**Bilingual:** Use `useTranslation()` for "watchVideo" key.

---

### TASK 2.4: Add i18n Keys (5 min) 🌐
**Files:**
- `Mobile/constants/i18n/en.json`
- `Mobile/constants/i18n/bg.json`

**Add:**
```json
// en.json
{
  "watchVideo": "WATCH VIDEO"
}

// bg.json
{
  "watchVideo": "ГЛЕДАЙ ВИДЕО"
}
```

---

### TASK 2.5: Integrate VideoButton into RecipeDetailView (15 min) 🔗
**File:** `Mobile/components/RecipeDetailView.tsx`

**Location:** Between hero image and nutrition badge

**Add imports:**
```typescript
import { VideoButton } from './VideoButton';
import { YouTubePlayerModal } from './YouTubePlayerModal';
```

**Render after hero image:**
```typescript
{recipe.image_url && (
  <Image
    source={{ uri: recipe.image_url }}
    style={{ width: '100%', height: 250 }}
  />
)}

{/* VIDEO BUTTON - ADD HERE */}
{recipe.source_url && <VideoButton sourceUrl={recipe.source_url} />}

{/* Nutrition Badge */}
<View style={...}>
  {/* nutrition content */}
</View>
```

**Condition:** Only render if `recipe.source_url` exists.

---

### TASK 2.6: Mobile App Testing (15 min) ✅
**Test workflow:**

1. **Test 1: Simply recipe WITH video**
   - Open Ягодова панакота
   - Video button should appear between image and nutrition
   - Click button → YouTube player opens
   - Video plays with subtitles (if enabled on YouTube)
   - Close button (X) closes modal
   - Returns to recipe detail

2. **Test 2: Simply recipe WITHOUT video**
   - Open another simply recipe (no source_url)
   - Video button should NOT appear
   - Layout looks normal

3. **Test 3: Complex recipe**
   - Open complex recipe
   - No video button (they don't have videos)
   - Layout unchanged

4. **Test 4: Bilingual**
   - Switch language BG → EN
   - Button text changes to "WATCH VIDEO"
   - Switch back to BG
   - Text changes to "ГЛЕДАЙ ВИДЕО"

5. **Test 5: Video playback**
   - Play video
   - Can pause/resume
   - Can seek
   - Subtitles visible (if YouTube has them)
   - Close works

---

## OVERALL VERIFICATION CHECKLIST

### Admin Panel
- [ ] Import errors fixed (named imports)
- [ ] Null reference errors fixed (optional chaining)
- [ ] onSelect prop added to IngredientAutocomplete
- [ ] SimpleRecipeEditForm component created
- [ ] Conditional rendering working (is_simple_recipe check)
- [ ] Source/Video section added to both edit and new pages
- [ ] Save button includes source_type and source_url
- [ ] No console errors in Admin Panel

### Mobile App
- [ ] Syntax error fixed (missing comma)
- [ ] YouTubePlayerModal component created
- [ ] VideoButton component created
- [ ] i18n keys added
- [ ] VideoButton integrated into RecipeDetailView
- [ ] Video button shows ONLY when source_url exists
- [ ] YouTube player opens/closes correctly
- [ ] Bilingual text working
- [ ] App compiles without errors
- [ ] Tested on Android/iOS or Expo Go

### Database
- [ ] Simply recipes have is_simple_recipe = true
- [ ] Simply recipes have source_url populated (if video)
- [ ] source_type = 'youtube_unlisted'
- [ ] Complex recipes still work normally

### End-to-End Flow
1. Admin adds simply recipe with YouTube video
2. Sets source_type = 'youtube_unlisted'
3. Adds source_url with YouTube link
4. Mobile user opens recipe
5. Sees video button
6. Clicks button
7. YouTube video plays with BG + EN subtitles
8. User closes and returns to recipe

---

## File Summary

### New Components (Create)
- `Admin/components/SimpleRecipeEditForm.tsx`
- `Mobile/components/YouTubePlayerModal.tsx`
- `Mobile/components/VideoButton.tsx`

### Modified Files (Edit)
- `Admin/app/dashboard/base-recipes/[id]/page.tsx` (conditional rendering + null check)
- `Admin/app/dashboard/base-recipes/new/page.tsx` (add onSelect, source section)
- `Mobile/api/recipes.ts` (fix syntax error)
- `Mobile/components/RecipeDetailView.tsx` (add VideoButton)
- `Mobile/constants/i18n/en.json` (add watchVideo key)
- `Mobile/constants/i18n/bg.json` (add watchVideo key)

### Verified (No Changes Needed)
- `Admin/components/IngredientAutocomplete.tsx` (component signature OK)
- `Mobile/app/recipe-detail/[id].tsx` (load recipe data)

---

## Dependencies

**Admin Panel:** No new dependencies

**Mobile App:** Verify installed:
```bash
npx expo install react-native-webview
```

---

Generated: 2026-05-20
Total Time: 2-3 hours (can split into 2 sessions)
Priority: HIGH (blocks core features)
Complexity: MODERATE (multiple files, but each task is straightforward)