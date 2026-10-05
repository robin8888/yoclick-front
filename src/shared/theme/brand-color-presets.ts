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
