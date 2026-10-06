import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const BAR_HEIGHT = 8;

export function createOccupancyTrackStyle(theme: Theme): ViewStyle {
  return {
    height: BAR_HEIGHT,
    marginVertical: theme.space[1],
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface2,
  };
}

export function createOccupancyFillStyle(theme: Theme, percent: number): ViewStyle {
  return {
    width: `${String(percent)}%` as `${number}%`,
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brandInk,
  };
}
