import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLanguageStore } from '../store/useLanguageStore';

const queryClient = new QueryClient();

export default function RootLayout() {
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);

  useEffect(() => {
    loadLanguage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* stack will render tabs as well as modals; header hidden globally */}
      <Stack
        screenOptions={{
          headerShown: false,
          // other global options (e.g. gestureEnabled) can go here
        }}
      >
        <Stack.Screen name="(tabs)" />
        {/* modal group handled automatically by expo-router since folder is named (modals) */}
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