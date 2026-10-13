import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

/** La tarjeta que agrupa las ruedas de hora, para que se lea como un solo bloque. */
export function createSlotPickerCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

/** Las dos ruedas (horas : minutos) lado a lado, centradas. */
export function createSlotWheelsRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
  };
}

/** La franja con la hora elegida, grande, al pie de la tarjeta. */
export function createChosenSlotStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.space[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  };
}
