import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import { getApiErrorMessage } from '@/shared/api/errors';
import {
  chatBlockPerson,
  chatReportMessage,
  chatReviewMessageReport,
  chatUnblockPerson,
  getChatListBlocksQueryKey,
  getChatListBlocksQueryOptions,
  getChatListConversationsQueryKey,
  getChatListMessageReportsQueryKey,
  getChatListMessageReportsQueryOptions,
} from '@/shared/api/generated/endpoints/chat/chat';
import type {
  BlockedPeopleResponseDto,
  MessageReportListResponseDto,
  ReportMessageRequestDto,
} from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Las personas que quien mira ha bloqueado en el centro. */
export function useBlockedPeople(): UseQueryResult<BlockedPeopleResponseDto, ErrorType> {
  return useQuery(getChatListBlocksQueryOptions(useActiveCenterId()));
}

/** Las denuncias abiertas del centro (solo propietario y administración). */
export function useOpenMessageReports(): UseQueryResult<MessageReportListResponseDto, ErrorType> {
  return useQuery(getChatListMessageReportsQueryOptions(useActiveCenterId(), { status: 'open' }));
}

interface BlockPerson {
  block: (blockedMembershipId: string, onBlocked: () => void) => void;
  isBlocking: boolean;
  errorMessage: string | null;
  reset: () => void;
}

/** Bloquea a una persona: su conversación desaparece de la bandeja, así que se recarga. No es optimista. */
export function useBlockPerson(): BlockPerson {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (blockedMembershipId: string) => chatBlockPerson(centerId, { blockedMembershipId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getChatListBlocksQueryKey(centerId) });
      void queryClient.invalidateQueries({ queryKey: getChatListConversationsQueryKey(centerId) });
    },
  });

  return {
    block: (blockedMembershipId, onBlocked) => {
      mutation.mutate(blockedMembershipId, { onSuccess: onBlocked });
    },
    isBlocking: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}

interface UnblockPerson {
  unblock: (blockedMembershipId: string) => void;
  /** La persona que se está desbloqueando, para marcar su botón como ocupado. */
  pendingMembershipId: string | null;
  errorMessage: string | null;
}

export function useUnblockPerson(): UnblockPerson {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (blockedMembershipId: string) => chatUnblockPerson(centerId, blockedMembershipId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getChatListBlocksQueryKey(centerId) });
      void queryClient.invalidateQueries({ queryKey: getChatListConversationsQueryKey(centerId) });
    },
  });

  return {
    unblock: (blockedMembershipId) => {
      mutation.mutate(blockedMembershipId);
    },
    pendingMembershipId: mutation.isPending ? mutation.variables : null,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}

interface ReportMessageInput {
  messageId: string;
  reason: ReportMessageRequestDto['reason'];
  details: string;
}

interface ReportMessage {
  report: (input: ReportMessageInput, onReported: () => void) => void;
  isReporting: boolean;
  errorMessage: string | null;
  reset: () => void;
}

/** Denuncia un mensaje de una conversación; los detalles solo se mandan si la persona escribió algo. */
export function useReportMessage(conversationId: string): ReportMessage {
  const centerId = useActiveCenterId();
  const mutation = useMutation({
    mutationFn: ({ messageId, reason, details }: ReportMessageInput) =>
      chatReportMessage(centerId, conversationId, messageId, {
        reason,
        ...(details.trim() === '' ? {} : { details: details.trim() }),
      }),
  });

  return {
    report: (input, onReported) => {
      mutation.mutate(input, { onSuccess: onReported });
    },
    isReporting: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}

interface ReviewMessageReport {
  review: (reportId: string) => void;
  pendingReportId: string | null;
  errorMessage: string | null;
}

export function useReviewMessageReport(): ReviewMessageReport {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (reportId: string) => chatReviewMessageReport(centerId, reportId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getChatListMessageReportsQueryKey(centerId) });
    },
  });

  return {
    review: (reportId) => {
      mutation.mutate(reportId);
    },
    pendingReportId: mutation.isPending ? mutation.variables : null,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
