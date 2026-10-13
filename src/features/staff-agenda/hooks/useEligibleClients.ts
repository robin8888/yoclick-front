import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPassesEligibleQueryOptions } from '@/shared/api/generated/endpoints/passes/passes';
import type { EligibleClientsResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/**
 * Las personas a las que el centro puede apuntar a una clase de ese servicio: con un bono en vigor
 * y clases por agendar. Es lo único que se ofrece al apuntar a alguien a un grupo.
 */
export function useEligibleClients(
  serviceId: string,
): UseQueryResult<EligibleClientsResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  return useQuery(getPassesEligibleQueryOptions(centerId, { serviceId }));
}
