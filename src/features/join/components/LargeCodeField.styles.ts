import type { TextStyle, ViewStyle } from 'react-native';

import { resolveFontFaceName, type Theme } from '@/shared/theme';

const INPUT_HEIGHT = 72;
const INPUT_FONT_SIZE = 28;
const LETTER_SPACING = 4;
const BORDER_WIDTH = 2;
const FIELD_GAP = 8;

export const LARGE_CODE_FIELD_STYLE: ViewStyle = { gap: FIELD_GAP };

export function createLargeCodeInputStyle(theme: Theme, isInvalid: boolean): TextStyle {
  return {
    height: INPUT_HEIGHT,
    textAlign: 'center',
    fontSize: INPUT_FONT_SIZE,
    letterSpacing: LETTER_SPACING,
    fontFamily: resolveFontFaceName({ fontFamily: 'display', fontWeight: '700' }),
    color: theme.colors.ink,
    borderRadius: theme.radius.lg,
    borderWidth: BORDER_WIDTH,
    borderColor: isInvalid ? theme.colors.danger : theme.colors.line,
    backgroundColor: theme.colors.surface,
  };
}
