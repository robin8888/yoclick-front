import { buildTheme, calculateContrastRatio } from '@/shared/theme';

const AA_NORMAL_TEXT_RATIO = 4.5;
const AA_LARGE_TEXT_RATIO = 3;

export type ContrastLevel = 'aa' | 'large-text-only' | 'fail';
export type ContrastRowId = 'on-button' | 'ink-light' | 'ink-dark';

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

/** Prototipo `abrand`, «Contraste accesible»: lo que garantiza el brand engine para este color. */
export function buildBrandContrastReport(brandHexColor: string): BrandContrastReport {
  const lightColors = buildTheme({ mode: 'light', brandHexColor }).colors;
  const darkColors = buildTheme({ mode: 'dark', brandHexColor }).colors;
  const ratios: Record<ContrastRowId, number> = {
    'on-button': calculateContrastRatio(lightColors.onBrand, lightColors.brand),
    'ink-light': measureInkContrast(brandHexColor, 'light'),
    'ink-dark': measureInkContrast(brandHexColor, 'dark'),
  };

  return {
    rows: (Object.keys(ratios) as ContrastRowId[]).map((id) => ({
      id,
      ratio: ratios[id],
      level: classifyContrastRatio(ratios[id]),
    })),
    wasInkAdjusted:
      lightColors.brandInk !== lightColors.brand || darkColors.brandInk !== darkColors.brand,
  };
}
