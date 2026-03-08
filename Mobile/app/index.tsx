// ===========================================================
// FILE: mobile/app/index.tsx
// STEP 1: Simple redirect to tabs
// ===========================================================
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Image } from 'react-native';
import { Colors } from '../constants/Colors';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background.primary,
      }}
    >
      <Image
        source={require('../assets/Logo-Blago.png')}
        style={{ width: 120, height: 120 }}
        resizeMode="contain"
      />
    </View>
  );
}
