import type { TextStyle, ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

// Mismo alto que los botones (48 px), por encima del mínimo táctil de 44.
export const INPUT_MIN_HEIGHT = 48;
const MULTILINE_MIN_HEIGHT = 110;
const DEFAULT_BORDER_WIDTH = 1;
// El anillo de foco y el de error son más gruesos (2,5 px en el sistema; se redondea a 2 en el borde).
const EMPHASIS_BORDER_WIDTH = 2;

interface InputContainerRequest {
  theme: Theme;
  isFocused: boolean;
  isInvalid: boolean;
  isDisabled: boolean;
  isMultiline?: boolean;
}

function resolveBorderColor({ theme, isFocused, isInvalid }: InputContainerRequest): string {
  if (isInvalid) return theme.colors.danger;
  return isFocused ? theme.colors.focus : theme.colors.lineStrong;
}

export function createInputContainerStyle(request: InputContainerRequest): ViewStyle {
  const { theme, isFocused, isInvalid, isDisabled, isMultiline = false } = request;
  const hasEmphasis = isFocused || isInvalid;
  const borderWidth = hasEmphasis ? EMPHASIS_BORDER_WIDTH : DEFAULT_BORDER_WIDTH;
  return {
    flexDirection: 'row',
    alignItems: isMultiline ? 'flex-start' : 'center',
    minHeight: isMultiline ? MULTILINE_MIN_HEIGHT : INPUT_MIN_HEIGHT,
    paddingVertical: isMultiline ? theme.space[3] : 0,
    // Se resta lo que crece el borde para que el contenido no salte al enfocar.
    paddingHorizontal: theme.space[4] - (borderWidth - DEFAULT_BORDER_WIDTH),
    gap: theme.space[2],
    borderRadius: theme.radius.md,
    borderWidth,
    borderColor: resolveBorderColor(request),
    backgroundColor: isDisabled ? theme.colors.surface2 : theme.colors.surface,
  };
}

export function createInputFieldStyle(textStyle: TextStyle, isMultiline: boolean): TextStyle {
  return {
    ...textStyle,
    flex: 1,
    paddingVertical: 0,
    textAlignVertical: isMultiline ? 'top' : 'center',
  };
}
