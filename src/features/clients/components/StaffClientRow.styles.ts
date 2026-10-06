import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createStaffClientRowStyle(theme: Theme, isLast: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[4],
    borderBottomWidth: isLast ? 0 : 1,
    borderBottomColor: theme.colors.line,
  };
}

export function createStaffClientCardStyle(theme: Theme): ViewStyle {
  return {
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}
