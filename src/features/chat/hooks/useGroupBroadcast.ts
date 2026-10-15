import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getApiErrorMessage } from '@/shared/api/errors';
import {
  chatBroadcastToGroup,
  getChatListBroadcastTargetsQueryOptions,
  getChatListConversationsQueryKey,
} from '@/shared/api/generated/endpoints/chat/chat';
import type { BroadcastTargetsResponseDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** A quién se escribe: un grupo de clientes o una clase fija de «Gestión» (sus apuntados). */
export type BroadcastTarget =
  { kind: 'group'; groupId: string } | { kind: 'series'; seriesId: string };

/** Los grupos y las clases a los que puede escribir quien mira: todos el centro, los suyos un profesor. */
export function useBroadcastTargets(): UseQueryResult<BroadcastTargetsResponseDto, ErrorType> {
  return useQuery(getChatListBroadcastTargetsQueryOptions(useActiveCenterId()));
}

export interface BroadcastResult {
  sentCount: number;
  skippedMinorCount: number;
}

interface GroupBroadcast {
  send: (request: { target: BroadcastTarget; body: string }, onSent: () => void) => void;
  isSending: boolean;
  result: BroadcastResult | null;
  errorMessage: string | null;
}

/** Escribe a todas las personas de un grupo o de una clase; no es optimista: espera al servidor. */
export function useGroupBroadcast(): GroupBroadcast {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ target, body }: { target: BroadcastTarget; body: string }) =>
      chatBroadcastToGroup(
        centerId,
        target.kind === 'group'
          ? { groupId: target.groupId, body }
          : { seriesId: target.seriesId, body },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getChatListConversationsQueryKey(centerId) });
    },
  });

  return {
    send: (request, onSent) => {
      mutation.mutate(request, { onSuccess: onSent });
    },
    isSending: mutation.isPending,
    result: mutation.data ?? null,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
