import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  chatMarkRead,
  chatOpenConversation,
  chatSendMessage,
  getChatListConversationsQueryKey,
  getChatListMessagesQueryKey,
} from '@/shared/api/generated/endpoints/chat/chat';

import { useActiveCenterId } from './useActiveCenterId';

interface OpenConversation {
  /** `null` es escribir al centro; avisa con el id de la conversación cuando ya está abierta. */
  open: (withMembershipId: string | null, onOpened: (conversationId: string) => void) => void;
  isOpening: boolean;
  errorMessage: string | null;
}

/** Abre (o recupera) la conversación con una persona o con el centro. */
export function useOpenConversation(): OpenConversation {
  const centerId = useActiveCenterId();
  const mutation = useMutation({
    mutationFn: (withMembershipId: string | null) =>
      chatOpenConversation(centerId, { withMembershipId }),
  });

  return {
    open: (withMembershipId, onOpened) => {
      mutation.mutate(withMembershipId, {
        onSuccess: ({ conversationId }) => {
          onOpened(conversationId);
        },
      });
    },
    isOpening: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}

interface SendMessage {
  send: (body: string, onSent: () => void) => void;
  isSending: boolean;
  errorMessage: string | null;
}

/** Envía un mensaje de texto; no es optimista: se espera al servidor y se recarga el hilo. */
export function useSendMessage(conversationId: string): SendMessage {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (body: string) => chatSendMessage(centerId, conversationId, { body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getChatListMessagesQueryKey(centerId, conversationId),
      });
      void queryClient.invalidateQueries({ queryKey: getChatListConversationsQueryKey(centerId) });
    },
  });

  return {
    send: (body, onSent) => {
      mutation.mutate(body, { onSuccess: onSent });
    },
    isSending: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}

/** Marca la conversación como leída por quien mira y refresca la bandeja. */
export function useMarkConversationRead(conversationId: string): () => void {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => chatMarkRead(centerId, conversationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: getChatListConversationsQueryKey(centerId) });
    },
  });

  return () => {
    mutation.mutate();
  };
}
