import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { SessionBootstrap } from '@/features/auth';
import { AppThemeProvider } from '@/features/join';
import { queryClient } from '@/shared/api/query-client';
import { BackActionProvider, useAppFonts } from '@/shared/theme';

// El splash nativo se mantiene hasta tener las fuentes para evitar un parpadeo de tipografía.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout(): React.JSX.Element | null {
  const { areFontsReady } = useAppFonts();

  useEffect(() => {
    if (areFontsReady) void SplashScreen.hideAsync();
  }, [areFontsReady]);

  if (!areFontsReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <SessionBootstrap>
          <BackActionProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </BackActionProvider>
        </SessionBootstrap>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}
