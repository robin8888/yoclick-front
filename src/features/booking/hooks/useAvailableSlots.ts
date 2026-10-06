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
  /** Solo las horas de esta persona; sin él, las de cualquiera con hueco. */
  staffMembershipId?: string | undefined;
  /** Solo el equipo: cada cuántos minutos puede empezar un hueco (15 → 10:00, 10:15, 10:30…). */
  stepMinutes?: number | undefined;
}

/** Huecos libres de un servicio entre dos fechas; los calcula el servidor (nunca el móvil). */
export function useAvailableSlots({
  serviceId,
  fromDate,
  toDate,
  staffMembershipId,
  stepMinutes,
}: AvailableSlotsRequest): UseQueryResult<AvailabilityResponseDto, ErrorType> {
  const centerId = useActiveCenterId();
  return useQuery(
    getAvailabilityGetQueryOptions(
      centerId ?? '',
      {
        serviceId,
        from: fromDate,
        to: toDate,
        ...(staffMembershipId === undefined ? {} : { staffMembershipId }),
        ...(stepMinutes === undefined ? {} : { stepMinutes }),
      },
      { query: { enabled: centerId !== null } },
    ),
  );
}
