import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getTeamListQueryOptions } from '@/shared/api/generated/endpoints/team/team';
import type { TeamResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Todo el equipo del centro (también quien aún no ha aceptado la invitación). */
export function useTeamRoster(): UseQueryResult<TeamResponseDto, ErrorType> {
  return useQuery(getTeamListQueryOptions(useActiveCenterId()));
}
