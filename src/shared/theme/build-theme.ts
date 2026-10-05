import { deriveBrandTokens } from './brand-engine';
import { motionTokens } from './motion';
import type { Theme, ThemeColors, ThemeMode } from './theme.types';
import { colorTokens, radiusTokens, spaceTokens, typeStyleTokens } from './tokens';

export interface BuildThemeInput {
  mode: ThemeMode;
  /** Color del centro. Sin él (o inválido) se usa la marca neutra de Yoclick. */
  brandHexColor?: string | undefined;
  /** Colores que sustituyen a los del tema (p. ej. las pantallas con marca Yoclick). */
  colorOverrides?: Partial<ThemeColors> | undefined;
}

function buildColors({ mode, brandHexColor, colorOverrides }: BuildThemeInput): ThemeColors {
  const neutralColors = colorTokens[mode];
  const brandTokens = deriveBrandTokens(brandHexColor ?? neutralColors.ink, mode, {
    backgroundColor: neutralColors.bg,
    surfaceColor: neutralColors.surface,
  });
  return { ...neutralColors, ...brandTokens, ...colorOverrides };
}

export function buildTheme(input: BuildThemeInput): Theme {
  return {
    mode: input.mode,
    colors: buildColors(input),
    space: spaceTokens,
    radius: radiusTokens,
    type: typeStyleTokens,
    motion: motionTokens,
  };
}
