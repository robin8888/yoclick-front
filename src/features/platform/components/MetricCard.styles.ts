import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const METRIC_GRID_GAP = 12;
const ICON_TILE_SIZE = 36;
const HALF_WIDTH_BASIS = '47%';
const FULL_WIDTH_BASIS = '100%';
const ALERT_BORDER_WIDTH = 2;

export type MetricTone = 'default' | 'warning' | 'danger';

interface MetricCardStyleRequest {
  tone: MetricTone;
  isFeatured: boolean;
}

export function createMetricCardStyle(
  theme: Theme,
  { tone, isFeatured }: MetricCardStyleRequest,
): ViewStyle {
  return {
    flexBasis: isFeatured ? FULL_WIDTH_BASIS : HALF_WIDTH_BASIS,
    flexGrow: 1,
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: tone === 'default' ? 1 : ALERT_BORDER_WIDTH,
    borderColor: tone === 'default' ? theme.colors.line : theme.colors[tone],
    backgroundColor: theme.colors.surface,
  };
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
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const METRIC_GRID_STYLE: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: METRIC_GRID_GAP,
};
