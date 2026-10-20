import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getWaitlistListForSessionQueryOptions } from '@/shared/api/generated/endpoints/waitlist/waitlist';
import type { SessionWaitlistResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** Quién espera una clase llena; solo lo pide el personal del centro. */
export function useSessionWaitlist(
  classSessionId: string,
): UseQueryResult<SessionWaitlistResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  return useQuery(
    getWaitlistListForSessionQueryOptions(centerId ?? '', classSessionId, {
      query: { enabled: centerId !== null },
    }),
  );
}
