import { create } from 'zustand';

import { useSessionStore } from '@/shared/auth/session-store';

interface PendingInvitationState {
  /** Código llegado por enlace (`/i/{código}`) y aún sin aceptar. */
  readonly invitationCode: string | null;
  /**
   * El código llegó antes de iniciar sesión (enlace o «Tengo un código»): al volver con sesión se
   * acepta solo. Si ya había sesión se pide confirmación, porque podría ser otra cuenta.
   */
  readonly isAutoAcceptAllowed: boolean;
  /** Hay una aceptación en marcha: aunque haya dos pantallas, solo sale una petición. */
  readonly isAcceptInFlight: boolean;
  readonly setAcceptInFlight: (isAcceptInFlight: boolean) => void;
  /** La persona dijo en el registro que es instructor: al entrar se le pide su código. */
  readonly isInvitationExpected: boolean;
  readonly saveInvitationCode: (invitationCode: string) => void;
  readonly expectInvitation: () => void;
  readonly clearInvitation: () => void;
}

/** Solo en memoria: sobrevive al registro y al inicio de sesión, no a cerrar la app. */
export const usePendingInvitationStore = create<PendingInvitationState>((set) => ({
  invitationCode: null,
  isInvitationExpected: false,
  isAutoAcceptAllowed: false,
  isAcceptInFlight: false,
  setAcceptInFlight: (isAcceptInFlight) => {
    set({ isAcceptInFlight });
  },
  saveInvitationCode: (invitationCode) => {
    const isSignedOut = useSessionStore.getState().status !== 'signedIn';
    set({ invitationCode, isInvitationExpected: true, isAutoAcceptAllowed: isSignedOut });
  },
  expectInvitation: () => {
    set({ isInvitationExpected: true });
  },
  clearInvitation: () => {
    set({
      invitationCode: null,
      isInvitationExpected: false,
      isAutoAcceptAllowed: false,
      isAcceptInFlight: false,
    });
  },
}));
