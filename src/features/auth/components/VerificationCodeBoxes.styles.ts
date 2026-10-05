import type { TextStyle, ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const CODE_BOX_WIDTH = 48;
const CODE_BOX_HEIGHT = 60;
const CODE_BOX_GAP = 8;
const CODE_BOX_BORDER_WIDTH = 1.5;
const ACTIVE_BOX_BORDER_WIDTH = 2.5;

export const CODE_BOXES_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: CODE_BOX_GAP,
};

// Invisible pero con el tamaño de toda la fila: tocar cualquier casilla enfoca el campo.
export const CODE_INPUT_OVERLAY_STYLE: TextStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  opacity: 0.01,
};

interface CodeBoxStyleRequest {
  theme: Theme;
  isActive: boolean;
  isInvalid: boolean;
}

export function createCodeBoxStyle({ theme, isActive, isInvalid }: CodeBoxStyleRequest): ViewStyle {
  const hasStrongBorder = isActive || isInvalid;
  const idleBorderColor = isActive ? theme.colors.ink : theme.colors.line;
  return {
    width: CODE_BOX_WIDTH,
    height: CODE_BOX_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    borderWidth: hasStrongBorder ? ACTIVE_BOX_BORDER_WIDTH : CODE_BOX_BORDER_WIDTH,
    borderColor: isInvalid ? theme.colors.danger : idleBorderColor,
    backgroundColor: theme.colors.surface,
  };
}
