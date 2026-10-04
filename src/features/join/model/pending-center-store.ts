import { create } from 'zustand';

import type { PendingCenter } from './pending-center';

interface PendingCenterState {
  readonly pendingCenter: PendingCenter | null;
  readonly selectPendingCenter: (center: PendingCenter) => void;
  readonly clearPendingCenter: () => void;
}

/**
 * Borrador del flujo «Unirse»: el centro elegido antes de tener sesión. Vive solo en memoria;
 * una vez unido, los datos del centro vienen del servidor (`/me/memberships`).
 */
export const usePendingCenterStore = create<PendingCenterState>((set) => ({
  pendingCenter: null,
  selectPendingCenter: (center) => {
    set({ pendingCenter: center });
  },
  clearPendingCenter: () => {
    set({ pendingCenter: null });
  },
}));
