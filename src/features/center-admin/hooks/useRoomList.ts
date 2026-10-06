import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getRoomsListQueryOptions } from '@/shared/api/generated/endpoints/rooms/rooms';
import type { RoomListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Salas y recursos del centro que no se han quitado. */
export function useRoomList(): UseQueryResult<RoomListResponseDto, ErrorType> {
  return useQuery(getRoomsListQueryOptions(useActiveCenterId()));
}
