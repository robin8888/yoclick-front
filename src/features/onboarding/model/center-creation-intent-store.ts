import { create } from 'zustand';

interface CenterCreationIntentState {
  readonly isCenterCreationRequested: boolean;
  readonly startCenterCreation: () => void;
  readonly finishCenterCreation: () => void;
}

/**
 * Recuerda que la persona entró por «Crea la app de tu centro» mientras crea la cuenta, verifica
 * el correo e inicia sesión: al volver a la raíz la app la lleva al alta del centro, no a «Unirse».
 */
export const useCenterCreationIntentStore = create<CenterCreationIntentState>((set) => ({
  isCenterCreationRequested: false,
  startCenterCreation: () => {
    set({ isCenterCreationRequested: true });
  },
  finishCenterCreation: () => {
    set({ isCenterCreationRequested: false });
  },
}));
