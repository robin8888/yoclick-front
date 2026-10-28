import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createSafetyRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[3],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createSafetyRowTextStyle(theme: Theme): ViewStyle {
  return { flex: 1, gap: theme.space[1] };
}

/** Una denuncia: sus datos en columna, porque el texto denunciado puede ser largo. */
export function createReportCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}
