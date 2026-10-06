import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getClientsGetQueryOptions } from '@/shared/api/generated/endpoints/clients/clients';
import type { ClientResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** Un cliente del centro con su nivel y su grupo. */
export function useClient(membershipId: string): UseQueryResult<ClientResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  return useQuery(
    getClientsGetQueryOptions(centerId ?? '', membershipId, {
      query: { enabled: centerId !== null },
    }),
  );
}
