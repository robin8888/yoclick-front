import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { buildTheme } from './build-theme';
import {
  DEFAULT_CENTER_APPEARANCE,
  resolveThemeModeForBackground,
  type CenterAppearance,
} from './center-appearance';
import { CenterAppearanceProvider } from './center-appearance-context';
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

interface ResolvedLook {
  mode: ThemeMode;
  /** El fondo propio que de verdad se pinta; `undefined` si el centro no tiene o se descartó. */
  appearance: CenterAppearance | undefined;
}

/**
 * Con un fondo propio, el modo «Sistema» se ajusta solo para que el texto contraste. Si la persona
 * elige claro u oscuro, se respeta: si ese modo no contrasta con el fondo del centro, se deja el
 * fondo de siempre en vez de ignorar su elección (y de pintar texto ilegible).
 */
function resolveLook(
  themePreference: ThemePreference,
  preferredMode: ThemeMode,
  centerAppearance: CenterAppearance | undefined,
): ResolvedLook {
  if (centerAppearance === undefined) return { mode: preferredMode, appearance: undefined };
  const adjustedMode = resolveThemeModeForBackground(centerAppearance, preferredMode);
  if (themePreference === 'system') return { mode: adjustedMode, appearance: centerAppearance };
  const isBackgroundKept = adjustedMode === preferredMode;
  return {
    mode: preferredMode,
    appearance: isBackgroundKept ? centerAppearance : DEFAULT_CENTER_APPEARANCE,
  };
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
  const { mode, appearance } = resolveLook(themePreference, preferredMode, centerAppearance);

  // El valor del contexto se memoiza porque lo consume toda la app: un objeto nuevo en cada
  // render repintaría todos los componentes aunque el tema no haya cambiado.
  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme: buildTheme({ mode, brandHexColor, colorOverrides, centerAppearance: appearance }),
      themePreference,
      setThemePreference,
    }),
    [mode, brandHexColor, colorOverrides, appearance, themePreference],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {appearance === undefined ? (
        children
      ) : (
        <CenterAppearanceProvider centerAppearance={appearance}>
          {children}
        </CenterAppearanceProvider>
      )}
    </ThemeContext.Provider>
  );
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
