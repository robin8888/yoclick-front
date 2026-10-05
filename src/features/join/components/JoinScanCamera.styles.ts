import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const CAMERA_ASPECT_RATIO = 1;
const FRAME_BORDER_WIDTH = 2;

export function createCameraFrameStyle(theme: Theme): ViewStyle {
  return {
    aspectRatio: CAMERA_ASPECT_RATIO,
    overflow: 'hidden',
    borderRadius: theme.radius.xl,
    borderWidth: FRAME_BORDER_WIDTH,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface2,
  };
}

export const CAMERA_FILL_STYLE: ViewStyle = { flex: 1 };
