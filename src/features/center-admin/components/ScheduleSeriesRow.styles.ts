import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

/** La tarjeta: el contenido que abre el detalle y, a su lado, el botón de editar. */
export function createScheduleCardStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    paddingVertical: theme.space[3],
    paddingStart: theme.space[4],
    paddingEnd: theme.space[2],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

/** Lo que se toca para abrir el horario: franja horaria, nombre y sitio. */
export function createScheduleContentStyle(theme: Theme): ViewStyle {
  return { flex: 1, gap: theme.space[2] };
}

/** La franja «10:30 – 12:30» en una etiqueta que nunca se corta: crece con el texto. */
export function createScheduleTimePillStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.space[2],
    paddingVertical: theme.space[1],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.brandSoft,
  };
}
