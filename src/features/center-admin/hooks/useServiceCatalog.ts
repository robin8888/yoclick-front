import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getServicesListQueryOptions } from '@/shared/api/generated/endpoints/services/services';
import type { ServiceListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Servicios del centro, también los ocultos: es lo que el equipo administra. */
export function useServiceCatalog(): UseQueryResult<ServiceListResponseDto, ErrorType> {
  return useQuery(getServicesListQueryOptions(useActiveCenterId()));
}
