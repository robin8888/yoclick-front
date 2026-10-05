import { create } from 'zustand';

interface PendingInvitationState {
  /** Código llegado por enlace (`/i/{código}`) y aún sin aceptar. */
  readonly invitationCode: string | null;
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
  saveInvitationCode: (invitationCode) => {
    set({ invitationCode, isInvitationExpected: true });
  },
  expectInvitation: () => {
    set({ isInvitationExpected: true });
  },
  clearInvitation: () => {
    set({ invitationCode: null, isInvitationExpected: false });
  },
}));
