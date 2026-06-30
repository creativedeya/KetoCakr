# KetoCakR Mobile — Fix YouTube Shorts: Add Referer Header

## PROBLEM

YouTube blocks embedding if WebView doesn't send HTTP `Referer` header.

Solution: Add Referer header to WebView requests.

---

## FILE: `Mobile/components/YouTubePlayerModal.tsx`

### STEP 1: Replace WebView with proper configuration

Instead of simple `source={{ uri: embedUrl }}`, use this approach with headers:

```typescript
// Generate embed URL with clean parameters (no &amp;)
const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1`;

console.log('🎬 [YouTubePlayerModal] embedUrl:', embedUrl);
console.log('🎬 [YouTubePlayerModal] Adding Referer header');

// Create headers with Referer
const headers = {
  'Referer': 'https://ketocakelab.com', // Your app domain
  'User-Agent': 'Mozilla/5.0 (Linux; Android) AppleWebKit/537.36',
};

<WebView
  source={{ 
    uri: embedUrl,
    headers: headers  // ← ADD THIS!
  }}
  style={{ flex: 1 }}
  startInLoadingState={true}
  scalesPageToFit={true}
  javaScriptEnabled={true}  // ← CRITICAL: Must be true
  domStorageEnabled={true}
  mediaPlaybackRequiresUserAction={false}
  allowsInlineMediaPlayback={true}
  useWebKit={true}
  
  onLoadStart={() => {
    console.log('🎬 [YouTubePlayerModal] WebView - loadStart');
    setLoading(true);
    setError(null);
  }}
  
  onLoadEnd={() => {
    console.log('🎬 [YouTubePlayerModal] WebView - loadEnd');
    console.log('🎬 [YouTubePlayerModal] Video should be playing now!');
    setLoading(false);
  }}
  
  onError={(syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('🎬 [YouTubePlayerModal] WebView ERROR:', nativeEvent);
    setError(`Error: ${nativeEvent.description}`);
    setLoading(false);
  }}
  
  onHttpError={(syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('🎬 [YouTubePlayerModal] HTTP ERROR:', nativeEvent);
    console.error('  statusCode:', nativeEvent.statusCode);
    setError(`HTTP Error: ${nativeEvent.statusCode}`);
  }}
  
  onMessage={(event) => {
    console.log('🎬 [YouTubePlayerModal] WebView Message:', event.nativeEvent.data);
  }}
  
  onNavigationStateChange={(navState) => {
    console.log('🎬 [YouTubePlayerModal] Navigation:', {
      url: navState.url,
      title: navState.title,
      loading: navState.loading,
    });
  }}
/>
```

---

## STEP 2: Verify URL format (no &amp;)

Make sure your embedUrl uses clean `&` (not `&amp;`):

**WRONG:**
```typescript
const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&amp;controls=1`;
```

**CORRECT:**
```typescript
const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1`;
```

The log showed `&amp;` which means HTML encoding - make sure you have clean `&`.

---

## STEP 3: Verify YouTube Video Settings

In YouTube Studio, make sure "Allow embedding" is enabled:

1. Go to YouTube Studio
2. Click "Content" (Съдържание)
3. Find your video (ID: KEgbtMHoDKM or your video ID)
4. Click pencil icon (Edit/Details)
5. Scroll to bottom
6. Click "SHOW MORE"
7. Find "License and rights ownership"
8. ✅ Check "Allow embedding"
9. Click "Save"

---

## COMPLETE YouTubePlayerModal.tsx

Here's the full corrected component:

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
  const [error, setError] = React.useState<string | null>(null);

  // Create embed URL with CLEAN parameters (no &amp;)
  const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1`;
  
  console.log('🎬 [YouTubePlayerModal] embedUrl:', embedUrl);
  console.log('🎬 [YouTubePlayerModal] Adding Referer header for YouTube');

  // Headers required by YouTube
  const headers = {
    'Referer': 'https://ketocakelab.com', // ← Your app domain
    'User-Agent': 'Mozilla/5.0 (Linux; Android) AppleWebKit/537.36',
  };

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
        {error && (
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
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              ❌ Video Failed to Load
            </Text>
            <Text style={{ color: 'white', fontSize: 14, marginVertical: 10 }}>
              {error}
            </Text>
            <Text style={{ color: '#ccc', fontSize: 12 }}>
              Make sure "Allow embedding" is enabled in YouTube Studio.
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              style={{
                marginTop: 15,
                paddingVertical: 10,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 5,
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* WebView with Referer Header */}
        <WebView
          source={{ 
            uri: embedUrl,
            headers: headers  // ← CRITICAL: Add Referer header
          }}
          style={{ flex: 1 }}
          startInLoadingState={true}
          scalesPageToFit={true}
          javaScriptEnabled={true}  // ← CRITICAL: Must be true
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          useWebKit={true}
          
          onLoadStart={() => {
            console.log('🎬 [YouTubePlayerModal] WebView - loadStart');
            setLoading(true);
            setError(null);
          }}
          
          onLoadEnd={() => {
            console.log('🎬 [YouTubePlayerModal] WebView - loadEnd');
            console.log('✅ Video should be playing now!');
            setLoading(false);
          }}
          
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('🎬 [YouTubePlayerModal] WebView ERROR:', nativeEvent);
            setError(`Error: ${nativeEvent.description}`);
            setLoading(false);
          }}
          
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('🎬 [YouTubePlayerModal] HTTP ERROR:', nativeEvent);
            setError(`HTTP Error ${nativeEvent.statusCode}`);
          }}
          
          onNavigationStateChange={(navState) => {
            console.log('🎬 [YouTubePlayerModal] Navigation:', navState.url, navState.title);
          }}
        />
      </View>
    </Modal>
  );
};
```

---

## TESTING

1. **Update YouTubePlayerModal.tsx with code above**
2. **In YouTube Studio: Enable "Allow embedding" for your video**
3. **Clear cache:** `npx expo start --clear`
4. **Open Ягодова панакота**
5. **Click play button**
6. **Video should play! ✅**

---

## KEY CHANGES

✅ Added `headers` with `Referer`
✅ Clean URL with `&` (not `&amp;`)
✅ `javaScriptEnabled={true}` confirmed
✅ Error message tells user to check YouTube Studio

---

Generated: 2026-05-21
Priority: CRITICAL (fixes YouTube embedding)
Complexity: SIMPLE (add headers)
Time: 5 minutes