import type { ViewStyle } from 'react-native';

import { platformCardColors } from '@/shared/theme';

export type ViewfinderCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

const CORNER_SIZE = 44;
const CORNER_THICKNESS = 5;
const CORNER_RADIUS = 14;
const FRAME_INSET = 28;

export const VIEWFINDER_OVERLAY_STYLE: ViewStyle = {
  position: 'absolute',
  top: FRAME_INSET,
  right: FRAME_INSET,
  bottom: FRAME_INSET,
  left: FRAME_INSET,
};

// Cada esquina dibuja solo sus dos lados y redondea el vértice exterior.
const CORNER_PLACEMENT: Readonly<Record<ViewfinderCorner, ViewStyle>> = {
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: CORNER_RADIUS,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: CORNER_RADIUS,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: CORNER_RADIUS,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: CORNER_RADIUS,
  },
};

export function createViewfinderCornerStyle(corner: ViewfinderCorner): ViewStyle {
  return {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: platformCardColors.selectedBorder,
    ...CORNER_PLACEMENT[corner],
  };
}
