# KetoCakR Mobile — Add YouTube Video Player to RecipeDetailView

## Feature
Add YouTube video embedding between hero image and nutrition badge in RecipeDetailView.

**Visual placement:**
```
[HERO IMAGE]
    ↓
[WATCH VIDEO BUTTON] ← NEW
    ↓
[NUTRITION BADGE]
```

## Requirements

### 1. Display Video Button (if source_url exists)

**Condition:** Show video button ONLY if recipe has `source_url` field populated.

**Button appearance:**
- YouTube thumbnail (extracted from URL)
- Play button overlay (▶)
- Text: "WATCH VIDEO" or "ПОСМОТРЕТЬ ВИДЕО" (bilingual)
- Subtitle: "by @blagocake" or recipe creator

**Location:** Between hero image and nutrition badge

### 2. Extract YouTube Video ID

From `source_url`, extract video ID:

```typescript
// Example URLs:
// https://www.youtube.com/watch?v=dQw4w9WgXcQ
// https://youtu.be/dQw4w9WgXcQ
// https://www.youtube.com/embed/dQw4w9WgXcQ

const extractYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
};
```

### 3. YouTube Thumbnail

Get thumbnail from video ID:

```typescript
const videoId = extractYouTubeId(source_url);
const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
// Fallback: hqdefault.jpg (always available)
// const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
```

### 4. Video Playback Options

**Option A: WebView Embed (RECOMMENDED)**
- Use `react-native-webview` (already in Expo)
- Embed YouTube player in fullscreen modal
- Native feel, works on Android/iOS

**Option B: External Link**
- Open URL with Linking.openURL()
- Opens YouTube app or browser
- User leaves app

**Recommendation:** Use **Option A** (WebView) for better UX.

### 5. Modal Implementation

Create new component: `Mobile/components/YouTubePlayerModal.tsx`

```typescript
import React from 'react';
import { Modal, View, TouchableOpacity, Text } from 'react-native';
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

### 6. Video Button Component

Create: `Mobile/components/VideoButton.tsx`

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

### 7. Integrate into RecipeDetailView

File: `Mobile/components/RecipeDetailView.tsx`

**Find:** Where hero image is rendered (around line where recipe image is displayed)

**Add after hero image:**

```typescript
{/* Hero Image */}
<Image
  source={{ uri: recipe.image_url }}
  style={{ width: '100%', height: 250 }}
/>

{/* VIDEO BUTTON - ADD HERE */}
{recipe.source_url && <VideoButton sourceUrl={recipe.source_url} />}

{/* Nutrition Badge */}
<View style={{ ... }}>
  {/* nutrition content */}
</View>
```

### 8. Translation Keys

Add to `Mobile/constants/i18n/en.json`:
```json
{
  "watchVideo": "WATCH VIDEO",
  "by": "by"
}
```

Add to `Mobile/constants/i18n/bg.json`:
```json
{
  "watchVideo": "ГЛЕДАЙ ВИДЕО",
  "by": "от"
}
```

### 9. Dependencies Check

Verify these are installed:
```bash
npm list react-native-webview
npm list expo
npm list @expo/vector-icons
```

If `react-native-webview` is missing:
```bash
npx expo install react-native-webview
```

### 10. Test Cases

**Test 1: Recipe WITH video**
- [ ] Open Ягодова панакота (has source_url)
- [ ] Video button appears between image and nutrition
- [ ] Thumbnail loads correctly
- [ ] Play button visible in center
- [ ] Text "WATCH VIDEO" / "ГЛЕДАЙ ВИДЕО" shows
- [ ] Click button → modal opens
- [ ] YouTube video plays in fullscreen
- [ ] Close button (X) works
- [ ] Modal closes, back to recipe

**Test 2: Recipe WITHOUT video**
- [ ] Open any complex recipe (no source_url)
- [ ] Video button NOT visible
- [ ] Layout looks normal

**Test 3: Bilingual**
- [ ] Switch language BG → EN
- [ ] Text changes to "WATCH VIDEO" (EN)
- [ ] Switch back to BG
- [ ] Text shows "ГЛЕДАЙ ВИДЕО" (BG)

**Test 4: Video Playback**
- [ ] Play video
- [ ] Can pause/resume
- [ ] Can seek through video
- [ ] Subtitles visible (if YouTube subtitles enabled)
- [ ] Close button responsive

## File Structure

```
Mobile/
├── components/
│   ├── RecipeDetailView.tsx          (MODIFY - add VideoButton import + render)
│   ├── VideoButton.tsx               (NEW - video button with modal trigger)
│   └── YouTubePlayerModal.tsx        (NEW - YouTube WebView modal)
├── constants/
│   ├── i18n/
│   │   ├── en.json                   (ADD - watchVideo key)
│   │   └── bg.json                   (ADD - watchVideo key)
```

## Verification Checklist

- [ ] VideoButton component created
- [ ] YouTubePlayerModal component created
- [ ] VideoButton imported in RecipeDetailView
- [ ] VideoButton renders when source_url exists
- [ ] VideoButton hidden when source_url is null/empty
- [ ] YouTube video ID extraction works
- [ ] Thumbnail URL correct
- [ ] Play button visible with correct color (Colors.primary.main)
- [ ] Modal opens on button click
- [ ] YouTube video plays in WebView
- [ ] Close button (X) closes modal
- [ ] Bilingual text works (watchVideo i18n key)
- [ ] No console errors
- [ ] App runs on Android/iOS
- [ ] Mobile testing on real device (or Expo Go)

## Expected Result

**Screenshot behavior:**

1. User opens Ягодова панакота recipe
2. Sees hero image at top
3. Below image: Video button with thumbnail, play icon, "WATCH VIDEO" text
4. Below video: Nutrition badge (195 kcal, 1g protein, etc.)
5. User taps video → fullscreen YouTube player
6. Video plays with subtitles (BG + EN)
7. User taps X → returns to recipe

## Notes

- **Unlisted YouTube videos** work fine in WebView (no public discovery)
- **Subtitles** handled by YouTube (manage in YouTube studio)
- **Autoplay** enabled in iframe (remove if needed)
- **modestbranding=1** hides YouTube logo (more discreet)
- Works on both Android and iOS

---

Generated: 2026-05-20
Priority: HIGH (core feature for simply recipes)
Complexity: MODERATE (new components + WebView integration)
Time: 30-45 minutes