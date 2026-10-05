import { useQuery } from '@tanstack/react-query';

import { getMeGetProfileQueryOptions } from '@/shared/api/generated/endpoints/me/me';
import { useSessionStore } from '@/shared/auth/session-store';

/**
 * Nombre completo de quien ha entrado. Si la sesión se restauró al abrir la app el nombre aún no
 * está en memoria (solo llega al iniciar sesión), así que se pide al perfil.
 */
export function useClientFullName(): string {
  const sessionFullName = useSessionStore((state) => state.user?.fullName);
  const profile = useQuery(getMeGetProfileQueryOptions({ query: { enabled: !sessionFullName } }));
  return sessionFullName ?? profile.data?.fullName ?? '';
}
