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
