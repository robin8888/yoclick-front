import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createSectionStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[4] };
}

export function createDataCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[1],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  };
}

export function createDataRowStyle(theme: Theme): ViewStyle {
  return {
    gap: 2,
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  };
}
