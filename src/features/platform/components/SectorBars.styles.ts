import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

import { toPercentWidth } from '../model/percent-width';

const SECTOR_BAR_HEIGHT = 8;
const MIN_FILL_RATIO = 0.04;

export const SECTOR_ROW_STYLE: ViewStyle = { gap: 6 };

export const SECTOR_LABEL_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
};

export function createSectorTrackStyle(theme: Theme): ViewStyle {
  return {
    height: SECTOR_BAR_HEIGHT,
    borderRadius: SECTOR_BAR_HEIGHT,
    backgroundColor: theme.colors.line,
    overflow: 'hidden',
  };
}

/** El ancho es proporcional al tipo con más centros; uno con centros nunca queda en una raya. */
export function createSectorFillStyle(theme: Theme, ratio: number): ViewStyle {
  return {
    width: toPercentWidth(Math.max(ratio, MIN_FILL_RATIO)),
    height: SECTOR_BAR_HEIGHT,
    borderRadius: SECTOR_BAR_HEIGHT,
    backgroundColor: theme.colors.brand,
  };
}
