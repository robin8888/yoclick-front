import type { ReactNode } from 'react';

import { CenterIdentityProvider, ThemeProvider } from '@/shared/theme';

import { useActiveCenterIdentity } from '../hooks/useActiveCenterIdentity';
import { useAppBrandHexColor } from '../hooks/useAppBrandHexColor';

interface AppThemeProviderProps {
  children: ReactNode;
}

/**
 * `ThemeProvider` de la app con la marca del centro (color, nombre y logo): al cambiar de centro
 * cambia todo.
 */
export function AppThemeProvider({ children }: Readonly<AppThemeProviderProps>): React.JSX.Element {
  const brandHexColor = useAppBrandHexColor();
  const centerIdentity = useActiveCenterIdentity();

  return (
    <ThemeProvider brandHexColor={brandHexColor}>
      <CenterIdentityProvider centerIdentity={centerIdentity}>{children}</CenterIdentityProvider>
    </ThemeProvider>
  );
}
