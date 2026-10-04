import { render, type RenderResult } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import { ThemeProvider, type ThemeMode } from '@/shared/theme';

interface RenderInThemeOptions {
  mode?: ThemeMode;
  brandHexColor?: string;
}

/** Renderiza dentro del ThemeProvider: todos los componentes de ui/ leen sus tokens del tema. */
export function renderInTheme(
  element: ReactElement,
  { mode = 'light', brandHexColor }: RenderInThemeOptions = {},
): RenderResult {
  return render(
    <ThemeProvider initialPreference={mode} brandHexColor={brandHexColor}>
      {element}
    </ThemeProvider>,
  );
}
