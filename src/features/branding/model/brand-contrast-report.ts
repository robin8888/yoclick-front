import {
  buildTheme,
  calculateContrastRatio,
  listAppearanceBackgroundColors,
  resolveThemeModeForBackground,
  type CenterAppearance,
} from '@/shared/theme';

const AA_NORMAL_TEXT_RATIO = 4.5;
const AA_LARGE_TEXT_RATIO = 3;

export type ContrastLevel = 'aa' | 'large-text-only' | 'fail';
export type ContrastRowId = 'on-button' | 'ink-light' | 'ink-dark' | 'background';

export interface ContrastRow {
  id: ContrastRowId;
  ratio: number;
  level: ContrastLevel;
}

export interface BrandContrastReport {
  rows: ContrastRow[];
  /** El color se ha oscurecido o aclarado para usarse como texto (los botones conservan el exacto). */
  wasInkAdjusted: boolean;
}

export function classifyContrastRatio(ratio: number): ContrastLevel {
  if (ratio >= AA_NORMAL_TEXT_RATIO) return 'aa';
  return ratio >= AA_LARGE_TEXT_RATIO ? 'large-text-only' : 'fail';
}

/** «7,2:1», con coma decimal como en el resto de la app. */
export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(1).replace('.', ',')}:1`;
}

function measureInkContrast(brandHexColor: string, mode: 'light' | 'dark'): number {
  const { colors } = buildTheme({ mode, brandHexColor });
  return Math.min(
    ...[colors.surface, colors.bg, colors.brandSoft].map((backgroundColor) =>
      calculateContrastRatio(colors.brandInk, backgroundColor),
    ),
  );
}

/**
 * El peor contraste del texto (principal y de marca) con el fondo elegido, en el modo que la app
 * elige sola para que contraste lo mejor posible.
 */
function measureBackgroundContrast(brandHexColor: string, appearance: CenterAppearance): number {
  const mode = resolveThemeModeForBackground(appearance, 'light');
  const { colors } = buildTheme({ mode, brandHexColor, centerAppearance: appearance });
  return Math.min(
    ...[colors.ink, colors.brandInk].flatMap((textColor) =>
      listAppearanceBackgroundColors(appearance).map((backgroundColor) =>
        calculateContrastRatio(textColor, backgroundColor),
      ),
    ),
  );
}

/**
 * Prototipo `abrand`, «Contraste accesible»: lo que garantiza el brand engine para este color y,
 * si el centro eligió un fondo Premium, cómo se lee el texto sobre él.
 */
export function buildBrandContrastReport(
  brandHexColor: string,
  appearance?: CenterAppearance,
): BrandContrastReport {
  const lightColors = buildTheme({ mode: 'light', brandHexColor }).colors;
  const darkColors = buildTheme({ mode: 'dark', brandHexColor }).colors;
  const ratios: [ContrastRowId, number][] = [
    ['on-button', calculateContrastRatio(lightColors.onBrand, lightColors.brand)],
    ['ink-light', measureInkContrast(brandHexColor, 'light')],
    ['ink-dark', measureInkContrast(brandHexColor, 'dark')],
  ];

  if (appearance !== undefined && listAppearanceBackgroundColors(appearance).length > 0) {
    ratios.push(['background', measureBackgroundContrast(brandHexColor, appearance)]);
  }

  return {
    rows: ratios.map(([id, ratio]) => ({ id, ratio, level: classifyContrastRatio(ratio) })),
    wasInkAdjusted:
      lightColors.brandInk !== lightColors.brand || darkColors.brandInk !== darkColors.brand,
  };
}
