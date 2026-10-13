import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

export const DATE_FIELD_STYLE: ViewStyle = { gap: 8 };

/** La fecha elegida en una píldora (como en los Ajustes del iPhone); al tocarla, abre o cierra el calendario. */
export function createDatePillStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.space[2],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
  };
}
