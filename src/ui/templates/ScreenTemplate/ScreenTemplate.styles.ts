import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, platformHeroGradient, type Theme } from '@/shared/theme';

export function createScreenStyle(theme: Theme, hasPlatformHeroBackground: boolean): ViewStyle {
  const backgroundColor = hasPlatformHeroBackground
    ? platformHeroGradient.fallbackColor
    : theme.colors.bg;
  return { flex: 1, backgroundColor };
}

export const TRANSPARENT_SAFE_AREA_STYLE: ViewStyle = { flex: 1 };

export function createContentStyle(theme: Theme, isContentCentered: boolean): ViewStyle {
  return {
    flexGrow: 1,
    gap: theme.space[5],
    padding: theme.space[5],
    ...(isContentCentered ? { justifyContent: 'center' } : {}),
  };
}

export function createCenterBrandBarStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] };
}

export const CENTER_BRAND_TEXT_STYLE: ViewStyle = { flex: 1 };

export function createBackButtonStyle(theme: Theme): ViewStyle {
  return {
    width: MIN_TOUCH_TARGET_SIZE,
    height: MIN_TOUCH_TARGET_SIZE,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export function createTitleRowStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] };
}

export const TITLE_BLOCK_STYLE: ViewStyle = { flex: 1 };

export function createHeaderStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[2] };
}

export function createHeaderAccessoryStyle(theme: Theme): ViewStyle {
  return { alignItems: 'center', gap: theme.space[3] };
}

export function createFooterStyle(theme: Theme, hasPlatformHeroBackground: boolean): ViewStyle {
  // Sobre el degradado el pie es transparente: sin franja ni línea que lo separen del fondo.
  return {
    gap: theme.space[3],
    padding: theme.space[5],
    ...(hasPlatformHeroBackground
      ? {}
      : { borderTopWidth: 1, borderTopColor: theme.colors.line, backgroundColor: theme.colors.bg }),
  };
}

/** Sobre el contenido, abajo a la derecha, por encima de la acción fija si la hay. */
export const FLOATING_ACTION_STYLE: ViewStyle = {
  position: 'absolute',
  right: 16,
  bottom: 16,
};
