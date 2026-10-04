import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createInviteLinkNoticeStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface2,
  };
}

// Sin `flex: 1` el texto no se ajusta al ancho que deja el icono y se sale de la tarjeta.
export const INVITE_LINK_TEXT_STYLE: ViewStyle = { flex: 1 };
