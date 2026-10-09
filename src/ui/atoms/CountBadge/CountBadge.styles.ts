import type { TextStyle, ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const BADGE_SIZE = 26;
const MAX_VISIBLE_COUNT = 9;
const BADGE_BORDER_WIDTH = 2;
export const BADGE_TEXT_LINE_HEIGHT = BADGE_SIZE - BADGE_BORDER_WIDTH - BADGE_BORDER_WIDTH;
const BADGE_OFFSET = -6;

/** «9+» a partir de diez: el círculo no crece sin límite. */
export function formatBadgeCount(count: number): string {
  return count > MAX_VISIBLE_COUNT ? `${String(MAX_VISIBLE_COUNT)}+` : String(count);
}

/** Línea del número: tan alta como el círculo por dentro y sin el relleno que añade Android a la fuente. */
export function createCountTextStyle(textStyle: TextStyle): TextStyle {
  return { ...textStyle, lineHeight: BADGE_TEXT_LINE_HEIGHT, includeFontPadding: false };
}

export function createCountBadgeStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    top: BADGE_OFFSET,
    right: BADGE_OFFSET,
    minWidth: BADGE_SIZE,
    height: BADGE_SIZE,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: BADGE_BORDER_WIDTH,
    // Un aro del color de fondo lo separa del icono que tiene debajo.
    borderColor: theme.colors.bg,
    backgroundColor: theme.colors.danger,
  };
}
