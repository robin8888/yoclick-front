import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getSessionRecordsListQueryOptions } from '@/shared/api/generated/endpoints/bookings/bookings';
import type { SessionRecordsResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

interface SessionRecordsRequest {
  fromDate: string;
  toDate: string;
}

/** Registro de clases del centro entre dos fechas (propietario y administración, con 2FA). */
export function useSessionRecords({
  fromDate,
  toDate,
}: SessionRecordsRequest): UseQueryResult<SessionRecordsResponseDto, ErrorType> {
  const centerId = useSessionStore((state) => state.activeCenterId);
  return useQuery(
    getSessionRecordsListQueryOptions(
      centerId ?? '',
      { from: fromDate, to: toDate },
      { query: { enabled: centerId !== null } },
    ),
  );
}
