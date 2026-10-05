// Geometría del símbolo (assets/brand/yoclick-symbol.svg): la X y la C, y los tres destellos.
export const LOGO_VIEW_BOX = '28 44 500 440';
const LOGO_VIEW_BOX_WIDTH = 500;
const LOGO_VIEW_BOX_HEIGHT = 440;
export const LOGO_ASPECT_RATIO = LOGO_VIEW_BOX_WIDTH / LOGO_VIEW_BOX_HEIGHT;
export const DEFAULT_LOGO_LOADER_HEIGHT = 72;

export interface LogoStroke {
  path: string;
  width: number;
}

export const LOGO_BODY_STROKES: readonly LogoStroke[] = [
  { path: 'M95 138 L176 292', width: 66 },
  { path: 'M230.4 259.6 A110 110 0 0 0 430 313', width: 72 },
  { path: 'M78 433 L250 187 A110 110 0 0 1 430 187', width: 72 },
];

export const LOGO_SPARK_STROKES: readonly LogoStroke[] = [
  { path: 'M449 116 L474 70', width: 26 },
  { path: 'M470 160 L506 140', width: 26 },
  { path: 'M472 206 L505 220', width: 26 },
];

// Ciclo de 1,5 s: los destellos se encienden de uno en uno y se apagan juntos.
export const LOGO_LOADER_CYCLE_MS = 1500;
export const SPARK_DIMMED_OPACITY = 0.15;
const FIRST_SPARK_LIGHT_UP_POINT = 0.1;
const SPARK_LIGHT_UP_STEP = 0.2;
const SECOND_SPARK_LIGHT_UP_POINT = FIRST_SPARK_LIGHT_UP_POINT + SPARK_LIGHT_UP_STEP;
const THIRD_SPARK_LIGHT_UP_POINT = SECOND_SPARK_LIGHT_UP_POINT + SPARK_LIGHT_UP_STEP;
export const SPARK_LIGHT_UP_POINTS = [
  FIRST_SPARK_LIGHT_UP_POINT,
  SECOND_SPARK_LIGHT_UP_POINT,
  THIRD_SPARK_LIGHT_UP_POINT,
] as const;
export const SPARK_FADE_IN_SPAN = 0.1;
export const SPARKS_FADE_OUT_START = 0.88;
export const SPARKS_FADE_OUT_END = 0.97;
