import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

/** Una carga más corta no enseña esqueleto (docs/design › Estados). */
export const SKELETON_DELAY_MS = 300;
export const AVATAR_PLACEHOLDER_SIZE = 40;

export function createScreenSkeletonStyle(theme: Theme): ViewStyle {
  return { gap: theme.space[6], padding: theme.space[4] };
}

export function createRowStyle(theme: Theme): ViewStyle {
  return { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] };
}

export function createRowTextStyle(theme: Theme): ViewStyle {
  return { flex: 1, gap: theme.space[2] };
}
