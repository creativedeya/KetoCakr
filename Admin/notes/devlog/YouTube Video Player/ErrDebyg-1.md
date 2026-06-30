# KetoCakR Mobile — Deep Debug: Catch Error 153 at Source

## PROBLEM

Логовете показват успешно зареждане (loadEnd), но видеото НЕ работи с Error 153.

Грешката се появява СЛЕД loadEnd - вероятно от YouTube iframe сам.

---

## SOLUTION: Add More WebView Event Handlers

### File: `Mobile/components/YouTubePlayerModal.tsx`

### REPLACE WebView component with this VERSION with EXTRA logging:

```typescript
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
  
  // LOGGING
  onLoadStart={() => {
    console.log('🎬 [YouTubePlayerModal] WebView - loadStart');
    setLoading(true);
    setError(null);
  }}
  
  onLoadEnd={() => {
    console.log('🎬 [YouTubePlayerModal] WebView - loadEnd');
    setLoading(false);
  }}
  
  // CATCH JAVASCRIPT ERRORS FROM YOUTUBE
  onMessage={(event) => {
    console.log('🎬 [YouTubePlayerModal] WebView Message:', event.nativeEvent.data);
  }}
  
  // CATCH WEBVIEW ERRORS
  onError={(syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('🚨 [YouTubePlayerModal] WebView ERROR - DETAILED:');
    console.error('  Full error object:', JSON.stringify(nativeEvent, null, 2));
    console.error('  code:', nativeEvent.code);
    console.error('  description:', nativeEvent.description);
    
    // Check if Error 153
    if (nativeEvent.code === 153) {
      console.error('🚨🚨🚨 ERROR 153 CONFIRMED 🚨🚨🚨');
      console.error('Description:', nativeEvent.description);
      setError(`Error 153: ${nativeEvent.description}`);
    }
    
    setLoading(false);
  }}
  
  // CATCH HTTP ERRORS
  onHttpError={(syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('🚨 [YouTubePlayerModal] HTTP ERROR:');
    console.error('  statusCode:', nativeEvent.statusCode);
    console.error('  url:', nativeEvent.url);
    setError(`HTTP Error: ${nativeEvent.statusCode}`);
  }}
  
  // CATCH NAVIGATION CHANGES
  onNavigationStateChange={(navState) => {
    console.log('🎬 [YouTubePlayerModal] Navigation state changed:');
    console.log('  url:', navState.url);
    console.log('  title:', navState.title);
    console.log('  loading:', navState.loading);
    console.log('  canGoBack:', navState.canGoBack);
    console.log('  canGoForward:', navState.canGoForward);
  }}
  
  // CATCH SCROLL EVENTS
  onScroll={(event) => {
    console.log('🎬 [YouTubePlayerModal] Scroll event:', event.nativeEvent);
  }}
  
  // CATCH BEFORE LOAD
  onShouldStartLoadWithRequest={(request) => {
    console.log('🎬 [YouTubePlayerModal] onShouldStartLoadWithRequest:');
    console.log('  url:', request.url);
    console.log('  lockIdentifier:', request.lockIdentifier);
    return true;
  }}
/>
```

---

## ALSO: Add Injected JavaScript to Catch YouTube Errors

Add this AFTER the WebView:

```typescript
// Inject JavaScript to catch YouTube errors
const injectedJavaScript = `
  (function() {
    // Catch JavaScript errors
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      console.log('JS Error: ' + msg + ' Line: ' + lineNo);
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'JS_ERROR',
          message: msg,
          url: url,
          lineNo: lineNo,
          error: error?.toString()
        })
      );
      return false;
    };
    
    // Log YouTube player events
    console.log('YouTube iframe injection script loaded');
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'READY',
      message: 'Page loaded'
    }));
    
    // Watch for YouTube API errors
    if (window.YT) {
      console.log('YouTube API detected');
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'YT_API_READY'
      }));
    }
  })();
  true;
`;
```

Then add to WebView:

```typescript
injectedJavaScript={injectedJavaScript}
```

---

## EXPECTED OUTPUT WHEN ERROR 153 HAPPENS

Look for one of these in console:

**Option A: WebView error caught:**
```
🚨 [YouTubePlayerModal] WebView ERROR - DETAILED:
  code: 153
  description: [YouTube error description]
```

**Option B: JavaScript error:**
```
JS Error: [YouTube error message]
type: 'JS_ERROR'
message: ...
```

**Option C: Navigation issue:**
```
🎬 [YouTubePlayerModal] Navigation state changed:
  url: https://www.youtube.com/embed/...
  title: ...
  loading: [true/false]
```

---

## TESTING STEPS

1. **Update YouTubePlayerModal.tsx with above code**
2. **Clear cache:** `npx expo start --clear`
3. **Go to Ягодова панакота**
4. **Click play button**
5. **Open DevTools → Console**
6. **COPY ALL LOGS** that appear
7. **PASTE HERE** what you see

---

## WHAT WE'RE LOOKING FOR

When Error 153 appears, we need to know:
1. **Exact error code** (is it really 153?)
2. **Error description** (what YouTube says)
3. **When it happens** (loadStart? loadEnd? later?)
4. **Is it a WebView error or HTTP error or JS error?**

---

Generated: 2026-05-21
Priority: CRITICAL (debugging)
Complexity: SIMPLE (add more logging)
Time: 10 minutes