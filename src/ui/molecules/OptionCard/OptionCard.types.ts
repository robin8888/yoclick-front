import type { ReactNode } from 'react';

/** `single`: selector circular (una opción); `multiple`: casilla cuadrada (varias a la vez). */
export type OptionSelectionMode = 'single' | 'multiple';

export interface OptionCardProps {
  title: string;
  /** «60 min · Individual · 35 €». */
  meta?: string | undefined;
  description?: string | undefined;
  /** Avatar o icono antes del texto; con él el selector pasa al final de la tarjeta. */
  leading?: ReactNode;
  selectionMode?: OptionSelectionMode;
  isSelected: boolean;
  onPress: () => void;
}
