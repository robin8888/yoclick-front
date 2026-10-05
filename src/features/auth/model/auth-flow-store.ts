import { create } from 'zustand';

import type { ExperienceDuration } from './starting-level';

export type AuthNotice = 'passwordChanged' | 'emailVerified' | 'mfaEnabled';

/** Datos del alta que se reúnen en dos pantallas y se envían juntos al final. */
export interface RegistrationDraft {
  readonly fullName: string;
  readonly email: string;
  /** Solo en memoria hasta enviar el alta (SEC-03): se borra al enviar, con éxito o sin él. */
  readonly password: string;
  readonly hasMarketingConsent: boolean;
  readonly experience: ExperienceDuration | null;
  readonly goalIds: readonly string[];
}

interface AuthFlowState {
  readonly registrationDraft: RegistrationDraft | null;
  /** Correo al que se envió el código de verificación o de recuperación. */
  readonly pendingEmail: string | null;
  /** Desafío del segundo factor; nunca va en la URL (SEC-21). */
  readonly mfaChallengeToken: string | null;
  readonly notice: AuthNotice | null;
  readonly saveRegistrationDraft: (draft: RegistrationDraft) => void;
  readonly clearRegistrationDraft: () => void;
  readonly savePendingEmail: (email: string) => void;
  readonly saveMfaChallengeToken: (mfaToken: string) => void;
  readonly clearMfaChallengeToken: () => void;
  readonly showNotice: (notice: AuthNotice) => void;
  readonly dismissNotice: () => void;
}

export const useAuthFlowStore = create<AuthFlowState>((set) => ({
  registrationDraft: null,
  pendingEmail: null,
  mfaChallengeToken: null,
  notice: null,
  saveRegistrationDraft: (draft) => {
    set({ registrationDraft: draft });
  },
  clearRegistrationDraft: () => {
    set({ registrationDraft: null });
  },
  savePendingEmail: (email) => {
    set({ pendingEmail: email });
  },
  saveMfaChallengeToken: (mfaToken) => {
    set({ mfaChallengeToken: mfaToken });
  },
  clearMfaChallengeToken: () => {
    set({ mfaChallengeToken: null });
  },
  showNotice: (notice) => {
    set({ notice });
  },
  dismissNotice: () => {
    set({ notice: null });
  },
}));
