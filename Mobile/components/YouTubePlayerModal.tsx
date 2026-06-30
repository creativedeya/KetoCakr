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

// Prevents users from leaving the app via YouTube logo or embedded links
const injectedJavaScript = `
  (function() {
    document.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href && (href.includes('youtube.com') || href.includes('youtu.be'))) {
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

export const YouTubePlayerModal = ({ visible, videoId, onClose, language = 'en' }: YouTubePlayerModalProps) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [logoOpacity] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (visible) {
      logoOpacity.setValue(1);
    }
  }, [visible]);

  const buildEmbedUrl = (id: string, lang: 'en' | 'bg'): string => {
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
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  };

  const embedUrl = buildEmbedUrl(videoId, language);

  const headers = {
    'Referer': 'https://ketocakelab.com',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 12; AppleWebKit/537.36)',
    'Accept-Language': language === 'bg' ? 'bg-BG,bg;q=0.9' : 'en-US,en;q=0.9',
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
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>

        {/* KetoCakR Logo Overlay — visible during loading, fades out when video is ready */}
        {!error && (
          <Animated.View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              zIndex: 30,
              transform: [{ translateX: -50 }, { translateY: -50 }],
              opacity: logoOpacity,
            }}
          >
            <Image
              source={require('../assets/Logo-Blago.png')}
              style={{ width: 100, height: 100, resizeMode: 'contain' }}
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
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              Video Failed to Load
            </Text>
            <Text style={{ color: 'white', fontSize: 14, marginBottom: 8 }}>
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

        <WebView
          source={{ uri: embedUrl, headers }}
          style={{ flex: 1, backgroundColor: '#000' }}
          startInLoadingState={true}
          scalesPageToFit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          allowsFullscreenVideo={true}
          useWebKit={true}
          originWhitelist={['*']}
          injectedJavaScript={injectedJavaScript}
          onLoadStart={() => {
            setLoading(true);
            setError(null);
          }}
          onLoadEnd={() => {
            setLoading(false);
            Animated.timing(logoOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'LINK_BLOCKED') {
                // Silent block — user clicked YouTube logo or external link
              }
            } catch (_) {}
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setError(`Error ${nativeEvent.code}: ${nativeEvent.description}`);
            setLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            setError(`HTTP Error: ${nativeEvent.statusCode}`);
            setLoading(false);
          }}
        />
      </View>
    </Modal>
  );
};
