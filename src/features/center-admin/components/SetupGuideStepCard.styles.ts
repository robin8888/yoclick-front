import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

/** Gris claro: el número acompaña a la tarjeta pero no compite con el título. */
const NUMBER_OPACITY = 0.4;
const NUMBER_MIN_WIDTH = 56;
/** Sombra muy suave: separa la tarjeta del fondo sin dibujar un borde duro. */
const SOFT_SHADOW_OPACITY = 0.07;
const SOFT_SHADOW_RADIUS = 14;
const SOFT_SHADOW_OFFSET_Y = 4;
const SOFT_SHADOW_ELEVATION = 2;

/** Sin relleno propio: lo ponen el número (a la izquierda) y el contenido (a la derecha). */
export function createStepCardStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.ink,
    shadowOpacity: SOFT_SHADOW_OPACITY,
    shadowRadius: SOFT_SHADOW_RADIUS,
    shadowOffset: { width: 0, height: SOFT_SHADOW_OFFSET_Y },
    elevation: SOFT_SHADOW_ELEVATION,
  };
}

/** El número ocupa casi toda la altura de la tarjeta, con aire por los cuatro lados. */
export function createStepNumberStyle(theme: Theme): ViewStyle {
  return {
    minWidth: NUMBER_MIN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space[4],
    opacity: NUMBER_OPACITY,
  };
}

export function createStepContentStyle(theme: Theme): ViewStyle {
  return {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingVertical: theme.space[4],
    paddingRight: theme.space[4],
  };
}

export function createStepTextStyle(theme: Theme): ViewStyle {
  return { flex: 1, gap: theme.space[1] };
}

/** El icono va delante del título, en la misma línea. */
export function createStepTitleRowStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.space[2] };
}
