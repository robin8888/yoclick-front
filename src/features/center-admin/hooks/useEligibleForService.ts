import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getPassesEligibleQueryOptions } from '@/shared/api/generated/endpoints/passes/passes';
import type { EligibleClientsResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Las personas con un bono en vigor y clases por agendar para ese servicio. */
export function useEligibleForService(
  serviceId: string,
): UseQueryResult<EligibleClientsResponseDto, ErrorType> {
  const centerId = useActiveCenterId();
  return useQuery(
    getPassesEligibleQueryOptions(
      centerId,
      { serviceId },
      { query: { enabled: serviceId !== '' } },
    ),
  );
}
