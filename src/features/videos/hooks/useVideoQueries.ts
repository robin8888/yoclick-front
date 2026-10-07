import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getVideosGetPlanQueryOptions } from '@/shared/api/generated/endpoints/videos/videos';
import type { VideoPlanResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Si el plan del centro incluye vídeo y cuánto espacio queda; solo lo consulta el equipo. */
export function useVideoPlan(): UseQueryResult<VideoPlanResponseDto, ErrorType> {
  return useQuery(getVideosGetPlanQueryOptions(useActiveCenterId()));
}
