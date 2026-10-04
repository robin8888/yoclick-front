import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

import type { SkeletonProps } from './Skeleton.types';

export const SKELETON_PULSE_HALF_CYCLE_MS = 700;
export const SKELETON_DIMMED_OPACITY = 0.45;

interface SkeletonStyleRequest extends SkeletonProps {
  theme: Theme;
}

export function createSkeletonStyle({
  theme,
  width = '100%',
  height,
  radius = 'sm',
  shape = 'rectangle',
}: SkeletonStyleRequest): ViewStyle {
  const isCircle = shape === 'circle';
  return {
    width: isCircle ? height : width,
    height,
    borderRadius: isCircle ? theme.radius.pill : theme.radius[radius],
    backgroundColor: theme.colors.surface2,
  };
}
