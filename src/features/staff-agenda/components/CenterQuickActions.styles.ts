import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const ICON_CIRCLE_SIZE = 44;
const TILE_MIN_HEIGHT = 96;

export function createQuickActionsStackStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[3] };
}

export function createQuickActionsStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', gap: theme.space[3] };
}

/** Botón grande de acceso: icono en un círculo y el nombre debajo; el principal va relleno de marca. */
export function createQuickActionStyle(theme: Theme, isPrimary: boolean): ViewStyle {
  return {
    flex: 1,
    minHeight: Math.max(TILE_MIN_HEIGHT, MIN_TOUCH_TARGET_SIZE),
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: theme.space[2],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: isPrimary ? theme.colors.brand : theme.colors.line,
    backgroundColor: isPrimary ? theme.colors.brand : theme.colors.surface,
  };
}

export function createQuickActionIconStyle(theme: Theme, isPrimary: boolean): ViewStyle {
  return {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: isPrimary ? theme.colors.surface : theme.colors.brandSoft,
  };
}
