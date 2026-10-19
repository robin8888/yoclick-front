import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { getApiBaseUrl } from '@/shared/api/api-config';
import {
  getChatListConversationsQueryKey,
  getChatListMessagesQueryKey,
} from '@/shared/api/generated/endpoints/chat/chat';
import { getSessionServices } from '@/shared/auth/default-session-services';
import { useSessionStore } from '@/shared/auth/session-store';
import { createRealtimeConnection } from '@/shared/realtime/create-realtime-connection';
import { buildRealtimeUrl, type RealtimeEvent } from '@/shared/realtime/realtime-protocol';
import { useRealtimeStatusStore } from '@/shared/realtime/realtime-status-store';

/**
 * Mantiene abierto el tiempo real mientras la app está en primer plano y hay un centro activo. Cada
 * aviso de mensaje nuevo recarga la bandeja y el hilo afectado; el contenido siempre llega por la
 * API normal. Al pasar a segundo plano se cierra y al volver se reconecta.
 */
export function useChatRealtime(): void {
  const centerId = useSessionStore((state) => state.activeCenterId);
  const status = useSessionStore((state) => state.status);
  const queryClient = useQueryClient();
  const setConnected = useRealtimeStatusStore((state) => state.setConnected);

  useEffect(() => {
    if (centerId === null || status !== 'signedIn') return undefined;
    let connection: ReturnType<typeof createRealtimeConnection> | null = null;
    const open = (): void => {
      connection ??= createRealtimeConnection({
        url: buildRealtimeUrl(getApiBaseUrl()),
        centerId,
        getAccessToken: ({ shouldRenew }) => {
          const currentToken = useSessionStore.getState().accessToken;
          if (!shouldRenew && currentToken !== null) return Promise.resolve(currentToken);
          return getSessionServices().refreshAccessToken();
        },
        onConnectedChange: setConnected,
        onEvent: (event) => {
          refreshChatQueries(queryClient, { centerId, event });
        },
      });
    };
    const close = (): void => {
      connection?.close();
      connection = null;
    };
    if (AppState.currentState === 'active') open();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') open();
      else close();
    });
    return () => {
      subscription.remove();
      close();
    };
  }, [centerId, status, queryClient, setConnected]);
}

function refreshChatQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  input: { centerId: string; event: RealtimeEvent },
): void {
  if (input.event.type !== 'chat.updated') return;
  void queryClient.invalidateQueries({
    queryKey: getChatListConversationsQueryKey(input.centerId),
  });
  if (input.event.conversationId !== null) {
    void queryClient.invalidateQueries({
      queryKey: getChatListMessagesQueryKey(input.centerId, input.event.conversationId),
    });
  }
}
