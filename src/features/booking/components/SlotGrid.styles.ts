import type { ViewStyle } from 'react-native';

const SLOT_GAP = 8;

export const SLOT_GRID_STYLE: ViewStyle = { gap: SLOT_GAP };

export const SLOT_ROW_STYLE: ViewStyle = { flexDirection: 'row', gap: SLOT_GAP };

export const SLOT_CELL_STYLE: ViewStyle = { flex: 1 };
