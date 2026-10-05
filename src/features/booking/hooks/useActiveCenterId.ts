import { useSessionStore } from '@/shared/auth/session-store';

/** El centro en el que está la persona. Dentro de las zonas de centro siempre hay uno. */
export function useActiveCenterId(): string | null {
  return useSessionStore((state) => state.activeCenterId);
}
