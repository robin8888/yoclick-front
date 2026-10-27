import type { ReactNode } from 'react';

import { CenterIdentityProvider, ThemeProvider } from '@/shared/theme';

import { useActiveCenterAppearance } from '../hooks/useActiveCenterAppearance';
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
  const centerAppearance = useActiveCenterAppearance();

  return (
    <ThemeProvider brandHexColor={brandHexColor} centerAppearance={centerAppearance}>
      <CenterIdentityProvider centerIdentity={centerIdentity}>{children}</CenterIdentityProvider>
    </ThemeProvider>
  );
}
