import { useConversations } from './useChatQueries';

/** Cuántos mensajes sin leer tiene quien mira, sumando todas sus conversaciones. */
export function useUnreadMessageCount(): number {
  return useConversations().data?.unreadTotal ?? 0;
}
