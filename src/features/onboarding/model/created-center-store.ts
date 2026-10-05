import { create } from 'zustand';

export interface CreatedCenter {
  readonly centerId: string;
  readonly name: string;
  /** Color elegido en el alta: fondo del logo mientras no hay imagen. */
  readonly brandColor: string;
  readonly joinCode: string;
}

interface CreatedCenterState {
  readonly createdCenter: CreatedCenter | null;
  readonly saveCreatedCenter: (center: CreatedCenter) => void;
  readonly clearCreatedCenter: () => void;
}

/** El código de unión solo lo devuelve el alta: se guarda en memoria para la pantalla final. */
export const useCreatedCenterStore = create<CreatedCenterState>((set) => ({
  createdCenter: null,
  saveCreatedCenter: (center) => {
    set({ createdCenter: center });
  },
  clearCreatedCenter: () => {
    set({ createdCenter: null });
  },
}));
