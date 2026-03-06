// ===========================================================
// FILE: mobile/app/_layout.tsx
// ===========================================================
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import '../global.css';

const queryClient = new QueryClient();

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)/signin"
          options={{
            presentation: 'modal',
            title: 'Sign In',
          }}
        />
        <Stack.Screen
          name="(auth)/signup"
          options={{
            presentation: 'modal',
            title: 'Sign Up',
          }}
        />
        <Stack.Screen
          name="(modals)/recipe-generator"
          options={{
            presentation: 'modal',
            title: 'Create Your Cake',
          }}
        />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            title: 'Recipe',
          }}
        />
        <Stack.Screen
          name="user-recipe/[id]"
          options={{
            title: 'My Recipe',
          }}
        />
        <Stack.Screen
          name="favorites"
          options={{
            title: 'Favorites',
          }}
        />
        <Stack.Screen
          name="shopping-list"
          options={{
            title: 'Shopping List',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
        <Stack.Screen
          name="subscription"
          options={{
            title: 'Premium',
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}