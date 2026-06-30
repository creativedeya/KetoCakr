# KetoCakR Mobile — PRECISE Task: Fix Duplicate Ingredients + Add YouTube Video Button

## PROBLEM 1: Duplicate Ingredients in Simply Recipes

**Error:**
```
ERROR Encountered two children with the same key, `4695_0`. 
Keys should be unique so that components maintain their identity across updates.
```

**Symptom:**
- When viewing a simply recipe (e.g., Ягодова панакота)
- ALL ingredients appear TWICE in the ingredient list
- Example: желатин appears 2x, вода appears 2x, etc.

**Root Cause:**
In the transform function that builds the ingredient list, ingredients are being added to the array TWICE.

---

## SOLUTION 1: Fix Duplicate Ingredients

### Step 1: Find the Duplicate Code

**File:** `Mobile/components/RecipeDetailView.tsx` (or `Mobile/app/recipe-detail/[id].tsx`)

**Search for:** Where ingredients are transformed/mapped for simply recipes

**Look for code like:**
```typescript
const allIngredients = [];
// ... code that adds ingredients twice ...
recipe_ingredients.forEach(ing => {
  allIngredients.push(...);
});
// ... more code that adds same ingredients again ...
```

### Step 2: IDENTIFY the Transform Function

Find the function that builds ingredient list. It likely has:
- Loop through `recipe_ingredients`
- Uses `ingredient_id` or `id` as key
- Builds an array of ingredients

**Look for THIS pattern:**
```typescript
const ingredients = recipeIngredientsData
  .filter(ing => ing.recipe_id === baseRecipeId)
  .map(ing => ({
    id: ing.id,  // ← This becomes key
    name_bg: ing.ingredient_name,
    quantity: ing.quantity,
    unit: ing.unit,
  }));
```

### Step 3: FIX - Remove Duplicate Logic

The issue is likely ONE of these:

**Problem A: Ingredients added twice in array**
```typescript
// WRONG - adds ingredients twice
const allIngredients = [];
ingredients.forEach(ing => allIngredients.push(ing));
ingredients.forEach(ing => allIngredients.push(ing)); // ← DUPLICATE LOOP
```

**Fix:** Remove the duplicate loop. Keep only ONE `.forEach()` or `.map()`.

**Problem B: Same ID used multiple times**
```typescript
// WRONG - uses index as key
ingredients.map((ing, index) => (
  <div key={`${ing.id}_${index}`}>  // ← Problem: same index for duplicates
```

**Fix:** Use ONLY the ingredient ID:
```typescript
// CORRECT - unique key per ingredient
ingredients.map(ing => (
  <div key={ing.id}>  // ← Unique ID only
```

**Problem C: Ingredients array modified multiple times**
```typescript
// WRONG
let allIngredients = [...baseIngredients];
allIngredients = allIngredients.concat(baseIngredients); // ← DUPLICATE!
```

**Fix:** Build array once, don't concatenate the same ingredients.

### Step 4: Verify Fix

After fixing:
1. In the rendering code, look for `ingredients.map(ing => ...)`
2. Verify key is UNIQUE: `key={ing.id}` (NOT `key={ing.id}_${index}`)
3. Verify NO duplicate loops or concatenations
4. Verify EACH ingredient appears exactly ONCE in the array

### Step 5: Test

1. Open Mobile app
2. Navigate to simply recipe (Ягодова панакота)
3. View ingredients section
4. Verify:
   - ✅ Желатин appears 1 time (not 2)
   - ✅ Вода appears 1 time (not 2)
   - ✅ All ingredients appear once
   - ✅ No React key error in console

---

## PROBLEM 2: Add YouTube Video Button

**Goal:** Show "WATCH VIDEO" button between hero image and nutrition badge

### Step 1: Create YouTubePlayerModal Component

**New File:** `Mobile/components/YouTubePlayerModal.tsx`

**Add this code:**

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
        {/* Close Button */}
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

        {/* WebView with YouTube */}
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

### Step 2: Create VideoButton Component

**New File:** `Mobile/components/VideoButton.tsx`

**Add this code:**

```typescript
import React, { useState } from 'react';
import { TouchableOpacity, View, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { YouTubePlayerModal } from './YouTubePlayerModal';
import Colors from '@/constants/Colors';
import { useTranslation } from '@/hooks/useTranslation';

interface VideoButtonProps {
  sourceUrl: string;
}

export const VideoButton = ({ sourceUrl }: VideoButtonProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();

  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const videoId = extractYouTubeId(sourceUrl);
  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          marginHorizontal: 16,
          marginVertical: 12,
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        {/* Thumbnail */}
        <Image
          source={{ uri: thumbnailUrl }}
          style={{ width: '100%', height: 200 }}
        />

        {/* Play Button Overlay */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: Colors.primary.main,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="play" size={36} color="white" />
          </View>
        </View>

        {/* Text Overlay */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: 12,
          }}
        >
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
            {t('watchVideo') || 'WATCH VIDEO'}
          </Text>
          <Text style={{ color: '#ccc', fontSize: 12, marginTop: 4 }}>
            by @blagocake
          </Text>
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <YouTubePlayerModal
        visible={modalVisible}
        videoId={videoId}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};
```

### Step 3: Add Translation Keys

**File:** `Mobile/constants/i18n/en.json`

**Add:**
```json
{
  "watchVideo": "WATCH VIDEO"
}
```

**File:** `Mobile/constants/i18n/bg.json`

**Add:**
```json
{
  "watchVideo": "ГЛЕДАЙ ВИДЕО"
}
```

### Step 4: Integrate VideoButton into RecipeDetailView

**File:** `Mobile/components/RecipeDetailView.tsx`

**Find:** Where hero image is rendered

**Look for code like:**
```typescript
{recipe.image_url && (
  <Image
    source={{ uri: recipe.image_url }}
    style={{ width: '100%', height: 250 }}
  />
)}
```

**ACTION:** Add VideoButton RIGHT AFTER the image:

```typescript
{recipe.image_url && (
  <Image
    source={{ uri: recipe.image_url }}
    style={{ width: '100%', height: 250 }}
  />
)}

{/* VIDEO BUTTON - ADD THIS */}
{recipe.source_url && <VideoButton sourceUrl={recipe.source_url} />}

{/* Then rest of content (nutrition, etc.) */}
```

### Step 5: Import Components

At top of `RecipeDetailView.tsx`, add imports:

```typescript
import { VideoButton } from './VideoButton';
import { YouTubePlayerModal } from './YouTubePlayerModal';
```

### Step 6: Check Dependencies

Verify installed:
```bash
npx expo install react-native-webview
```

---

## VERIFICATION CHECKLIST

### Problem 1: Duplicate Ingredients
- [ ] Found the transform function that builds ingredient list
- [ ] Removed duplicate loops/concatenations
- [ ] Each ingredient appears ONCE in array
- [ ] Key is unique: `key={ing.id}` (not with index)
- [ ] No React key error in console
- [ ] Simply recipe shows each ingredient 1 time
- [ ] Ягодова панакота shows: желатин, вода, ягоди, еритритол, кокосова сметана (each once)

### Problem 2: YouTube Video Button
- [ ] YouTubePlayerModal.tsx created
- [ ] VideoButton.tsx created
- [ ] Translation keys added (watchVideo)
- [ ] VideoButton imported in RecipeDetailView
- [ ] VideoButton rendered after hero image
- [ ] Button shows ONLY if source_url exists
- [ ] Click button → modal opens
- [ ] YouTube video plays in fullscreen
- [ ] Close button (X) works
- [ ] Bilingual text works (EN/BG)
- [ ] No console errors

---

## TESTING

### Test 1: Ingredient Duplication Fix
1. Open Mobile app
2. Go to Ягодова панакота recipe
3. Look at ingredients list
4. Verify EACH ingredient shows ONCE (not twice)
5. No React key error in console

### Test 2: Video Button
1. Open Ягодова панакота (has source_url)
2. Scroll between hero image and nutrition badge
3. See "WATCH VIDEO" button with thumbnail
4. Tap button
5. Modal opens with full-screen YouTube
6. Video plays
7. Tap X to close
8. Back to recipe
9. Change language BG → EN
10. Button text changes to "WATCH VIDEO" (EN)

### Test 3: No Video Button
1. Open simply recipe WITHOUT source_url
2. No video button appears
3. Layout is normal

---

## FILE SUMMARY

**New Files:**
- `Mobile/components/YouTubePlayerModal.tsx`
- `Mobile/components/VideoButton.tsx`

**Modified Files:**
- `Mobile/components/RecipeDetailView.tsx` (add VideoButton rendering + imports)
- `Mobile/constants/i18n/en.json` (add watchVideo key)
- `Mobile/constants/i18n/bg.json` (add watchVideo key)
- `Mobile/components/RecipeDetailView.tsx` or similar (fix duplicate ingredients)

---

Generated: 2026-05-21
Priority: BLOCKING (duplicate ingredients break UI)
Complexity: MODERATE (fix + new features)
Time: 30-45 minutes