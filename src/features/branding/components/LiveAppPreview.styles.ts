import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

// La miniatura es la pantalla real a tamaño de móvil pequeño, reducida: así los colores y las
// proporciones son exactamente los de la app, sin un dibujo aparte que se desincronice.
const FULL_APP_WIDTH = 300;
const FULL_APP_HEIGHT = 580;
const PREVIEW_SCALE = 0.58;
const FRAME_BORDER_WIDTH = 3;
const TAB_DOT_WIDTH = 22;
const TAB_DOT_HEIGHT = 11;

export function createAppFrameStyle(theme: Theme): ViewStyle {
  return {
    width: FULL_APP_WIDTH * PREVIEW_SCALE,
    height: FULL_APP_HEIGHT * PREVIEW_SCALE,
    overflow: 'hidden',
    borderRadius: theme.radius.xl,
    borderWidth: FRAME_BORDER_WIDTH,
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.bg,
  };
}

export function createFullSizeAppStyle(theme: Theme): ViewStyle {
  return {
    width: FULL_APP_WIDTH,
    height: FULL_APP_HEIGHT,
    gap: theme.space[3],
    padding: theme.space[4],
    backgroundColor: theme.colors.bg,
    transform: [{ scale: PREVIEW_SCALE }],
    transformOrigin: 'top left',
  };
}

export const MINI_ROW_STYLE: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: 8 };

export function createMiniHeroStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[1],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.brand,
  };
}

export function createMiniCardStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    padding: theme.space[3],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createMiniTabBarStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto',
    paddingTop: theme.space[2],
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  };
}

export function createMiniTabDotStyle(theme: Theme, isActive: boolean): ViewStyle {
  return {
    width: TAB_DOT_WIDTH,
    height: TAB_DOT_HEIGHT,
    borderRadius: theme.radius.pill,
    backgroundColor: isActive ? theme.colors.brandSoft : theme.colors.surface2,
  };
}
