import type { ReactNode } from 'react';

import { ThemeProvider } from '@/shared/theme';

import { useAppBrandHexColor } from '../hooks/useAppBrandHexColor';

interface AppThemeProviderProps {
  children: ReactNode;
}

/** `ThemeProvider` de la app con la marca del centro: al cambiar de centro cambia la marca. */
export function AppThemeProvider({ children }: Readonly<AppThemeProviderProps>): React.JSX.Element {
  const brandHexColor = useAppBrandHexColor();

  return <ThemeProvider brandHexColor={brandHexColor}>{children}</ThemeProvider>;
}
