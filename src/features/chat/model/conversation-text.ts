import type { ConversationListResponseDtoConversationsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

type ConversationItem = ConversationListResponseDtoConversationsItem;
type LastMessage = NonNullable<ConversationItem['lastMessage']>;

function describeContent(lastMessage: LastMessage): string {
  const { attachment } = lastMessage;
  if (attachment === null) return lastMessage.body ?? '';
  return i18n.t(attachment.kind === 'image' ? 'chat.previewPhoto' : 'chat.previewDocument');
}

/** Lo que se ve de un mensaje en la bandeja: su texto o, si es un archivo, qué es. */
export function describeLastMessage(lastMessage: ConversationItem['lastMessage']): string {
  if (lastMessage === null) return '';
  const content = describeContent(lastMessage);
  return lastMessage.isMine ? i18n.t('chat.previewMine', { content }) : content;
}

/** El nombre de la otra parte: la persona o, si es el centro, su nombre. */
export function describeCounterpartName(
  counterpart: ConversationItem['counterpart'],
  centerName: string,
): string {
  return counterpart.kind === 'center' ? centerName : counterpart.fullName;
}

/** «1 mensaje sin leer» / «3 mensajes sin leer»: la etiqueta accesible de una fila de la bandeja. */
export function describeUnreadCount(unreadCount: number): string {
  return unreadCount === 0 ? '' : i18n.t('chat.unreadCount', { count: unreadCount });
}
