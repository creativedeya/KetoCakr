# KetoCakR Mobile — Skip YouTube Shorts Logo - Custom Branding

## PROBLEM

YouTube Shorts automatically shows YouTube logo as first frame when video starts.

**Solution:** Start video at 2-3 seconds (skipping the logo) and show KetoCakR custom logo overlay instead.

---

## SOLUTION

### FILE: `Mobile/components/YouTubePlayerModal.tsx`

### STEP 1: Add `start` parameter to embed URL

Update the `buildEmbedUrl` function:

**CHANGE FROM:**
```typescript
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
```

**CHANGE TO:**
```typescript
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
    start: '3',  // ← START AT 3 SECONDS (skip YouTube logo)
  });

  return `${baseUrl}?${params.toString()}`;
};
```

---

### STEP 2: Add KetoCakR Logo Overlay (Optional but Recommended)

Add a custom logo that appears for first 2 seconds, then fades out:

**Add this to YouTubePlayerModal component:**

```typescript
import { Animated, Image } from 'react-native';

// Add these to component state:
const [logoOpacity] = React.useState(new Animated.Value(1));

// Add this useEffect:
React.useEffect(() => {
  if (visible && !loading) {
    // Fade out logo after 2 seconds
    Animated.sequence([
      Animated.delay(2000),
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }
}, [visible, loading]);

// Add this to the JSX (before WebView):
{!error && (
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
      source={require('@/assets/images/logo.png')} // Your KetoCakR logo
      style={{
        width: 100,
        height: 100,
        resizeMode: 'contain',
      }}
    />
  </Animated.View>
)}
```

---

## COMPLETE UPDATED FILE: `Mobile/components/YouTubePlayerModal.tsx`

```typescript
import React from 'react';
import { Modal, View, TouchableOpacity, ActivityIndicator, Text, Animated, Image } from 'react-native';
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
  const [logoOpacity] = React.useState(new Animated.Value(1));

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
      start: '3',  // ← START AT 3 SECONDS (skip YouTube logo)
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
    
    // Fade out KetoCakR logo after 2 seconds
    Animated.sequence([
      Animated.delay(2000),
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
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
    if (!visible) {
      // Reset logo opacity when modal closes
      logoOpacity.setValue(1);
    }
  }, [visible]);

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
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>

        {/* KetoCakR Logo Overlay - Fades out after 2 seconds */}
        {!error && (
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
              source={require('@/assets/images/logo.png')} // Update path to your logo
              style={{
                width: 100,
                height: 100,
                resizeMode: 'contain',
              }}
            />
          </Animated.View>
        )}

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

        {/* WebView - Start at 3 seconds */}
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

## WHAT THIS DOES

✅ **start=3** - Video starts at 3 seconds (skips YouTube logo)
✅ **KetoCakR logo** - Shows your custom logo for first 2 seconds
✅ **Smooth fade** - Logo fades out naturally
✅ **No YouTube branding** - User sees YOUR brand instead
✅ **Professional** - Looks like native app video experience

---

## USER EXPERIENCE

1. User clicks play button
2. Modal opens
3. **First 2 seconds:** Shows KetoCakR logo (your branding!)
4. **After 2 seconds:** Logo fades out, video plays (already at 3-second mark)
5. **YouTube logo avoided** ✅

---

## PARAMETERS EXPLAINED

| Parameter | Value | Effect |
|-----------|-------|--------|
| `start` | `3` | Video starts at 3 seconds (skips intro/logo) |
| Can be changed to | `2` or `4` | Adjust if YouTube logo is longer/shorter |

---

## LOGO FILE PLACEMENT

Make sure you have logo at:
```
Mobile/assets/images/logo.png
```

If your logo is elsewhere, update the path:
```typescript
source={require('@/path/to/your/logo.png')}
```

---

## OPTIONAL: Adjust Start Time

If YouTube logo is longer than 3 seconds, change:
```typescript
start: '2', // or '4', '5' depending on logo length
```

---

## TESTING

1. **Update YouTubePlayerModal.tsx**
2. **Add your KetoCakR logo to assets**
3. **Clear cache:** `npx expo start --clear`
4. **Open video**
5. **Should see:**
   - Your KetoCakR logo for ~2 seconds
   - Logo fades out
   - Video starts (no YouTube logo!)
   - Video is already at 3-second mark

---

## RESULT

Instead of:
```
[YouTube logo] → [Your video]
```

Now:
```
[KetoCakR logo] → [Your video] (starting at 3 sec, YouTube logo skipped)
```

Much better branding! 🧁✨

---

Generated: 2026-05-22
Priority: HIGH (branding optimization)
Complexity: MODERATE (animation + URL parameter)
Time: 10 minutes