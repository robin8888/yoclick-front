import type { ViewStyle } from 'react-native';

import { FINISHED_PALETTE } from './finished-palette';

export interface FinishedLook {
  /** Para `<Text {...tint}>`: texto blanco sobre el gris; vacío si no ha terminado. */
  tint: { tintColor?: string };
  /** Para el fondo y el borde de la tarjeta; vacío si no ha terminado. */
  cardStyle: ViewStyle;
}

const NORMAL_LOOK: FinishedLook = { tint: {}, cardStyle: {} };

const FINISHED_LOOK: FinishedLook = {
  tint: { tintColor: FINISHED_PALETTE.text },
  cardStyle: {
    backgroundColor: FINISHED_PALETTE.background,
    borderColor: FINISHED_PALETTE.background,
  },
};

/** Lo que cambia en una tarjeta que ya terminó: gris con texto blanco. */
export function buildFinishedLook(isFinished: boolean): FinishedLook {
  return isFinished ? FINISHED_LOOK : NORMAL_LOOK;
}
