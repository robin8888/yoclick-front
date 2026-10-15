import { useEffect } from 'react';

import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';
import { LoadErrorState } from '@/features/join';
import type { MessageListResponseDto } from '@/shared/api/generated/model';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { MessageBubble } from '../components/MessageBubble';
import { MessageComposer } from '../components/MessageComposer';
import { useCenterName } from '../hooks/useCenterName';
import { useMarkConversationRead, useSendMessage } from '../hooks/useChatMutations';
import { useConversationMessages, useConversations } from '../hooks/useChatQueries';
import { useSendAttachment } from '../hooks/useSendAttachment';
import { describeCounterpartName } from '../model/conversation-text';

interface ConversationScreenProps {
  conversationId: string;
}

/** Con quién se habla, sacado de la bandeja (que ya está en caché al llegar aquí). */
function useCounterpartName(conversationId: string): string {
  const centerName = useCenterName();
  const { data } = useConversations();
  const conversation = data?.conversations.find(({ id }) => id === conversationId);
  if (conversation === undefined) return i18n.t('chat.title');
  return describeCounterpartName(conversation.counterpart, centerName);
}

/** Sincroniza con el servidor: lo que llega de la otra parte, mientras se mira, queda leído. */
function useMarkReadWhenOtherSideWrites(
  conversationId: string,
  messages: MessageListResponseDto['messages'] | undefined,
): void {
  const markRead = useMarkConversationRead(conversationId);
  const newestMessage = messages?.[0];
  const isFromOtherSide = newestMessage !== undefined && !newestMessage.isMine;
  const newestMessageId = newestMessage?.id;

  useEffect(() => {
    if (isFromOtherSide) markRead();
    // `markRead` cambia en cada render; solo importa un mensaje nuevo de la otra parte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newestMessageId, isFromOtherSide]);
}

function MessageThread({
  messages,
}: Readonly<{ messages: MessageListResponseDto['messages'] }>): React.JSX.Element {
  if (messages.length === 0) {
    return (
      <Text variant="body" color="ink2">
        {i18n.t('chat.threadEmptyDescription')}
      </Text>
    );
  }
  return (
    <>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          timeLabel={formatTime24h(message.createdAt, DEFAULT_CENTER_TIME_ZONE)}
        />
      ))}
    </>
  );
}

/** El hilo de una conversación: lo más reciente arriba, y abajo el campo para escribir. */
export function ConversationScreen({
  conversationId,
}: Readonly<ConversationScreenProps>): React.JSX.Element {
  const onBackPress = useBackAction();
  const { data, isPending, isError, error, refetch } = useConversationMessages(conversationId);
  const { send, isSending, errorMessage: sendError } = useSendMessage(conversationId);
  const { attach, isUploading, errorMessage: attachError } = useSendAttachment(conversationId);
  useMarkReadWhenOtherSideWrites(conversationId, data?.messages);
  const failureMessage = sendError ?? attachError;

  return (
    <ScreenTemplate
      title={useCounterpartName(conversationId)}
      onBackPress={onBackPress}
      footer={<MessageComposer isBusy={isSending || isUploading} onSend={send} onAttach={attach} />}
    >
      {failureMessage === null ? null : <FormErrorBanner message={failureMessage} />}
      {isPending ? <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} /> : null}
      {isError ? (
        <LoadErrorState
          title={i18n.t('chat.errorTitle')}
          error={error}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}
      {data === undefined ? null : <MessageThread messages={data.messages} />}
    </ScreenTemplate>
  );
}
