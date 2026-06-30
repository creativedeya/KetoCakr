# KetoCakR Mobile — Fix Logo Overlay - Show Only During Loading

## PROBLEM

Logo stays visible after video loads. We want:
- ✅ Logo shows while video is loading
- ✅ Logo disappears when video starts playing
- ✅ Video starts from beginning (no skip)

---

## SOLUTION

### FILE: `Mobile/components/YouTubePlayerModal.tsx`

### STEP 1: Remove `start` parameter from URL

**CHANGE FROM:**
```typescript
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
  start: '3',  // ← REMOVE THIS LINE
});
```

**CHANGE TO:**
```typescript
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
  // No start parameter - video starts from beginning
});
```

---

### STEP 2: Update Logo Logic

Logo should hide **immediately when video starts playing**, not after delay.

**CHANGE handleLoadEnd:**

```typescript
const handleLoadEnd = () => {
  setLoading(false);
  
  // Hide logo immediately when video is ready to play
  logoOpacity.setValue(0);
};
```

Or with smooth transition:

```typescript
const handleLoadEnd = () => {
  setLoading(false);
  
  // Fade out logo smoothly when video starts
  Animated.timing(logoOpacity, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  }).start();
};
```

---

### STEP 3: Ensure Logo Shows During Loading

Make sure logo is visible while loading:

```typescript
React.useEffect(() => {
  if (visible) {
    // Reset logo to visible when modal opens
    logoOpacity.setValue(1);
  }
}, [visible]);
```

---

## COMPLETE UPDATED FILE: `Mobile/components/YouTubePlayerModal.tsx`

```typescript
import React from 'react';
import { Modal, View, TouchableOpacity, ActivityIndicator, Text, Animated, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { Iconicons } from '@expo/vector-icons';

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
  const [logoOpacity] = React.useState(new Animated.Value(1));

  const buildEmbedUrl = (id: string, lang: 'en' | 'bg'): string => {
    const baseUrl = `https://www.youtube.com/embed/${id}`;
    
    // NO start parameter - video starts from beginning
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

  // BLOCK EXTERNAL LINKS - Keep users in app
  const injectedJavaScript = `
    (function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'READY',
        message: 'Page loaded'
      }));

      document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        
        if (link) {
          const href = link.getAttribute('href');
          
          if (href && (href.includes('youtube.com') || href.includes('youtu.be') || href.includes('//www.youtube.com'))) {
            e.preventDefault();
            e.stopPropagation();
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'LINK_BLOCKED',
              url: href
            }));
            
            return false;
          }
        }
      }, true);
    })();
    true;
  `;

  const handleBlockedLink = () => {
    // User tried to click YouTube logo/link - silently block
  };

  const handleLoadEnd = () => {
    setLoading(false);
    
    // Hide logo immediately when video is loaded and ready to play
    Animated.timing(logoOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
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
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'LINK_BLOCKED') {
        handleBlockedLink();
      }
    } catch (e) {
      // Not JSON message, ignore
    }
  };

  React.useEffect(() => {
    if (visible) {
      // Reset logo to visible when modal opens
      logoOpacity.setValue(1);
    }
  }, [visible, logoOpacity]);

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

        {/* KetoCakR Logo - Shows only during loading */}
        <Animated.View
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            zIndex: 30,
            marginLeft: -50,
            marginTop: -50,
            opacity: logoOpacity,
          }}
        >
          <Image
            source={require('@/assets/images/logo.png')}
            style={{
              width: 100,
              height: 100,
              resizeMode: 'contain',
            }}
          />
        </Animated.View>

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

        {/* WebView - Starts from beginning */}
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

## WHAT CHANGED

✅ **Removed `start=3`** - Video now starts from beginning
✅ **Logo hides on loadEnd** - Logo disappears when video is ready
✅ **Logo shows during loading** - Visible while WebView is loading
✅ **Smooth fade** - Logo fades out nicely (300ms)

---

## USER EXPERIENCE

1. User clicks play button
2. Modal opens - **KetoCakR logo visible**
3. Video is loading - **Logo stays visible**
4. Video is ready - **Logo fades out smoothly**
5. **Video plays from beginning** ✅
6. Full YouTube player visible (YouTube logo at top-left)

---

## TESTING

1. **Update YouTubePlayerModal.tsx**
2. **Clear cache:** `npx expo start --clear`
3. **Open video**
4. **Expected flow:**
   - Logo shows while loading ✅
   - Logo fades out when video starts ✅
   - Video plays from beginning ✅
   - No stuck logo ✅

---

Generated: 2026-05-22
Priority: HIGH (fix logo issue)
Complexity: SIMPLE (remove parameter + adjust timing)
Time: 5 minutes