import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const METRIC_GRID_GAP = 12;

export function createMetricCardStyle(theme: Theme): ViewStyle {
  return {
    flexBasis: '47%',
    flexGrow: 1,
    gap: theme.space[1],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const METRIC_GRID_STYLE: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: METRIC_GRID_GAP,
};
