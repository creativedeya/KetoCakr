# KetoCakR Mobile — Remove Debug Logging from YouTube Components

## GOAL

Remove all `console.log`, `console.error`, `console.warn` statements from:
1. `VideoButton.tsx`
2. `YouTubePlayerModal.tsx`

Keep only essential error handling (if needed for production debugging).

---

## FILE 1: `Mobile/components/VideoButton.tsx`

### REMOVE all console.log statements

**CURRENT (with debug logs):**
```typescript
const extractYouTubeId = (url: string): string | null => {
  console.log('🎬 [VideoButton] extractYouTubeId - Input URL:', url);
  
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/
  );
  
  const videoId = match ? match[1] : null;
  console.log('🎬 [VideoButton] extractYouTubeId - Extracted ID:', videoId);
  
  return videoId;
};

const handlePlayPress = () => {
  console.log('🎬 [VideoButton] Play button pressed');
  console.log('🎬 [VideoButton] sourceUrl:', sourceUrl);
  
  const videoId = extractYouTubeId(sourceUrl);
  console.log('🎬 [VideoButton] videoId extracted:', videoId);
  
  if (videoId) {
    console.log('🎬 [VideoButton] Opening modal with videoId:', videoId);
    setModalVisible(true);
  } else {
    console.error('🎬 [VideoButton] ERROR: Could not extract video ID!');
  }
};

const videoId = extractYouTubeId(sourceUrl);

if (!videoId) {
  console.warn('🎬 [VideoButton] WARN: No valid videoId, not rendering button');
  return null;
}
```

**CHANGE TO (clean):**
```typescript
const extractYouTubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
};

const handlePlayPress = () => {
  const videoId = extractYouTubeId(sourceUrl);
  
  if (videoId) {
    setModalVisible(true);
  }
};

const videoId = extractYouTubeId(sourceUrl);

if (!videoId) {
  return null;
}
```

### COMPLETE CLEAN FILE: `Mobile/components/VideoButton.tsx`

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

  const handlePlayPress = () => {
    const videoId = extractYouTubeId(sourceUrl);
    if (videoId) {
      setModalVisible(true);
    }
  };

  const videoId = extractYouTubeId(sourceUrl);
  if (!videoId) return null;

  return (
    <>
      <TouchableOpacity
        onPress={handlePlayPress}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: Colors.primary.main,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
          elevation: 3,
        }}
      >
        <Ionicons name="play" size={24} color="white" />
      </TouchableOpacity>

      <YouTubePlayerModal
        visible={modalVisible}
        videoId={videoId}
        onClose={() => {
          setModalVisible(false);
        }}
      />
    </>
  );
};
```

---

## FILE 2: `Mobile/components/YouTubePlayerModal.tsx`

### REMOVE all console statements

**Key areas with console.log to REMOVE:**

1. In `buildEmbedUrl()`:
```typescript
// REMOVE:
console.log('🎬 [YouTubePlayerModal] Built embed URL:');
console.log(`  videoId: ${id}`);
console.log(`  language: ${lang}`);
console.log(`  url: ${embedUrl}`);
```

2. In `useEffect()`:
```typescript
// REMOVE:
console.log('🎬 [YouTubePlayerModal] Component mounted');
console.log('🎬 [YouTubePlayerModal] visible:', visible);
console.log('🎬 [YouTubePlayerModal] videoId:', videoId);
// ... etc
```

3. In event handlers:
```typescript
// REMOVE:
console.log('🎬 [YouTubePlayerModal] WebView - loadStart');
console.log('🎬 [YouTubePlayerModal] WebView - loadEnd');
console.log('🎬 [YouTubePlayerModal] WebView ERROR:', nativeEvent);
// ... etc
```

### COMPLETE CLEAN FILE: `Mobile/components/YouTubePlayerModal.tsx`

```typescript
import React from 'react';
import { Modal, View, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface YouTubePlayerModalProps {
  visible: boolean;
  videoId: string;
  onClose: () => void;
  language?: 'en' | 'bg';
}

export const YouTubePlayerModal = ({ 
  visible, 
  videoId, 
  onClose,
  language = 'en' 
}: YouTubePlayerModalProps) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buildEmbedUrl = (id: string, lang: 'en' | 'bg'): string => {
    const baseUrl = `https://www.youtube.com/embed/${id}`;
    
    const params = new URLSearchParams({
      autoplay: '1',
      controls: '1',
      modestbranding: '1',
      playsinline: '1',
      cc_load_policy: '1',
      hl: lang === 'bg' ? 'bg' : 'en',
      rel: '0',
      fs: '1',
      iv_load_policy: '3',
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const embedUrl = buildEmbedUrl(videoId, language);

  const headers = {
    'Referer': 'https://ketocakelab.com',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; AppleWebKit/537.36)',
    'Accept-Language': language === 'bg' ? 'bg-BG,bg;q=0.9' : 'en-US,en;q=0.9',
  };

  const injectedJavaScript = `
    (function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'READY',
        message: 'Page loaded'
      }));
    })();
    true;
  `;

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    const errorMsg = nativeEvent.description || 'Unknown error';
    
    if (errorMsg.includes('153')) {
      setError('YouTube blocked this video. Check if "Allow embedding" is enabled in YouTube Studio.');
    } else if (errorMsg.includes('refused')) {
      setError('Video access denied. The video may be private or region-restricted.');
    } else {
      setError(`Failed to load video: ${errorMsg}`);
    }
    
    setLoading(false);
  };

  const handleMessage = (event: any) => {
    try {
      JSON.parse(event.nativeEvent.data);
    } catch (e) {
      // Silent fail - not a JSON message
    }
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
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
          <Iconicons name="close" size={32} color="white" />
        </TouchableOpacity>

        {/* Loading Spinner */}
        {loading && (
          <View style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            zIndex: 50,
            marginLeft: -30,
            marginTop: -30,
          }}>
            <ActivityIndicator size={60} color="#fff" />
            <Text style={{ color: '#fff', marginTop: 10, textAlign: 'center' }}>
              Loading recipe video...
            </Text>
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
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
              ❌ Video Failed to Load
            </Text>
            <Text style={{ color: 'white', fontSize: 14, marginBottom: 10 }}>
              {error}
            </Text>
            <Text style={{ color: '#ccc', fontSize: 12 }}>
              If the problem persists, check YouTube Studio settings.
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

        {/* WebView */}
        <WebView
          source={{ 
            uri: embedUrl,
            headers: headers,
          }}
          style={{ flex: 1 }}
          startInLoadingState={true}
          scalesPageToFit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          useWebKit={true}
          injectedJavaScript={injectedJavaScript}
          onLoadStart={() => {
            setLoading(true);
            setError(null);
          }}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setError(`HTTP Error ${nativeEvent.statusCode}: Unable to load video`);
          }}
          onMessage={handleMessage}
        />
      </View>
    </Modal>
  );
};
```

---

## WHAT WAS REMOVED

✅ All `console.log()` statements
✅ All `console.error()` statements  
✅ All `console.warn()` statements
✅ All debug prefix emojis (🎬, 🚨, etc.)
✅ All detailed logging in event handlers
✅ All navigation logging

## WHAT WAS KEPT

✅ Error messages displayed to user (in UI)
✅ Error handling logic
✅ All functionality

---

## RESULT

- Cleaner console output
- No debug noise
- Professional production code
- Same functionality
- Better performance (fewer console operations)

---

## TESTING

1. **Update both files**
2. **Clear cache:** `npx expo start --clear`
3. **Test video playback**
4. **Open console** - should be clean (no 🎬 logs)
5. **Verify video still works**

---

Generated: 2026-05-21
Priority: MEDIUM (code cleanup)
Complexity: TRIVIAL (remove console.log)
Time: 5 minutes