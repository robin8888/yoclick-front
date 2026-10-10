import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export function createContrastCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const CONTRAST_HEADER_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
};

// Con textos largos («Texto sobre tu fondo · oscuro») el resultado baja a la línea siguiente en lugar de salirse de la caja.
export const CONTRAST_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  columnGap: 8,
  rowGap: 4,
};

export const CONTRAST_LABEL_STYLE: ViewStyle = { flexShrink: 1 };

export const CONTRAST_RESULT_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  flexShrink: 1,
  gap: 4,
};
