import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const MODAL_MAX_WIDTH = 420;
const BACKDROP_OPACITY_HEX = '99';
const ICON_CIRCLE_SIZE = 48;
const HALF = 2;

/** Centrado y con margen a los lados, sobre un fondo que apaga lo de detrás. */
export const MODAL_ANCHOR_STYLE: ViewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
};

export function createBackdropStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    top: 0,
    bottom: 0,
    start: 0,
    end: 0,
    backgroundColor: `${theme.colors.ink}${BACKDROP_OPACITY_HEX}`,
  };
}

export function createCardStyle(theme: Theme): ViewStyle {
  return {
    width: '100%',
    maxWidth: MODAL_MAX_WIDTH,
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
  };
}

export function createIconStyle(theme: Theme): ViewStyle {
  return {
    width: ICON_CIRCLE_SIZE,
    height: ICON_CIRCLE_SIZE,
    borderRadius: ICON_CIRCLE_SIZE / HALF,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface2,
  };
}
