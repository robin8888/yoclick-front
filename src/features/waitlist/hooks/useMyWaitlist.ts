import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getWaitlistListMineQueryOptions } from '@/shared/api/generated/endpoints/waitlist/waitlist';
import type { MyWaitlistResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

/** Las clases en cuya lista de espera está la persona, en cola o con una plaza ofrecida. */
export function useMyWaitlist(): UseQueryResult<MyWaitlistResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  return useQuery(
    getWaitlistListMineQueryOptions(centerId ?? '', { query: { enabled: centerId !== null } }),
  );
}
