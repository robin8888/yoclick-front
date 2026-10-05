import { useSessionStore } from '@/shared/auth/session-store';

/** El centro que se administra. Dentro de la zona de administración siempre hay uno. */
export function useActiveCenterId(): string {
  return useSessionStore((state) => state.activeCenterId) ?? '';
}
