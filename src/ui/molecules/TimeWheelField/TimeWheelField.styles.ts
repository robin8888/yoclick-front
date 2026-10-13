import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createTimeWheelFieldStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[1], flexGrow: 1, flexBasis: 0, minWidth: 180 };
}

/** La tarjeta con las dos ruedas (horas : minutos). */
export function createTimeWheelCardStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[1],
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}
