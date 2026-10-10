import { calculateContrastRatio, normalizeHexColor, type ThemeMode } from './brand-engine';
import { colorTokens } from './tokens';

/** Personalización Premium de un centro: fondo (liso o degradado) y color de la colmena. */
export interface CenterAppearance {
  backgroundColor: string | null;
  /** Segundo color del degradado; `null` = fondo liso. */
  backgroundColorEnd: string | null;
  hiveColor: string | null;
}

/** Sin personalizar: las pantallas usan el fondo del tema y la colmena del color de marca. */
export const DEFAULT_CENTER_APPEARANCE: CenterAppearance = {
  backgroundColor: null,
  backgroundColorEnd: null,
  hiveColor: null,
};

export type ScreenBackgroundPaint =
  | { kind: 'theme' }
  | { kind: 'solid'; color: string }
  | { kind: 'gradient'; startColor: string; endColor: string };

/** El color liso que va detrás de la pantalla; en un degradado, su primer color (el dibujo va encima). */
export function resolveScreenBackgroundColor(
  appearance: CenterAppearance,
  themeBackgroundColor: string,
): string {
  const backgroundPaint = resolveScreenBackgroundPaint(appearance);
  if (backgroundPaint.kind === 'solid') return backgroundPaint.color;
  if (backgroundPaint.kind === 'gradient') return backgroundPaint.startColor;
  return themeBackgroundColor;
}

/** Qué pinta detrás de la pantalla: el tema, un color liso o un degradado de arriba abajo. */
export function resolveScreenBackgroundPaint(appearance: CenterAppearance): ScreenBackgroundPaint {
  const { backgroundColor, backgroundColorEnd } = appearance;
  if (backgroundColor === null) return { kind: 'theme' };
  if (backgroundColorEnd === null) return { kind: 'solid', color: backgroundColor };
  return { kind: 'gradient', startColor: backgroundColor, endColor: backgroundColorEnd };
}

/** Los colores del fondo elegido (uno si es liso, dos si es degradado); vacío = el del tema. */
export function listAppearanceBackgroundColors(appearance: CenterAppearance): string[] {
  const startColor = normalizeHexColor(appearance.backgroundColor ?? '');
  if (startColor === null) return [];
  const endColor = normalizeHexColor(appearance.backgroundColorEnd ?? '');
  return endColor === null ? [startColor] : [startColor, endColor];
}

function measureWorstInkContrast(mode: ThemeMode, backgroundColors: readonly string[]): number {
  return Math.min(
    ...backgroundColors.map((backgroundColor) =>
      calculateContrastRatio(colorTokens[mode].ink, backgroundColor),
    ),
  );
}

/**
 * El texto no se elige: sale del modo claro u oscuro. Con un fondo propio se usa el modo cuyo
 * texto mejor contrasta con él (con empate, el que ya tenía la persona), así nunca se pierde.
 */
export function resolveThemeModeForBackground(
  appearance: CenterAppearance,
  preferredMode: ThemeMode,
): ThemeMode {
  const backgroundColors = listAppearanceBackgroundColors(appearance);
  if (backgroundColors.length === 0) return preferredMode;
  const otherMode: ThemeMode = preferredMode === 'light' ? 'dark' : 'light';
  const preferredContrast = measureWorstInkContrast(preferredMode, backgroundColors);
  const otherContrast = measureWorstInkContrast(otherMode, backgroundColors);
  return otherContrast > preferredContrast ? otherMode : preferredMode;
}
