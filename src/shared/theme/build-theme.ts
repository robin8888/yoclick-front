import { deriveBrandTokens } from './brand-engine';
import { motionTokens } from './motion';
import { listAppearanceBackgroundColors, type CenterAppearance } from './center-appearance';
import type { Theme, ThemeColors, ThemeMode } from './theme.types';
import { colorTokens, radiusTokens, spaceTokens, typeStyleTokens } from './tokens';

export interface BuildThemeInput {
  mode: ThemeMode;
  /** Color del centro. Sin él (o inválido) se usa la marca neutra de Yoclick. */
  brandHexColor?: string | undefined;
  /** Colores que sustituyen a los del tema (p. ej. las pantallas con marca Yoclick). */
  colorOverrides?: Partial<ThemeColors> | undefined;
  /** Fondo Premium del centro: sustituye a `bg` y el texto de marca se calcula también sobre él. */
  centerAppearance?: CenterAppearance | undefined;
}

function buildColors({
  mode,
  brandHexColor,
  colorOverrides,
  centerAppearance,
}: BuildThemeInput): ThemeColors {
  const neutralColors = colorTokens[mode];
  const [customBackgroundColor, ...otherBackgroundColors] =
    centerAppearance === undefined ? [] : listAppearanceBackgroundColors(centerAppearance);
  const backgroundColor = customBackgroundColor ?? neutralColors.bg;
  const brandTokens = deriveBrandTokens(brandHexColor ?? neutralColors.ink, mode, {
    backgroundColor,
    surfaceColor: neutralColors.surface,
    additionalBackgroundColors: otherBackgroundColors,
  });
  return { ...neutralColors, bg: backgroundColor, ...brandTokens, ...colorOverrides };
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
