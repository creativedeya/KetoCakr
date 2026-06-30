# KetoCakR Mobile — PRECISE Fix: Video Button Right Corner + WebView Error 153

## LAYOUT (Desired)

```
┌─────────────────────────────┐
│ Ягодова панакота      ❤️  ↗️ │
├─────────────────────────────┤
│ 195 kcal | 1g | 16g | 11g  │ ← Nutrition badge
├─────────────────────────────┤
│ [DESSERT IMAGE]         [▶] │ ← Play button in right corner
│                             │
├─────────────────────────────┤
│ ПОРЦИИ        ЦЕНА          │
│ 3.82 €               1.27 € │
└─────────────────────────────┘
```

---

## PROBLEM 1: Button Placement

Current: Button is centered, takes full width
Desired: Button is small circle in RIGHT corner, between nutrition and price section

---

## SOLUTION

### File: `Mobile/components/RecipeDetailView.tsx`

### STEP 1: Find and Remove Old Video Button Code

Search for:
```typescript
{sourceUrl && (
  <View style={{ 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    backgroundColor: 'white',
    alignItems: 'center'
  }}>
    <VideoButton sourceUrl={sourceUrl} />
  </View>
)}
```

**DELETE this entire block if you find it.**

---

### STEP 2: Find Nutrition Badge

Search for:
```typescript
{/* Nutrition Badge */}
<View style={styles.nutritionBadge}>
```

Or search for: `195 kcal` or `totalCalories`

This is where nutrition shows (kcal, protein, fat, carbs).

---

### STEP 3: AFTER Nutrition Badge, ADD Video Button

**Find the closing `</View>` of nutrition badge.**

**Right after it, ADD this code:**

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

---

### STEP 4: Update VideoButton Component

**File:** `Mobile/components/VideoButton.tsx`

**Replace ENTIRE component with this:**

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
      {/* Small Circular Play Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
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
        <Ionicons name="play" size={28} color="white" />
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

## PROBLEM 2: WebView Error 153

Error 153 appears when clicking video button.

### File: `Mobile/components/YouTubePlayerModal.tsx`

**Replace ENTIRE component with this improved version:**

```typescript
import React from 'react';
import { Modal, View, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface YouTubePlayerModalProps {
  visible: boolean;
  videoId: string;
  onClose: () => void;
}

export const YouTubePlayerModal = ({ visible, videoId, onClose }: YouTubePlayerModalProps) => {
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // HTML for YouTube player - optimized for mobile
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 100%;
            height: 100%;
            background: #000;
          }
          .container {
            width: 100%;
            height: 100%;
            position: relative;
          }
          iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&playsinline=1&rel=0&fs=1&iv_load_policy=3"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            frameborder="0"
            loading="lazy"
          ></iframe>
        </div>
        <script>
          window.addEventListener('error', function(e) {
            console.error('YouTube Error:', e);
          });
        </script>
      </body>
    </html>
  `;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="fullScreen">
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Close Button */}
        <TouchableOpacity 
          onPress={onClose} 
          style={{ 
            position: 'absolute', 
            top: 50, 
            right: 20, 
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: 8,
            borderRadius: 20,
          }}
        >
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>

        {/* Loading Spinner */}
        {loading && (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            zIndex: 50,
            transform: [{ translateX: -30 }, { translateY: -30 }],
          }}>
            <ActivityIndicator size={60} color="#fff" />
          </View>
        )}

        {/* Error Message */}
        {errorMsg && (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '5%',
            right: '5%',
            backgroundColor: 'rgba(255, 0, 0, 0.9)',
            padding: 20,
            borderRadius: 10,
            zIndex: 50,
          }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
              Error Loading Video
            </Text>
            <Text style={{ color: 'white', fontSize: 14 }}>
              {errorMsg}
            </Text>
            <Text style={{ color: '#ccc', fontSize: 12, marginTop: 10 }}>
              Please try again or check your connection.
            </Text>
          </View>
        )}

        {/* WebView */}
        <WebView
          source={{ html: htmlContent }}
          style={{ flex: 1, backgroundColor: '#000' }}
          startInLoadingState={true}
          scalesPageToFit={false}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          useWebKit={true}
          originWhitelist={['*']}
          onLoadStart={() => {
            setLoading(true);
            setErrorMsg(null);
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log('WebView Error Details:', nativeEvent);
            
            // Only show error if it's critical
            if (nativeEvent.code !== -1001) {  // Ignore timeout errors
              setErrorMsg(nativeEvent.description || 'Failed to load video');
            }
            setLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.log('HTTP Error:', nativeEvent);
            setErrorMsg(`HTTP Error: ${nativeEvent.statusCode}`);
          }}
        />
      </View>
    </Modal>
  );
};
```

---

## VERIFICATION CHECKLIST

### Layout
- [ ] Nutrition badge is visible (195 kcal, 1g, 16g, 11g)
- [ ] Video button is BELOW nutrition badge
- [ ] Video button is small circular play button (60x60px)
- [ ] Video button is in RIGHT corner
- [ ] Price section is BELOW video button
- [ ] No overlapping elements
- [ ] Proper spacing

### Video Player
- [ ] Click play button → modal opens
- [ ] NO Error 153 appears
- [ ] YouTube video loads
- [ ] Video autoplays
- [ ] Can pause/resume
- [ ] Can seek
- [ ] Can go fullscreen (landscape)
- [ ] Close button (X) works
- [ ] Returns to recipe when closed

### Error Handling
- [ ] Loading spinner shows while loading
- [ ] If error occurs, shows error message (not Error 153)
- [ ] Error doesn't break the modal
- [ ] Can close modal even if error occurs

---

## TESTING

1. **Open Mobile app**
2. **Go to Ягодова панакота**
3. **Look for small red circular play button in right corner**
4. **Verify position:**
   - Below nutrition badge ✅
   - Above price section ✅
   - In right corner ✅
5. **Click button**
6. **Modal opens - NO Error 153**
7. **Video plays smoothly**

---

## IF ERROR 153 STILL APPEARS

Check console log for exact error message. The improved YouTubePlayerModal should give better error details.

Common causes:
- Network issue
- YouTube iframe restrictions (rare)
- Device-specific WebView issue

Try:
1. Reload app
2. Clear Expo cache: `npx expo start -c`
3. Check internet connection
4. Try different YouTube video (test with public video)

---

Generated: 2026-05-21
Priority: HIGH (UI + error fix)
Complexity: MODERATE (layout + WebView tuning)
Time: 20 minutes