// Colores de partida para que un centro nuevo elija marca sin tener que escribir un hex.
// Cubren tonos oscuros y claros: el brand engine calcula el texto y el contraste de cada uno.
export const BRAND_COLOR_PRESETS = [
  '#2446C7',
  '#0E8A6E',
  '#E4572E',
  '#7A3FE0',
  '#D6336C',
  '#0B7285',
  '#F59F00',
  '#C8F031',
] as const;

export const DEFAULT_BRAND_COLOR = BRAND_COLOR_PRESETS[0];

export type BrandSwatchGroupId = 'vivid' | 'pastel' | 'metallic';

export interface BrandSwatchGroup {
  id: BrandSwatchGroupId;
  colors: readonly string[];
}

/**
 * Colores de partida de «Tu marca» (prototipo `abrand`) para centros que ya existen. Los
 * metalizados son tonos planos que recuerdan al metal: la app no pinta brillos, solo rellenos.
 */
export const BRAND_SWATCH_GROUPS: readonly BrandSwatchGroup[] = [
  {
    id: 'vivid',
    colors: [
      '#E4572E',
      '#2446C7',
      '#C8F031',
      '#0E8A6E',
      '#7A3FE0',
      '#D6336C',
      '#111315',
      '#F2B705',
    ],
  },
  {
    id: 'pastel',
    colors: [
      '#F4A6A0',
      '#F7C59F',
      '#F5E1A4',
      '#B8E0C2',
      '#A9D6E5',
      '#B8C0FF',
      '#D9B8F5',
      '#F5B8D9',
    ],
  },
  {
    id: 'metallic',
    colors: [
      '#C9A227',
      '#A7ADB4',
      '#A86B3C',
      '#B4663A',
      '#4B5058',
      '#6C8196',
      '#B76E79',
      '#CDB38B',
    ],
  },
];
