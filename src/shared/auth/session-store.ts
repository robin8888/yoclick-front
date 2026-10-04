import { create } from 'zustand';

export interface SessionUser {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
}

// `restoring`: arranque, aún no sabemos si hay un refresh token válido en SecureStore.
export type SessionStatus = 'restoring' | 'signedIn' | 'signedOut';

interface SessionState {
  readonly status: SessionStatus;
  /** Solo en memoria (SEC-04): jamás se persiste ni se loguea. */
  readonly accessToken: string | null;
  readonly user: SessionUser | null;
  readonly activeCenterId: string | null;
}

interface SessionActions {
  startSession: (session: { accessToken: string; user: SessionUser | null }) => void;
  replaceAccessToken: (accessToken: string) => void;
  selectActiveCenter: (centerId: string | null) => void;
  resetSession: () => void;
}

const SIGNED_OUT_STATE: SessionState = {
  status: 'signedOut',
  accessToken: null,
  user: null,
  activeCenterId: null,
};

export const useSessionStore = create<SessionState & SessionActions>((set) => ({
  ...SIGNED_OUT_STATE,
  status: 'restoring',
  startSession: ({ accessToken, user }) => {
    set((previous) => ({ status: 'signedIn', accessToken, user: user ?? previous.user }));
  },
  replaceAccessToken: (accessToken) => {
    set({ accessToken, status: 'signedIn' });
  },
  selectActiveCenter: (centerId) => {
    set({ activeCenterId: centerId });
  },
  resetSession: () => {
    set(SIGNED_OUT_STATE);
  },
}));

export function getAccessToken(): string | null {
  return useSessionStore.getState().accessToken;
}

export function getActiveCenterId(): string | null {
  return useSessionStore.getState().activeCenterId;
}
