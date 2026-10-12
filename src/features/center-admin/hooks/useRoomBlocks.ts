import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getRoomBlocksListOfRoomQueryOptions } from '@/shared/api/generated/endpoints/rooms/rooms';
import type { RoomBlockListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface RoomBlocksRequest {
  roomId: string;
  from: string;
  to: string;
}

/** Los bloqueos (alquiler, mantenimiento, evento) de un espacio entre dos fechas. */
export function useRoomBlocks({
  roomId,
  from,
  to,
}: RoomBlocksRequest): UseQueryResult<RoomBlockListResponseDto, ErrorType> {
  return useQuery(getRoomBlocksListOfRoomQueryOptions(useActiveCenterId(), roomId, { from, to }));
}
