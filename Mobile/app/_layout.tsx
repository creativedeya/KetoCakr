import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLanguageStore } from '../store/useLanguageStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';

const queryClient = new QueryClient();

export default function RootLayout() {
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);
  const initSubscriptions = useSubscriptionStore((state) => state.initialize);

  useEffect(() => {
    loadLanguage();
    const revenueCatKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
    if (revenueCatKey) {
      initSubscriptions(revenueCatKey);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* stack will render tabs as well as modals; header hidden globally */}
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="recipe-detail/[id]" />
        <Stack.Screen name="user-recipe/[id]" />
        <Stack.Screen name="all-recipes/index" />
        <Stack.Screen name="favorites/index" />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="subscription/index" />
        <Stack.Screen name="blog/index" />
        <Stack.Screen name="tarot/card-face" />
        <Stack.Screen name="tarot/ritual" />
        <Stack.Screen
          name="(modals)/recipe-generator"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="(modals)/visual-recipe-builder"
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </QueryClientProvider>
  );
}