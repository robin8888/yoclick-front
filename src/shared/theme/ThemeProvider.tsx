import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { buildTheme } from './build-theme';
import { resolveThemeModeForBackground, type CenterAppearance } from './center-appearance';
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
  /** Fondo Premium del centro: si lo hay, el modo se ajusta para que el texto contraste con él. */
  centerAppearance?: CenterAppearance | undefined;
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
  centerAppearance,
  initialPreference = 'system',
}: Readonly<ThemeProviderProps>): React.JSX.Element {
  const [themePreference, setThemePreference] = useState<ThemePreference>(initialPreference);
  const systemColorScheme = useColorScheme();
  const preferredMode = resolveThemeMode(themePreference, systemColorScheme);
  const mode =
    centerAppearance === undefined
      ? preferredMode
      : resolveThemeModeForBackground(centerAppearance, preferredMode);

  // El valor del contexto se memoiza porque lo consume toda la app: un objeto nuevo en cada
  // render repintaría todos los componentes aunque el tema no haya cambiado.
  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme: buildTheme({ mode, brandHexColor, colorOverrides, centerAppearance }),
      themePreference,
      setThemePreference,
    }),
    [mode, brandHexColor, colorOverrides, centerAppearance, themePreference],
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
