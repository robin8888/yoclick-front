import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const COLUMN_WIDTH = 200;
export const MAX_COLUMNS_WITHOUT_SCROLL = 2;

export function createColumnsRowStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'flex-start', gap: theme.space[3] };
}

export function createColumnStyle(theme: Theme, isFilled: boolean): ViewStyle {
  return isFilled
    ? { flex: 1, minWidth: 0, gap: theme.space[2] }
    : { width: COLUMN_WIDTH, gap: theme.space[2] };
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
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    padding: theme.space[2],
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const COLUMN_HEADER_TEXT_STYLE: ViewStyle = { flex: 1 };

export function createColumnEntryStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[1],
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.brandSoft,
  };
}
