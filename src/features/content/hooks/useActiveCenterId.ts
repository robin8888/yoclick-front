import { useSessionStore } from '@/shared/auth/session-store';

/** El centro activo; dentro de la zona de equipo o de cliente siempre hay uno. */
export function useActiveCenterId(): string {
  return useSessionStore((state) => state.activeCenterId) ?? '';
}
