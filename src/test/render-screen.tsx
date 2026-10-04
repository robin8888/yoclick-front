import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { ThemeProvider } from '@/shared/theme';

/** Una pantalla con los proveedores de la app: caché de Query nueva (sin reintentos) y tema. */
export function renderScreen(screenElement: ReactElement): RenderResult {
  const queryClient = new QueryClient({
    // gcTime infinito: sin temporizadores de limpieza que mantengan vivo el proceso de Jest.
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider initialPreference="light">{screenElement}</ThemeProvider>
    </QueryClientProvider>,
  );
}
