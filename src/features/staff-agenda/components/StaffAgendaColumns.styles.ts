import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createColumnsStackStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[4] };
}

/** Cada profesional es una sola tarjeta: su nombre, cuántas citas tiene y las citas. */
export function createColumnStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

/** Sustituye a las casillas «Libre» del prototipo: el servidor aún no da los huecos libres. */
export function createEmptyColumnStyle(theme: Theme): ViewStyle {
  return {
    padding: theme.space[3],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.line,
  };
}

export function createColumnHeaderStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] };
}

export const COLUMN_HEADER_TEXT_STYLE: ViewStyle = { flex: 1 };

const ENTRY_TIME_WIDTH = 56;
const ENTRY_ACCENT_WIDTH = 4;

export const ENTRY_TIME_STYLE: ViewStyle = { width: ENTRY_TIME_WIDTH };
export const ENTRY_TEXT_STYLE: ViewStyle = { flex: 1 };

/** Una cita: la hora a la izquierda, cliente y servicio a la derecha y una barra de marca. */
export function createColumnEntryStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.md,
    borderLeftWidth: ENTRY_ACCENT_WIDTH,
    borderLeftColor: theme.colors.brand,
    backgroundColor: theme.colors.brandSoft,
  };
}
