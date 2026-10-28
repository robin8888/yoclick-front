import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getVoiceGetOverviewQueryOptions } from '@/shared/api/generated/endpoints/voice-receptionist/voice-receptionist';
import type { VoiceOverviewResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** Estado del Contestador IA del centro activo: número, ajustes, capacidades y consumo. */
export function useVoiceOverview(): UseQueryResult<VoiceOverviewResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  return useQuery(getVoiceGetOverviewQueryOptions(centerId));
}
