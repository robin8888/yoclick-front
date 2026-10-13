import { useSessionStore } from '@/shared/auth/session-store';

/** El centro en el que está la persona; sin centro activo, un texto vacío que no llega a la API. */
export function useActiveCenterId(): string {
  return useSessionStore((state) => state.activeCenterId) ?? '';
}
