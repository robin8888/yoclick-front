import { useQuery } from '@tanstack/react-query';

import { getClientsListQueryOptions } from '@/shared/api/generated/endpoints/clients/clients';
import { useSessionStore } from '@/shared/auth/session-store';

/** Cuántas personas activas hay en la lista de quien mira (el servidor la acota por rol). */
export function useActiveClientCount(): number | undefined {
  const centerId = useSessionStore((state) => state.activeCenterId);
  const activeClients = useQuery(
    getClientsListQueryOptions(
      centerId ?? '',
      { status: 'active', limit: 1 },
      { query: { enabled: centerId !== null, select: (response) => response.matchingCount } },
    ),
  );
  return activeClients.data;
}
