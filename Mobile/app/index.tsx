// ===========================================================
// FILE: mobile/app/index.tsx
// STEP 1: Simple redirect to tabs
// ===========================================================
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography, Spacing } from '../constants/Theme';
import { useTranslation } from '../constants/i18n';

export default function Index() {
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    // Simple timeout to ensure everything is mounted
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
      <ActivityIndicator size="large" color={Colors.primary.main} />
      <Text style={{ marginTop: Spacing.base, color: Colors.text.secondary, ...Typography.body1 }}>
        {t('common.loading')}
      </Text>
    </View>
  );
}
