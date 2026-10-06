import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const UNREAD_DOT_SIZE = 10;

export function createNotificationRowStyle(theme: Theme, isRead: boolean): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: isRead ? theme.colors.surface : theme.colors.brandSoft,
  };
}

/** El punto de «sin leer»: además del color, la fila lleva el título en negrita y la palabra en su etiqueta. */
export function createUnreadDotStyle(theme: Theme): ViewStyle {
  return {
    width: UNREAD_DOT_SIZE,
    height: UNREAD_DOT_SIZE,
    marginTop: theme.space[1],
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brand,
  };
}

export const NOTIFICATION_TEXT_STYLE: ViewStyle = { flex: 1, gap: 2 };
