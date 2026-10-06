import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

// Dos tarjetas por fila con el hueco entre ambas: `flexBasis` y `flexGrow` las reparten a partes iguales.
const KPI_CARD_MIN_WIDTH_PERCENT = '45%';

export function createKpiCardStyle(theme: Theme): ViewStyle {
  return {
    flexGrow: 1,
    flexBasis: KPI_CARD_MIN_WIDTH_PERCENT,
    gap: theme.space[1],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}
