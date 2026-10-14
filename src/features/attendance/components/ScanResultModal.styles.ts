import type { ViewStyle } from 'react-native';

import type { Theme } from '@/shared/theme';

const CARD_BORDER_WIDTH = 3;
const VERDICT_ICON_SIZE = 56;
const BACKDROP_OPACITY = 0.55;

/** El telón que oscurece la cámara; la tarjeta va encima, sin heredar su opacidad. */
export function createScanBackdropVeilStyle(theme: Theme): ViewStyle {
  return {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: theme.colors.ink,
    opacity: BACKDROP_OPACITY,
  };
}

export function createScanAnchorStyle(theme: Theme): ViewStyle {
  return { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.space[5] };
}

/** Verde si puede entrar, rojo si no: el color lleva además la palabra, nunca va solo. */
export function createScanCardStyle(theme: Theme, isGranted: boolean): ViewStyle {
  return {
    width: '100%',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius.xl,
    borderWidth: CARD_BORDER_WIDTH,
    borderColor: isGranted ? theme.colors.success : theme.colors.danger,
    backgroundColor: isGranted ? theme.colors.successSoft : theme.colors.dangerSoft,
  };
}

export function createVerdictIconStyle(theme: Theme, isGranted: boolean): ViewStyle {
  return {
    width: VERDICT_ICON_SIZE,
    height: VERDICT_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: VERDICT_ICON_SIZE,
    backgroundColor: isGranted ? theme.colors.success : theme.colors.danger,
  };
}

export function createScanDetailsStyle(theme: Theme): ViewStyle {
  return { alignItems: 'center', gap: theme.space[1] };
}
