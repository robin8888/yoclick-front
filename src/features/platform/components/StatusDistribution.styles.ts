import type { ViewStyle } from 'react-native';

const TRACK_HEIGHT = 14;
const LEGEND_DOT_SIZE = 10;
const SEGMENT_GAP = 2;
const LEGEND_GAP = 8;

export const DISTRIBUTION_TRACK_STYLE: ViewStyle = {
  flexDirection: 'row',
  height: TRACK_HEIGHT,
  gap: SEGMENT_GAP,
  overflow: 'hidden',
  borderRadius: TRACK_HEIGHT,
};

export function createSegmentStyle(color: string, share: number): ViewStyle {
  return { flexGrow: share, flexBasis: 0, backgroundColor: color };
}

export const LEGEND_STYLE: ViewStyle = { gap: LEGEND_GAP };

export const LEGEND_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: LEGEND_GAP,
};

/** La etiqueta ocupa lo que sobra junto a la cifra y se parte si no cabe. */
export const LEGEND_LABEL_STYLE: ViewStyle = {
  flex: 1,
  minWidth: 0,
  flexDirection: 'row',
  alignItems: 'center',
  gap: LEGEND_GAP,
};

export function createLegendDotStyle(color: string): ViewStyle {
  return {
    width: LEGEND_DOT_SIZE,
    height: LEGEND_DOT_SIZE,
    borderRadius: LEGEND_DOT_SIZE,
    backgroundColor: color,
  };
}
