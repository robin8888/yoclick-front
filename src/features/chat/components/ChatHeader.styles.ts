import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createChatHeaderStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingHorizontal: theme.space[2],
    paddingVertical: theme.space[1],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

/** El nombre ocupa el hueco que queda, para que el menú quede a la derecha. */
export const CHAT_HEADER_NAME_STYLE: ViewStyle = { flex: 1 };
