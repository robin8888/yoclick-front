import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createScreenStyle(theme: Theme, hasPlatformHeroBackground: boolean): ViewStyle {
  // En claro el fondo de marca es el blanco de `surface`; en oscuro lo pinta el degradado.
  const isLightHero = hasPlatformHeroBackground && theme.mode === 'light';
  return { flex: 1, backgroundColor: isLightHero ? theme.colors.surface : theme.colors.bg };
}

export const TRANSPARENT_SAFE_AREA_STYLE: ViewStyle = { flex: 1 };

export function createContentStyle(theme: Theme): ViewStyle {
  return { flexGrow: 1, gap: theme.space[5], padding: theme.space[5] };
}

export function createHeaderStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[2] };
}

export function createHeaderAccessoryStyle(theme: Theme): ViewStyle {
  return { alignItems: 'center', gap: theme.space[3] };
}

export function createFooterStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[5],
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
    backgroundColor: theme.colors.bg,
  };
}

export const KEYBOARD_AVOIDING_STYLE: ViewStyle = { flex: 1 };
