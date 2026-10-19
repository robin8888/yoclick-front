import { useChatRealtime } from '../hooks/useChatRealtime';

/** No pinta nada: abre el tiempo real del chat mientras la persona está dentro de un centro. */
export function ChatRealtimeBridge(): null {
  useChatRealtime();
  return null;
}
