import type { ViewStyle } from 'react-native';

import { MIN_TOUCH_TARGET_SIZE, type Theme } from '@/shared/theme';

const ROOM_ACCENT_WIDTH = 4;
const ROOM_LETTER_SIZE = 36;
const HALF = 2;

/** Tarjeta de un espacio: borde fino y una franja con el color que tiene en la agenda. */
export function createRoomCardStyle(
  theme: Theme,
  accentColor: string,
  isSelected = false,
): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: MIN_TOUCH_TARGET_SIZE,
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderLeftWidth: ROOM_ACCENT_WIDTH,
    borderColor: isSelected ? theme.colors.brand : theme.colors.line,
    borderLeftColor: accentColor,
    backgroundColor: theme.colors.surface,
  };
}

/** El círculo con la letra de la sala (la misma que ve en la agenda). */
export function createRoomLetterStyle(backgroundColor: string): ViewStyle {
  return {
    width: ROOM_LETTER_SIZE,
    height: ROOM_LETTER_SIZE,
    borderRadius: ROOM_LETTER_SIZE / HALF,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor,
  };
}

export const ROOM_CARD_BODY_STYLE: ViewStyle = { flex: 1 };
