import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getRoomRentalsMineQueryOptions } from '@/shared/api/generated/endpoints/rooms/rooms';
import type { MyRentalsResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los alquileres de sala hechos a nombre de la persona, con su precio y si ya están pagados. */
export function useMyRentals(): UseQueryResult<MyRentalsResponseDto, ErrorType> {
  return useQuery(getRoomRentalsMineQueryOptions(useActiveCenterId()));
}
