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

import { useRealtimeStatusStore } from '@/shared/realtime/realtime-status-store';

import { useActiveCenterId } from './useActiveCenterId';

/** Sondeo corto mientras no hay tiempo real: la bandeja y el hilo se refrescan solos. */
const CONVERSATIONS_POLL_MS = 15_000;
const MESSAGES_POLL_MS = 5_000;
/** Con el WebSocket abierto el sondeo es solo una red de seguridad (avisos perdidos). */
const CONVERSATIONS_SAFETY_POLL_MS = 120_000;
const MESSAGES_SAFETY_POLL_MS = 60_000;

/** Las conversaciones de quien mira, con los mensajes sin leer. */
export function useConversations(): UseQueryResult<ConversationListResponseDto, ErrorType> {
  const isRealtimeConnected = useRealtimeStatusStore((state) => state.isConnected);
  return useQuery(
    getChatListConversationsQueryOptions(useActiveCenterId(), {
      query: {
        refetchInterval: isRealtimeConnected ? CONVERSATIONS_SAFETY_POLL_MS : CONVERSATIONS_POLL_MS,
      },
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
  const isRealtimeConnected = useRealtimeStatusStore((state) => state.isConnected);
  return useQuery(
    getChatListMessagesQueryOptions(useActiveCenterId(), conversationId, undefined, {
      query: { refetchInterval: isRealtimeConnected ? MESSAGES_SAFETY_POLL_MS : MESSAGES_POLL_MS },
    }),
  );
}
