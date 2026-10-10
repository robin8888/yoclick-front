import type { ImageStyle, ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export const CENTER_LOGO_TILE_SIZE = 112;

/** Icono de app: cuadrado redondeado relleno con el color de marca del centro. */
export function createCenterLogoTileStyle(theme: Theme): ViewStyle {
  return {
    width: CENTER_LOGO_TILE_SIZE,
    height: CENTER_LOGO_TILE_SIZE,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };
}

export const CENTER_LOGO_TILE_IMAGE_STYLE: ImageStyle = {
  width: CENTER_LOGO_TILE_SIZE,
  height: CENTER_LOGO_TILE_SIZE,
};
