import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const METRIC_GRID_GAP = 12;
const ICON_TILE_SIZE = 36;
const HALF_WIDTH_BASIS = '47%';
const FULL_WIDTH_BASIS = '100%';

/** Cada tarjeta ocupa la mitad del ancho (o todo, si es la destacada) y crece si sobra sitio. */
export function createMetricCellStyle(isFeatured: boolean): ViewStyle {
  return { flexBasis: isFeatured ? FULL_WIDTH_BASIS : HALF_WIDTH_BASIS, flexGrow: 1, minWidth: 0 };
}

export function createMetricIconTileStyle(theme: Theme): ViewStyle {
  return {
    width: ICON_TILE_SIZE,
    height: ICON_TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  };
}

export const METRIC_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 8,
};

export const METRIC_GRID_STYLE: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: METRIC_GRID_GAP,
};
