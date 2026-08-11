import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';

import { store } from '../src/store/store';
import { useAppSelector } from '../src/store/hooks';
import { useColorScheme } from '../hooks/use-color-scheme';
import { AuthStateListener } from '../src/components/auth-listener';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { userId, initializing } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    if (!initializing) {
      router.replace(userId ? '/' : '/login');
    }
  }, [initializing, router, userId]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="task-form" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthStateListener />
      <RootLayoutNav />
    </Provider>
  );
}
