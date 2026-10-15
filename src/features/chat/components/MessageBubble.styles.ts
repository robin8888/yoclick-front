import type { ImageStyle, ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const MAX_BUBBLE_WIDTH_PERCENT = '82%';
const PHOTO_SIZE = 200;

export function createBubbleRowStyle(isMine: boolean): ViewStyle {
  return { flexDirection: 'row', justifyContent: isMine ? 'flex-end' : 'flex-start' };
}

export function createBubbleStyle(theme: Theme, isMine: boolean): ViewStyle {
  return {
    // Sin `flexShrink` una línea sin espacios empuja la burbuja fuera de la pantalla.
    flexShrink: 1,
    maxWidth: MAX_BUBBLE_WIDTH_PERCENT,
    gap: theme.space[1],
    padding: theme.space[3],
    borderRadius: theme.radius.lg,
    backgroundColor: isMine ? theme.colors.brand : theme.colors.surface,
    // La esquina del lado de quien habla, casi recta: el «pico» de la burbuja.
    ...(isMine
      ? { borderBottomRightRadius: theme.radius.sm }
      : { borderBottomLeftRadius: theme.radius.sm }),
  };
}

export function createImageStyle(theme: Theme): ImageStyle {
  return { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: theme.radius.md };
}

export function createDocumentStyle(theme: Theme): ViewStyle {
  return {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    padding: theme.space[2],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  };
}
