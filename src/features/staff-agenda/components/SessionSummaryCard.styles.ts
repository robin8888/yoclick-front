import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const ACCENT_WIDTH = 5;
const SEATS_BAR_HEIGHT = 8;

/** La tarjeta de la clase: blanca, con una banda de color de marca a la izquierda. */
export function createSessionCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStartWidth: ACCENT_WIDTH,
    borderColor: theme.colors.line,
    borderStartColor: theme.colors.brand,
    backgroundColor: theme.colors.surface,
  };
}

export function createFactRowStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] };
}

export function createSeatsTrackStyle(theme: Theme): ViewStyle {
  return {
    height: SEATS_BAR_HEIGHT,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    overflow: 'hidden',
  };
}

/** La parte llena del aforo: ancho proporcional y, completa, en color de aviso (también hay texto). */
export function createSeatsFillStyle(
  theme: Theme,
  state: { fillPercent: number; isFull: boolean },
): ViewStyle {
  return {
    height: SEATS_BAR_HEIGHT,
    width: `${state.fillPercent.toFixed(0)}%` as `${number}%`,
    borderRadius: theme.radius.pill,
    backgroundColor: state.isFull ? theme.colors.danger : theme.colors.brand,
  };
}
