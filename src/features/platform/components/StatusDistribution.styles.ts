import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const TRACK_HEIGHT = 14;
const LEGEND_DOT_SIZE = 10;
const SEGMENT_GAP = 2;

export function createDistributionCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[4],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const DISTRIBUTION_TRACK_STYLE: ViewStyle = {
  flexDirection: 'row',
  height: TRACK_HEIGHT,
  gap: SEGMENT_GAP,
  overflow: 'hidden',
  borderRadius: TRACK_HEIGHT,
};

export function createSegmentStyle(color: string, share: number): ViewStyle {
  return { flexGrow: share, flexBasis: 0, backgroundColor: color };
}

export const LEGEND_STYLE: ViewStyle = { gap: 8 };

export const LEGEND_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const LEGEND_LABEL_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

export function createLegendDotStyle(color: string): ViewStyle {
  return {
    width: LEGEND_DOT_SIZE,
    height: LEGEND_DOT_SIZE,
    borderRadius: LEGEND_DOT_SIZE,
    backgroundColor: color,
  };
}
