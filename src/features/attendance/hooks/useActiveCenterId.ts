import { useSessionStore } from '@/shared/auth/session-store';

/** El centro en el que está la persona; vacío solo fuera de las zonas de centro. */
export function useActiveCenterId(): string {
  return useSessionStore((state) => state.activeCenterId) ?? '';
}
