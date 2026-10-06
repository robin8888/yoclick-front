import type { ImageStyle, ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const LOGO_SIZE = 52;

export function createBrandLogoCardStyle(theme: Theme): ViewStyle {
  return {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}

export const BRAND_LOGO_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
};

export const BRAND_LOGO_TEXT_STYLE: ViewStyle = { flex: 1 };

export const BRAND_LOGO_IMAGE_STYLE: ImageStyle = {
  width: LOGO_SIZE,
  height: LOGO_SIZE,
  borderRadius: 12,
};
