import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getBookingsListMineQueryOptions } from '@/shared/api/generated/endpoints/bookings/bookings';
import type { MyBookingsResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

export type BookingScope = 'upcoming' | 'past';

/** Citas de la persona en el centro activo: próximas o pasadas (con las canceladas). */
export function useMyBookings(
  scope: BookingScope,
): UseQueryResult<MyBookingsResponseDto, ErrorType> {
  const centerId = useActiveCenterId();
  return useQuery(
    getBookingsListMineQueryOptions(
      centerId ?? '',
      { scope },
      { query: { enabled: centerId !== null } },
    ),
  );
}
