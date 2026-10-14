import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createMonthSwitcherStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[3],
  };
}

export function createTotalsRowStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', gap: theme.space[3] };
}

export function createTotalTileStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    gap: theme.space[1],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createDayCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createDayHeaderStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[2],
  };
}

export function createEntryRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[2],
    minHeight: theme.space[10],
  };
}

export function createEntryBadgesStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[1] };
}

export function createEditorWheelsStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', gap: theme.space[3] };
}

export function createEditorStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[4] };
}
