import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

export type PanelTone = 'default' | 'warning' | 'danger';

const TONE_BORDER_WIDTH = 2;

export function createPanelStyle(theme: Theme, tone: PanelTone): ViewStyle {
  return {
    alignSelf: 'stretch',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius.lg,
    borderWidth: tone === 'default' ? 1 : TONE_BORDER_WIDTH,
    borderColor: tone === 'default' ? theme.colors.line : theme.colors[tone],
    backgroundColor: theme.colors.surface,
  };
}

/**
 * Envuelve un texto que va junto a otros elementos en una fila: en React Native un `Text` no encoge
 * por sí solo y se sale de su tarjeta. Con `flex: 1` y `minWidth: 0` ocupa lo que sobra y se parte en
 * varias líneas.
 */
export const FLEXIBLE_TEXT_STYLE: ViewStyle = { flex: 1, minWidth: 0 };

/** Una fila que reparte el ancho: lo que no cabe baja a la línea siguiente en vez de salirse. */
export const WRAPPING_ROW_STYLE: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
};
