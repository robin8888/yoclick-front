import type { IconSize } from './Icon.types';

// Trazo de 1,8 px sobre rejilla de 24 (docs/design/sistema-de-diseno.md › Iconografía).
export const ICON_STROKE_WIDTH = 1.8;

export const ICON_PIXEL_SIZES: Readonly<Record<IconSize, number>> = {
  inline: 18,
  navigation: 22,
  large: 32,
};
