import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getAvailabilityGetQueryOptions } from '@/shared/api/generated/endpoints/scheduling/scheduling';
import type { AvailabilityResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface AvailableSlotsRequest {
  serviceId: string;
  /** `YYYY-MM-DD` en la zona del centro. */
  fromDate: string;
  toDate: string;
}

/** Huecos libres de un servicio entre dos fechas; los calcula el servidor (nunca el móvil). */
export function useAvailableSlots({
  serviceId,
  fromDate,
  toDate,
}: AvailableSlotsRequest): UseQueryResult<AvailabilityResponseDto, ErrorType> {
  const centerId = useActiveCenterId();
  return useQuery(
    getAvailabilityGetQueryOptions(
      centerId ?? '',
      { serviceId, from: fromDate, to: toDate },
      { query: { enabled: centerId !== null } },
    ),
  );
}
