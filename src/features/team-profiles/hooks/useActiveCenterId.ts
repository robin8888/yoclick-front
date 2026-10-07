import { useSessionStore } from '@/shared/auth/session-store';

/** El centro activo; dentro de cada zona de la app siempre hay uno. */
export function useActiveCenterId(): string {
  return useSessionStore((state) => state.activeCenterId) ?? '';
}
