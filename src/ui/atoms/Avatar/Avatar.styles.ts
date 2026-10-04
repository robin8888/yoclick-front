import type { ImageStyle, ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

import type { TextVariant } from '../Text';
import type { AvatarSize } from './Avatar.types';

export const AVATAR_PIXEL_SIZES: Readonly<Record<AvatarSize, number>> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 96,
};

export const AVATAR_INITIALS_VARIANTS: Readonly<Record<AvatarSize, TextVariant>> = {
  sm: 'caption',
  md: 'bodyStrong',
  lg: 'titleMd',
  xl: 'titleLg',
};

export function createAvatarStyle(theme: Theme, size: AvatarSize): ViewStyle {
  const pixelSize = AVATAR_PIXEL_SIZES[size];
  return {
    width: pixelSize,
    height: pixelSize,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };
}

export function createAvatarImageStyle(size: AvatarSize): ImageStyle {
  return { width: AVATAR_PIXEL_SIZES[size], height: AVATAR_PIXEL_SIZES[size] };
}
