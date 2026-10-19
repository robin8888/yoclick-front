import { create } from 'zustand';

interface RealtimeStatusState {
  /** El WebSocket está identificado y recibiendo avisos: el sondeo puede espaciarse. */
  readonly isConnected: boolean;
  readonly setConnected: (isConnected: boolean) => void;
}

export const useRealtimeStatusStore = create<RealtimeStatusState>((set) => ({
  isConnected: false,
  setConnected: (isConnected) => {
    set({ isConnected });
  },
}));
