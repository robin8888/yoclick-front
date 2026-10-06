import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const SEGMENT_HEIGHT = 4;
const HALF = 0.5;

export function createStepsRowStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', gap: theme.space[2] };
}

export function createStepSegmentStyle(theme: Theme, isReached: boolean): ViewStyle {
  return {
    flex: 1,
    height: SEGMENT_HEIGHT,
    borderRadius: SEGMENT_HEIGHT * HALF,
    backgroundColor: isReached ? theme.colors.brand : theme.colors.line,
  };
}
