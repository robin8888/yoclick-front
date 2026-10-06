import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const ICON_CIRCLE_SIZE = 88;
const HALF = 0.5;

export function createHistoryEmptyStyle(theme: Theme): ViewStyle {
  return {
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[8],
    paddingHorizontal: theme.space[5],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export function createHistoryIconCircleStyle(theme: Theme): ViewStyle {
  return {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ICON_CIRCLE_SIZE * HALF,
    backgroundColor: theme.colors.brandSoft,
  };
}

export function createHistoryBadgesStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.space[2],
    marginBottom: theme.space[2],
  };
}

// El botón se alinea al inicio por sí mismo: en una fila centrada queda en el medio de la tarjeta.
export const HISTORY_ACTION_ROW_STYLE: ViewStyle = {
  alignSelf: 'stretch',
  flexDirection: 'row',
  justifyContent: 'center',
};
