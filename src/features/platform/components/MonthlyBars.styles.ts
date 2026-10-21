import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const MAX_BAR_HEIGHT = 72;
const MIN_BAR_HEIGHT = 2;
const BAR_WIDTH = 10;
const BAR_COLUMN_GAP = 4;

export function createBarsCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const BARS_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
};

export const BAR_COLUMN_STYLE: ViewStyle = { alignItems: 'center', gap: BAR_COLUMN_GAP };

/** La altura es proporcional a la cifra más alta de la serie; un mes a cero deja una raya fina. */
export function createBarStyle(theme: Theme, ratio: number): ViewStyle {
  return {
    width: BAR_WIDTH,
    height: Math.max(MIN_BAR_HEIGHT, Math.round(MAX_BAR_HEIGHT * ratio)),
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.brand,
  };
}
