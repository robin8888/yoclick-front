import type { ViewStyle } from 'react-native';

export const CHIP_ROW_STYLE: Record<'container' | 'row', ViewStyle> = {
  container: { gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
};
