import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getTimeEntriesListQueryOptions } from '@/shared/api/generated/endpoints/time-entries/time-entries';
import type { TimeEntryListResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Los fichajes de la persona en un mes (`YYYY-MM`), con sus totales. */
export function useMonthTimeEntries(
  monthId: string,
): UseQueryResult<TimeEntryListResponseDto, ErrorType> {
  const centerId = useActiveCenterId();
  return useQuery(
    getTimeEntriesListQueryOptions(
      centerId,
      { month: monthId },
      { query: { enabled: centerId !== '' } },
    ),
  );
}
