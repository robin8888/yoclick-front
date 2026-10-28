import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getVoiceGetMyStudentCodeQueryOptions } from '@/shared/api/generated/endpoints/voice-receptionist/voice-receptionist';
import type { StudentCodeResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** El código de 6 cifras de la persona en este centro (el servidor lo crea la primera vez). */
export function useStudentCode(): UseQueryResult<StudentCodeResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  return useQuery(getVoiceGetMyStudentCodeQueryOptions(centerId));
}
