import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { ThemeProvider, useAppFonts } from '@/shared/theme';

// El splash nativo se mantiene hasta tener las fuentes para evitar un parpadeo de tipografía.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout(): React.JSX.Element | null {
  const { areFontsReady } = useAppFonts();

  useEffect(() => {
    if (areFontsReady) void SplashScreen.hideAsync();
  }, [areFontsReady]);

  if (!areFontsReady) return null;

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
