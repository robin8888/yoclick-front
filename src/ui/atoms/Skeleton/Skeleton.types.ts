import type { DimensionValue } from 'react-native';

import type { Theme } from '@/shared/theme';

export type SkeletonRadius = keyof Theme['radius'];

export interface SkeletonProps {
  width?: DimensionValue;
  height: number;
  radius?: SkeletonRadius;
  /** `circle` fuerza ancho = alto: para avatares. */
  shape?: 'rectangle' | 'circle';
}
