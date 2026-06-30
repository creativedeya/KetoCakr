# KetoCakR Mobile — PRECISE Fix: Small Discrete Video Button in Image Corner

## DESIRED LAYOUT

Button should be positioned in **BOTTOM-RIGHT CORNER OF THE HERO IMAGE** - like in your reference photo.

```
┌─────────────────────────────┐
│                             │
│   [HERO IMAGE]              │
│                             │
│                         [▶] │ ← Small button in corner
└─────────────────────────────┘
│ 195 kcal | 1g | 16g | 11g  │ ← Nutrition below
```

---

## SOLUTION

### File 1: `Mobile/components/RecipeDetailView.tsx`

### STEP 1: Find Hero Image Code

Search for:
```typescript
{recipe.image_url && (
  <Image
    source={{ uri: recipe.image_url }}
```

### STEP 2: REPLACE with Video Button OVERLAY

**CHANGE FROM:**
```typescript
{recipe.image_url && (
  <Image
    source={{ uri: recipe.image_url }}
    style={{ width: '100%', height: 250 }}
  />
)}
```

**CHANGE TO:**
```typescript
{recipe.image_url && (
  <View style={{ position: 'relative', width: '100%', height: 250 }}>
    <Image
      source={{ uri: recipe.image_url }}
      style={{ width: '100%', height: '100%' }}
    />
    {/* Video Button Overlay - Bottom Right Corner */}
    {sourceUrl && (
      <View style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        zIndex: 10,
      }}>
        <VideoButton sourceUrl={sourceUrl} />
      </View>
    )}
  </View>
)}
```

### STEP 3: DELETE the old video button section

Search for and DELETE this code if it exists:

```typescript
{/* Video Button - Small Circle in Right Corner */}
{sourceUrl && (
  <View style={{
    height: 120,
    paddingRight: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
  }}>
    <VideoButton sourceUrl={sourceUrl} />
  </View>
)}
```

**DELETE entire block!**

---

### File 2: `Mobile/components/VideoButton.tsx`

### REPLACE ENTIRE component with this TINY version:

```typescript
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { YouTubePlayerModal } from './YouTubePlayerModal';
import Colors from '@/constants/Colors';

interface VideoButtonProps {
  sourceUrl: string;
}

export const VideoButton = ({ sourceUrl }: VideoButtonProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const videoId = extractYouTubeId(sourceUrl);
  if (!videoId) return null;

  return (
    <>
      {/* Tiny Play Button - Discrete Corner Icon */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: Colors.primary.main,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 3,
          elevation: 4,
        }}
      >
        <Iconicons name="play" size={20} color="white" />
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

---

## KEY CHANGES

**Old button:** 60x60px, centered below image
**New button:** 44x44px, overlaid in image corner

| Aspect | Old | New |
|--------|-----|-----|
| Size | 60x60 | 44x44 |
| Position | Below image | In corner of image |
| Discrete | No | YES ✅ |
| Space taken | Full row | None (overlay) |

---

## VERIFICATION CHECKLIST

- [ ] Find hero image code
- [ ] Wrap image in `<View position='relative'>`
- [ ] Add VideoButton inside with absolute positioning
- [ ] Bottom: 12, Right: 12
- [ ] Delete old video button section below image
- [ ] VideoButton component is 44x44px
- [ ] Icon size is 20 (not 28)
- [ ] Test on simply recipe
- [ ] Button appears in BOTTOM-RIGHT corner of image
- [ ] No overlap with image
- [ ] Click button → video plays
- [ ] Button is discrete/small

---

## TESTING

1. **Open Mobile app**
2. **Go to Ягодова панакота**
3. **Should see:**
   - Hero image fills top area
   - Small red play button in BOTTOM-RIGHT corner
   - Button is tiny and doesn't take space
   - Nutrition badge is directly below image
4. **Click button**
5. **Video plays (no Error 153)**

---

## RESULT

Should look like your reference photo:
- Tiny button in corner ✅
- Discrete (doesn't dominate) ✅
- In bottom-right of image ✅
- No space wasted ✅

---

Generated: 2026-05-21
Priority: HIGH (UI refinement)
Complexity: SIMPLE (change position + size)
Time: 10 minutes