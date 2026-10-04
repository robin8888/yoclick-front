import { deriveBrandTokens } from './brand-engine';
import { motionTokens } from './motion';
import type { Theme, ThemeColors, ThemeMode } from './theme.types';
import { colorTokens, radiusTokens, spaceTokens, typeStyleTokens } from './tokens';

export interface BuildThemeInput {
  mode: ThemeMode;
  /** Color del centro. Sin él (o inválido) se usa la marca neutra de Yoclick. */
  brandHexColor?: string | undefined;
}

function buildColors({ mode, brandHexColor }: BuildThemeInput): ThemeColors {
  const neutralColors = colorTokens[mode];
  const brandTokens = deriveBrandTokens(brandHexColor ?? neutralColors.ink, mode, {
    backgroundColor: neutralColors.bg,
    surfaceColor: neutralColors.surface,
  });
  return { ...neutralColors, ...brandTokens };
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
