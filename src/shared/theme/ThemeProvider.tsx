import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { buildTheme } from './build-theme';
import type { Theme, ThemeColors, ThemeMode, ThemePreference } from './theme.types';

interface ThemeContextValue {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (nextPreference: ThemePreference) => void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** Color del centro activo; sin él se usa la marca neutra. */
  brandHexColor?: string | undefined;
  colorOverrides?: Partial<ThemeColors> | undefined;
  initialPreference?: ThemePreference;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveThemeMode(
  themePreference: ThemePreference,
  systemColorScheme: ReturnType<typeof useColorScheme>,
): ThemeMode {
  if (themePreference !== 'system') return themePreference;
  return systemColorScheme === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({
  children,
  brandHexColor,
  colorOverrides,
  initialPreference = 'system',
}: Readonly<ThemeProviderProps>): React.JSX.Element {
  const [themePreference, setThemePreference] = useState<ThemePreference>(initialPreference);
  const systemColorScheme = useColorScheme();
  const mode = resolveThemeMode(themePreference, systemColorScheme);

  // El valor del contexto se memoiza porque lo consume toda la app: un objeto nuevo en cada
  // render repintaría todos los componentes aunque el tema no haya cambiado.
  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme: buildTheme({ mode, brandHexColor, colorOverrides }),
      themePreference,
      setThemePreference,
    }),
    [mode, brandHexColor, colorOverrides, themePreference],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

function useThemeContext(): ThemeContextValue {
  const themeContext = useContext(ThemeContext);
  if (themeContext === null) {
    throw new Error('useTheme must be used inside <ThemeProvider>.');
  }
  return themeContext;
}

export function useTheme(): Theme {
  return useThemeContext().theme;
}

export function useThemePreference(): Pick<
  ThemeContextValue,
  'themePreference' | 'setThemePreference'
> {
  const { themePreference, setThemePreference } = useThemeContext();
  return { themePreference, setThemePreference };
}
