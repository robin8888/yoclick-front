import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export const SECTION_STYLE: ViewStyle = { gap: 12 };
export const SESSION_TEXT_STYLE: ViewStyle = { flex: 1 };

export function createSessionRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}
