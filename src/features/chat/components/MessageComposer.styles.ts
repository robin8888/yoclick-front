import type { TextStyle, ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const MAX_FIELD_HEIGHT = 120;

/** La barra fija bajo el hilo, con el hueco de la zona segura cuando no hay teclado. */
export function createComposerBarStyle(theme: Theme, bottomInset: number): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.space[2],
    paddingHorizontal: theme.space[2],
    paddingTop: theme.space[2],
    paddingBottom: Math.max(bottomInset, theme.space[2]),
    backgroundColor: theme.colors.surface2,
  };
}

export function createComposerPillStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: theme.space[4],
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
  };
}

export function createComposerFieldStyle(textStyle: TextStyle): TextStyle {
  return {
    ...textStyle,
    flex: 1,
    maxHeight: MAX_FIELD_HEIGHT,
    // Alinea la primera línea con los botones de al lado (44 px de alto).
    paddingTop: 12,
    paddingBottom: 12,
  };
}
