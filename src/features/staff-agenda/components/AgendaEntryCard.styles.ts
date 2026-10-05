import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createEntryCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[1],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const ENTRY_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};
