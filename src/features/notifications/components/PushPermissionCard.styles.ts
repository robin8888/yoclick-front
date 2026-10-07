import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createPushCardStyle(theme: Theme): ViewStyle {
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

export const PUSH_CARD_TEXT_STYLE: ViewStyle = { flex: 1 };
