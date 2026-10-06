import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createOpeningDayStyle(theme: Theme, hasProblem: boolean): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    // Con un problema el borde es rojo y además hay un texto: el error no depende solo del color.
    borderColor: hasProblem ? theme.colors.danger : theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const DAY_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};

export const RANGE_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
};

export const DAY_TITLE_STYLE: ViewStyle = { flex: 1 };
