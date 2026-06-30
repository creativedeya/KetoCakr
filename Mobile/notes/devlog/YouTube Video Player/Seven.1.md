# KetoCakR Mobile — THREE Tasks: Fix Duplicate Video + Redesign Button + Fix WebView Error

---

## TASK 1: Remove Duplicate Video Button

### PROBLEM
Video button appears TWO times on the recipe detail page instead of one.

### FILE
`Mobile/components/RecipeDetailView.tsx` - Line 858

### CURRENT CODE (WRONG - shows video twice)
```typescript
{sourceUrl ? (
  <View style={styles.videoSection}>
    <VideoButton sourceUrl={sourceUrl} />
  </View>
) : null}
```

This code appears in the file TWICE - that's why video shows twice!

### SOLUTION

**Search in RecipeDetailView.tsx for:**
```
{sourceUrl ? (
  <View style={styles.videoSection}>
    <VideoButton sourceUrl={sourceUrl} />
  </View>
) : null}
```

**Count how many times it appears.**

**If appears 2+ times:** DELETE all EXCEPT the FIRST occurrence.

**Keep ONLY ONE instance** - the first one you find.

### VERIFICATION
- [ ] Search for `{sourceUrl ?` in file
- [ ] Should find ONLY 1 match
- [ ] Video button shows only ONCE on page
- [ ] No duplicate rendering

---

## TASK 2: Redesign VideoButton - Discrete Icon Style

### PROBLEM
Current video button is too large and takes too much attention. 

**Desired:** Discrete small icon overlay on hero image itself (like play button in corner).

### FILE
`Mobile/components/VideoButton.tsx`

### REPLACEMENT

**Current component renders:** Full card with thumbnail + large play button

**New design should render:** ONLY a small play icon overlay in TOP-RIGHT corner of hero image

### STEP 1: Find Current VideoButton Code

Should look like:
```typescript
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
  <Image ... />
  {/* Play Button Overlay */}
  <View ... >
```

### STEP 2: REPLACE Entire Component

Replace the ENTIRE `VideoButton` component with this NEW code:

```typescript
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
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
      {/* Discrete Play Icon - positioned absolutely over image */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 5,
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: Colors.primary.main,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Ionicons name="play" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal for full-screen video */}
      <YouTubePlayerModal
        visible={modalVisible}
        videoId={videoId}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};
```

### STEP 3: Update RecipeDetailView Integration

The VideoButton MUST be positioned as OVERLAY on hero image, not below it.

**In RecipeDetailView.tsx, find:**
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
      style={{ width: '100%', height: 250 }}
    />
    {/* Video button overlay - appears in TOP-RIGHT corner */}
    {sourceUrl && <VideoButton sourceUrl={sourceUrl} />}
  </View>
)}

{/* REMOVE the old VideoButton code from below image */}
{/* Delete this if it exists: */}
{/* {sourceUrl ? ( */}
{/*   <View style={styles.videoSection}> */}
{/*     <VideoButton sourceUrl={sourceUrl} /> */}
{/*   </View> */}
{/* ) : null} */}
```

### VERIFICATION
- [ ] Hero image displays normally
- [ ] Small play icon visible in TOP-RIGHT corner
- [ ] Icon color is Colors.primary.main (Ruby Red #A80048)
- [ ] Icon has subtle shadow
- [ ] Click icon → modal opens
- [ ] Icon is discrete (doesn't dominate the image)
- [ ] No duplicate video buttons
- [ ] Works on both vertical and horizontal videos

### RESULT
Visual should be:
```
┌─────────────────────────────┐
│  [HERO IMAGE OF DESSERT]  ▶ │ ← Small play icon in corner
│                             │
│                             │
└─────────────────────────────┘
Recipe Title
Nutrition Badge
Ingredients
```

---

## TASK 3: Fix WebView Error 153

### PROBLEM
When clicking video button, error 153 appears: "Error configuring video player"

This is WebView/YouTube iframe configuration issue.

### FILE
`Mobile/components/YouTubePlayerModal.tsx`

### ROOT CAUSE
YouTube iframe parameters might not be compatible with react-native-webview on all devices.

### SOLUTION

**Find the WebView component:**
```typescript
<WebView
  source={{
    html: `...`
  }}
  startInLoadingState={true}
  scalesPageToFit
/>
```

**REPLACE with this UPDATED version:**

```typescript
<WebView
  source={{
    html: `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
          <style>
            * { margin: 0; padding: 0; }
            body { width: 100%; height: 100%; background: #000; overflow: hidden; }
            iframe { width: 100%; height: 100%; border: none; display: block; }
          </style>
        </head>
        <body>
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&playsinline=1&rel=0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
            allowFullScreen={true}
            frameBorder="0"
          ></iframe>
        </body>
      </html>
    `,
  }}
  startInLoadingState={true}
  scalesPageToFit={true}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  mediaPlaybackRequiresUserAction={false}
  allowsFullscreenVideo={true}
  useWebKit={true}
  onError={(error) => {
    console.log('WebView Error:', error.nativeEvent);
  }}
/>
```

### KEY CHANGES
- ✅ Added `playsinline=1` (for mobile autoplay)
- ✅ Added `rel=0` (no related videos)
- ✅ Added proper viewport meta tag
- ✅ Added `javaScriptEnabled={true}`
- ✅ Added `mediaPlaybackRequiresUserAction={false}`
- ✅ Added `allowsFullscreenVideo={true}`
- ✅ Added `useWebKit={true}` (iOS compatibility)
- ✅ Added `onError` handler for debugging

### VERIFICATION
- [ ] Find YouTubePlayerModal.tsx
- [ ] Update WebView source HTML
- [ ] Update WebView props
- [ ] Test clicking video button
- [ ] YouTube modal opens WITHOUT error 153
- [ ] Video plays smoothly
- [ ] Can pause/resume
- [ ] Can seek
- [ ] Can go fullscreen
- [ ] Close button works

### IF STILL ERROR
Check console log for detailed error:
```
WebView Error: { ... }
```

Report the error message for further debugging.

---

## SUMMARY OF ALL THREE TASKS

**File 1: RecipeDetailView.tsx**
- Remove duplicate VideoButton code (keep only 1 instance)
- Wrap hero image in View with position: relative
- Move VideoButton to overlay on image

**File 2: VideoButton.tsx**
- Replace entire component with NEW discrete icon design
- Small circular play button in TOP-RIGHT corner
- Positioned absolutely over image

**File 3: YouTubePlayerModal.tsx**
- Update WebView HTML structure
- Add missing WebView props
- Add error handler

---

## EXECUTION ORDER
1. Task 1: Remove duplicates (RecipeDetailView)
2. Task 2: Redesign button (VideoButton)
3. Task 3: Fix WebView error (YouTubePlayerModal)

---

Generated: 2026-05-21
Priority: HIGH (duplicate + error blocking feature)
Complexity: MODERATE (multiple component updates)
Time: 30-45 minutes