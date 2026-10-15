import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createChildCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const CHILD_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
};
export const GROW_STYLE: ViewStyle = { flex: 1, gap: 4, alignItems: 'flex-start' };
