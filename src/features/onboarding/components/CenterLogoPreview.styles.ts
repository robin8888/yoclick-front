import type { ImageStyle, ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const LOGO_PREVIEW_SIZE = 168;
const LOGO_PREVIEW_BORDER_WIDTH = 3;

export function createLogoPreviewStyle(theme: Theme, brandHexColor: string): ViewStyle {
  return {
    alignSelf: 'center',
    width: LOGO_PREVIEW_SIZE,
    height: LOGO_PREVIEW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: theme.radius.xl,
    borderWidth: LOGO_PREVIEW_BORDER_WIDTH,
    borderColor: theme.colors.line,
    backgroundColor: brandHexColor,
  };
}

export const LOGO_PREVIEW_IMAGE_STYLE: ImageStyle = { width: '100%', height: '100%' };
