import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const PROGRESS_TRACK_HEIGHT = 10;
const PERCENT = 100;

export function createTimerStyle(theme: Theme): ViewStyle {
  return {
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[6],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
  };
}

export function createProgressTrackStyle(theme: Theme): ViewStyle {
  return {
    alignSelf: 'stretch',
    height: PROGRESS_TRACK_HEIGHT,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface2,
  };
}

export function createProgressFillStyle(
  theme: Theme,
  progressFraction: number,
  isOvertime: boolean,
): ViewStyle {
  return {
    height: PROGRESS_TRACK_HEIGHT,
    width: `${String(Math.round(progressFraction * PERCENT))}%` as `${number}%`,
    borderRadius: theme.radius.pill,
    backgroundColor: isOvertime ? theme.colors.warning : theme.colors.brand,
  };
}
