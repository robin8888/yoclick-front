import { normalizeHexColor } from '@/shared/theme/brand-engine';
import type { CenterAppearance } from '@/shared/theme';

export type BackgroundKind = 'theme' | 'solid' | 'gradient';
export type HiveKind = 'brand' | 'custom';

export function resolveBackgroundKind(appearance: CenterAppearance): BackgroundKind {
  if (appearance.backgroundColor === null) return 'theme';
  return appearance.backgroundColorEnd === null ? 'solid' : 'gradient';
}

export interface StartingColors {
  /** El fondo del tema con el que empieza quien pasa a «Liso» o «Degradado». */
  start: string;
  end: string;
}

/**
 * Qué cambia al elegir otro tipo de fondo: se conservan los colores ya elegidos y, la primera vez,
 * se parte del fondo del tema (y de su tinte de marca para el segundo color del degradado).
 */
export function buildBackgroundKindChange(
  kind: BackgroundKind,
  appearance: CenterAppearance,
  startingColors: StartingColors,
): Pick<CenterAppearance, 'backgroundColor' | 'backgroundColorEnd'> {
  if (kind === 'theme') return { backgroundColor: null, backgroundColorEnd: null };
  const backgroundColor = appearance.backgroundColor ?? startingColors.start;
  if (kind === 'solid') return { backgroundColor, backgroundColorEnd: null };
  return {
    backgroundColor,
    backgroundColorEnd: appearance.backgroundColorEnd ?? startingColors.end,
  };
}

/** Mientras se escribe un color a medias, la vista previa conserva el último color válido publicado. */
export function resolvePreviewAppearance(
  draft: CenterAppearance,
  published: CenterAppearance | null,
): CenterAppearance {
  function resolveColor(key: keyof CenterAppearance): string | null {
    const draftColor = draft[key];
    if (draftColor === null) return null;
    return normalizeHexColor(draftColor) ?? published?.[key] ?? null;
  }
  return {
    backgroundColor: resolveColor('backgroundColor'),
    backgroundColorEnd: resolveColor('backgroundColorEnd'),
    hiveColor: resolveColor('hiveColor'),
  };
}

export function isAppearanceColorInvalid(color: string | null): boolean {
  return color !== null && normalizeHexColor(color) === null;
}
