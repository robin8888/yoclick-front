import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createPlanSummaryStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

/** La pastilla de estado a la izquierda y la flecha a la derecha. */
export function createPlanSummaryHeaderStyle(): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' };
}

/** Título y detalle en una sola línea; si no caben, el detalle baja sin pisar al título. */
export function createPlanSummaryTextRowStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: theme.space[2],
    rowGap: theme.space[1],
  };
}
