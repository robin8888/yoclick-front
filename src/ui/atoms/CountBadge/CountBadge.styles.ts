import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const BADGE_SIZE = 20;
const MAX_VISIBLE_COUNT = 9;
const BADGE_BORDER_WIDTH = 2;

/** «9+» a partir de diez: el círculo no crece sin límite. */
export function formatBadgeCount(count: number): string {
  return count > MAX_VISIBLE_COUNT ? `${String(MAX_VISIBLE_COUNT)}+` : String(count);
}

export function createCountBadgeStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: BADGE_SIZE,
    height: BADGE_SIZE,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: BADGE_BORDER_WIDTH,
    // Un aro del color de fondo lo separa del icono que tiene debajo.
    borderColor: theme.colors.bg,
    backgroundColor: theme.colors.danger,
  };
}
