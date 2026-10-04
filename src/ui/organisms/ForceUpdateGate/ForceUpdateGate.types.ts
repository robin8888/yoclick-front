import type { ReactNode } from 'react';

export interface ForceUpdateGateProps {
  /** Lo decide `useIsAppUpdateRequired()` (comparación de versiones inyectable en sus tests). */
  isUpdateRequired: boolean;
  title: string;
  message: string;
  updateButtonLabel: string;
  /** Abre la ficha de la tienda: la pantalla que monta el gate conoce el enlace. */
  onUpdatePress: () => void;
  children: ReactNode;
}
