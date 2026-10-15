import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorType } from '@/shared/api/api-mutator';
import {
  getChatListContactsQueryOptions,
  getChatListConversationsQueryOptions,
  getChatListMessagesQueryOptions,
} from '@/shared/api/generated/endpoints/chat/chat';
import type {
  ContactListResponseDto,
  ConversationListResponseDto,
  MessageListResponseDto,
} from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

/** Sondeo corto: sin conexión en tiempo real, la bandeja y el hilo se refrescan solos. */
const CONVERSATIONS_POLL_MS = 15_000;
const MESSAGES_POLL_MS = 5_000;

/** Las conversaciones de quien mira, con los mensajes sin leer. */
export function useConversations(): UseQueryResult<ConversationListResponseDto, ErrorType> {
  return useQuery(
    getChatListConversationsQueryOptions(useActiveCenterId(), {
      query: { refetchInterval: CONVERSATIONS_POLL_MS },
    }),
  );
}

/** Con quién puede empezar una conversación quien mira. */
export function useChatContacts(): UseQueryResult<ContactListResponseDto, ErrorType> {
  return useQuery(getChatListContactsQueryOptions(useActiveCenterId()));
}

/** Los mensajes de una conversación, del más reciente al más antiguo. */
export function useConversationMessages(
  conversationId: string,
): UseQueryResult<MessageListResponseDto, ErrorType> {
  return useQuery(
    getChatListMessagesQueryOptions(useActiveCenterId(), conversationId, undefined, {
      query: { refetchInterval: MESSAGES_POLL_MS },
    }),
  );
}
