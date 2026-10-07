import { create } from 'zustand';

interface PushTokenState {
  /** El token de Expo de este móvil, una vez registrado en la API; no se guarda en disco. */
  registeredToken: string | null;
  setRegisteredToken: (token: string | null) => void;
}

export const usePushTokenStore = create<PushTokenState>((set) => ({
  registeredToken: null,
  setRegisteredToken: (token) => {
    set({ registeredToken: token });
  },
}));
