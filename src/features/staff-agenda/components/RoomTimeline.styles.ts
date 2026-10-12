import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const HOUR_LABEL_WIDTH = 52;

export const HOUR_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  gap: 12,
  alignItems: 'flex-start',
};

export const HOUR_BLOCKS_STYLE: ViewStyle = { flex: 1, gap: 8 };

export function createHourLabelStyle(theme: Theme): ViewStyle {
  return { width: HOUR_LABEL_WIDTH, paddingTop: theme.space[1] };
}

/** Un tramo bloqueado: borde discontinuo y fondo apagado, para que no se confunda con una clase. */
export function createRoomBlockCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[1],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface2,
  };
}
