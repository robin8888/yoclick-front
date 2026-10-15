import { create } from 'zustand';

export interface SessionUser {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
}

export interface ActingFor {
  readonly membershipId: string;
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
  /** El hijo en cuyo nombre actúa un tutor; `null`, actúa por sí mismo. Solo en memoria. */
  readonly actingFor: ActingFor | null;
}

interface SessionActions {
  startSession: (session: { accessToken: string; user: SessionUser | null }) => void;
  replaceAccessToken: (accessToken: string) => void;
  selectActiveCenter: (centerId: string | null) => void;
  setActingFor: (child: ActingFor | null) => void;
  resetSession: () => void;
}

const SIGNED_OUT_STATE: SessionState = {
  status: 'signedOut',
  accessToken: null,
  user: null,
  activeCenterId: null,
  actingFor: null,
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
    // Otro centro, otros hijos: nunca se arrastra a quien se representaba.
    set({ activeCenterId: centerId, actingFor: null });
  },
  setActingFor: (child) => {
    set({ actingFor: child });
  },
  resetSession: () => {
    set(SIGNED_OUT_STATE);
  },
}));

export function getAccessToken(): string | null {
  return useSessionStore.getState().accessToken;
}

export function getActingForMembershipId(): string | null {
  return useSessionStore.getState().actingFor?.membershipId ?? null;
}

export function getActiveCenterId(): string | null {
  return useSessionStore.getState().activeCenterId;
}
