import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query';

import {
  getVoiceListCallsQueryKey,
  voiceListCalls,
} from '@/shared/api/generated/endpoints/voice-receptionist/voice-receptionist';
import type {
  VoiceCallsResponseDto,
  VoiceCallsResponseDtoDataItem,
} from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';

const CALLS_PAGE_SIZE = 20;

interface VoiceCalls {
  calls: readonly VoiceCallsResponseDtoDataItem[];
  query: UseInfiniteQueryResult<InfiniteData<VoiceCallsResponseDto>>;
}

/** Historial de llamadas, de la más reciente a la más antigua, con «Ver más» por cursor. */
export function useVoiceCalls(): VoiceCalls {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const params = { limit: CALLS_PAGE_SIZE };
  const query = useInfiniteQuery({
    queryKey: getVoiceListCallsQueryKey(centerId, params),
    queryFn: ({ pageParam }) =>
      voiceListCalls(centerId, pageParam === '' ? params : { ...params, cursor: pageParam }),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return { calls: query.data?.pages.flatMap((page) => page.data) ?? [], query };
}
