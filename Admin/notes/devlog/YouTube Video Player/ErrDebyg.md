# KetoCakR Mobile — Add Debug Logging for Error 153 Investigation

## GOAL

Add detailed console logs at every step to see exactly where Error 153 comes from.

---

## FILE 1: VideoButton.tsx

### Update with DEBUG logging:

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
          console.log('🎬 [VideoButton] Modal closed');
          setModalVisible(false);
        }}
      />
    </>
  );
};
```

---

## FILE 2: YouTubePlayerModal.tsx

### Update with DEBUG logging:

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

  React.useEffect(() => {
    console.log('🎬 [YouTubePlayerModal] Component mounted');
    console.log('🎬 [YouTubePlayerModal] visible:', visible);
    console.log('🎬 [YouTubePlayerModal] videoId:', videoId);
    
    return () => {
      console.log('🎬 [YouTubePlayerModal] Component unmounted');
    };
  }, [visible, videoId]);

  // Direct URI - no HTML wrapper
  const embedUrl = `https://www.youtube.com/embed/${videoId}?playsinline=1&controls=1`;
  console.log('🎬 [YouTubePlayerModal] embedUrl:', embedUrl);

  const handleLoadStart = () => {
    console.log('🎬 [YouTubePlayerModal] WebView - loadStart');
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    console.log('🎬 [YouTubePlayerModal] WebView - loadEnd');
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('🎬 [YouTubePlayerModal] WebView ERROR:', nativeEvent);
    console.error('  - code:', nativeEvent.code);
    console.error('  - description:', nativeEvent.description);
    
    // Check if this is Error 153
    if (nativeEvent.code === 153 || nativeEvent.description?.includes('153')) {
      console.error('🚨 ERROR 153 DETECTED!');
      setError(`Error 153: ${nativeEvent.description}`);
    } else {
      console.warn('🎬 Other error (not 153)');
    }
    
    setLoading(false);
  };

  const handleHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('🎬 [YouTubePlayerModal] HTTP ERROR:', nativeEvent);
    console.error('  - statusCode:', nativeEvent.statusCode);
    console.error('  - url:', nativeEvent.url);
    setError(`HTTP Error: ${nativeEvent.statusCode}`);
  };

  const handleMessage = (event: any) => {
    console.log('🎬 [YouTubePlayerModal] WebView Message:', event.nativeEvent.data);
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      onRequestClose={() => {
        console.log('🎬 [YouTubePlayerModal] onRequestClose triggered');
        onClose();
      }}
    >
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Close Button */}
        <TouchableOpacity 
          onPress={() => {
            console.log('🎬 [YouTubePlayerModal] Close button pressed');
            onClose();
          }}
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
            <Text style={{ color: '#fff', marginTop: 10, textAlign: 'center' }}>
              Loading video...
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
              Check console logs for details.
            </Text>
            <TouchableOpacity 
              onPress={() => {
                console.log('🎬 [YouTubePlayerModal] Error dismiss - closing modal');
                onClose();
              }}
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

        {/* WebView - DIRECT URI */}
        <WebView
          source={{ uri: embedUrl }}
          style={{ flex: 1 }}
          startInLoadingState={true}
          scalesPageToFit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          useWebKit={true}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onHttpError={handleHttpError}
          onMessage={handleMessage}
          onNavigationStateChange={(navState) => {
            console.log('🎬 [YouTubePlayerModal] Navigation state changed:', {
              url: navState.url,
              title: navState.title,
              loading: navState.loading,
            });
          }}
        />
      </View>
    </Modal>
  );
};
```

---

## FILE 3: RecipeDetailView.tsx

### Add logging where VideoButton is used:

Find where you render VideoButton and add:

```typescript
{sourceUrl ? (
  <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
    {(() => {
      console.log('🎬 [RecipeDetailView] Rendering VideoButton');
      console.log('🎬 [RecipeDetailView] sourceUrl:', sourceUrl);
      return <VideoButton sourceUrl={sourceUrl} />;
    })()}
  </View>
) : (
  (() => {
    console.log('🎬 [RecipeDetailView] No sourceUrl, VideoButton hidden');
    return null;
  })()
)}
```

---

## HOW TO USE THESE LOGS

1. **Clear cache:**
```bash
npx expo start --clear
```

2. **Open Expo Go on phone**

3. **Go to Ягодова панакота**

4. **Open Expo DevTools:**
   - Shake phone
   - Tap "Open DevTools"
   - Look at **Console** tab

5. **Click play button**

6. **Watch console for logs starting with 🎬**

---

## WHAT TO LOOK FOR

### Success flow:
```
🎬 [VideoButton] Play button pressed
🎬 [VideoButton] sourceUrl: https://youtube.com/shorts/3ifCfSIOyZY...
🎬 [VideoButton] extractYouTubeId - Input URL: https://youtube.com/shorts/3ifCfSIOyZY...
🎬 [VideoButton] extractYouTubeId - Extracted ID: 3ifCfSIOyZY
🎬 [VideoButton] Opening modal with videoId: 3ifCfSIOyZY
🎬 [YouTubePlayerModal] Component mounted
🎬 [YouTubePlayerModal] embedUrl: https://www.youtube.com/embed/3ifCfSIOyZY?playsinline=1&controls=1
🎬 [YouTubePlayerModal] WebView - loadStart
🎬 [YouTubePlayerModal] WebView - loadEnd
✅ Video plays
```

### Error 153 flow:
```
🎬 [YouTubePlayerModal] WebView ERROR: {...}
🚨 ERROR 153 DETECTED!
🎬 [YouTubePlayerModal] code: 153
🎬 [YouTubePlayerModal] description: ...
```

---

## COPY & PASTE THESE LOGS

When you see the error, copy the console output and paste it here:
- Look for lines starting with 🎬
- Include the ERROR lines
- Include any code/description fields

This will tell us exactly where the problem is!

---

Generated: 2026-05-21
Priority: HIGH (debugging)
Complexity: SIMPLE (add console.log)
Time: 5 minutes