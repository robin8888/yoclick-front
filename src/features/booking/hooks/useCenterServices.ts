import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getServicesListQueryOptions } from '@/shared/api/generated/endpoints/services/services';
import type { ServiceListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Servicios reservables del centro activo. */
export function useCenterServices(): UseQueryResult<ServiceListResponseDto, ErrorType> {
  const centerId = useActiveCenterId();
  return useQuery(
    getServicesListQueryOptions(centerId ?? '', { query: { enabled: centerId !== null } }),
  );
}
