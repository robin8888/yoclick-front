import { useEffect } from 'react';
import { FlatList, KeyboardAvoidingView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_CENTER_TIME_ZONE } from '@/features/booking';
import { LoadErrorState } from '@/features/join';
import type { MessageListResponseDto } from '@/shared/api/generated/model';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { ChatHeader } from '../components/ChatHeader';
import { MessageBubble } from '../components/MessageBubble';
import { MessageComposer } from '../components/MessageComposer';
import {
  createEmptyThreadStyle,
  createScreenStyle,
  createThreadContentStyle,
  createThreadStyle,
  FILL_STYLE,
} from './ConversationScreen.styles';
import { useCenterName } from '../hooks/useCenterName';
import { useMarkConversationRead, useSendMessage } from '../hooks/useChatMutations';
import { useConversationMessages, useConversations } from '../hooks/useChatQueries';
import { useSendAttachment } from '../hooks/useSendAttachment';
import { describeCounterpartName } from '../model/conversation-text';

type ThreadMessage = MessageListResponseDto['messages'][number];

interface ConversationScreenProps {
  conversationId: string;
}

interface CounterpartSummary {
  name: string;
  photoUrl: string | null;
}

/** Con quién se habla, sacado de la bandeja (que ya está en caché al llegar aquí). */
function useCounterpart(conversationId: string): CounterpartSummary {
  const centerName = useCenterName();
  const { data } = useConversations();
  const conversation = data?.conversations.find(({ id }) => id === conversationId);
  if (conversation === undefined) return { name: i18n.t('chat.title'), photoUrl: null };
  const { counterpart } = conversation;
  return {
    name: describeCounterpartName(counterpart, centerName),
    photoUrl: counterpart.kind === 'person' ? counterpart.photoUrl : null,
  };
}

/** Sincroniza con el servidor: lo que llega de la otra parte, mientras se mira, queda leído. */
function useMarkReadWhenOtherSideWrites(
  conversationId: string,
  messages: readonly ThreadMessage[] | undefined,
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

/** Lo más reciente abajo: la lista va invertida y el servidor ya manda lo más nuevo primero. */
function MessageThread({
  messages,
}: Readonly<{ messages: readonly ThreadMessage[] }>): React.JSX.Element {
  const theme = useTheme();

  // Fuera de la lista: una lista invertida también da la vuelta a su «vacío».
  if (messages.length === 0) {
    return (
      <View style={createEmptyThreadStyle(theme)}>
        <Text variant="body" color="ink2" align="center">
          {i18n.t('chat.threadEmptyDescription')}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      inverted
      data={messages}
      keyExtractor={(message) => message.id}
      style={createThreadStyle(theme)}
      contentContainerStyle={createThreadContentStyle(theme)}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <MessageBubble
          message={item}
          timeLabel={formatTime24h(item.createdAt, DEFAULT_CENTER_TIME_ZONE)}
        />
      )}
    />
  );
}

/**
 * El hilo, como en WhatsApp: cabecera con la otra persona, mensajes con lo más reciente abajo y la
 * barra de escribir pegada al teclado. No usa `ScreenTemplate`: su pie se vuelve a montar al salir
 * el teclado y el campo perdía el foco.
 */
export function ConversationScreen({
  conversationId,
}: Readonly<ConversationScreenProps>): React.JSX.Element {
  const theme = useTheme();
  const onBackPress = useBackAction();
  const counterpart = useCounterpart(conversationId);
  const { data, isPending, isError, error, refetch } = useConversationMessages(conversationId);
  const { send, isSending, errorMessage: sendError } = useSendMessage(conversationId);
  const { attach, isUploading, errorMessage: attachError } = useSendAttachment(conversationId);
  useMarkReadWhenOtherSideWrites(conversationId, data?.messages);
  const failureMessage = sendError ?? attachError;

  return (
    <SafeAreaView edges={['top']} style={createScreenStyle(theme)}>
      <KeyboardAvoidingView style={FILL_STYLE} behavior="padding">
        <ChatHeader
          name={counterpart.name}
          photoUrl={counterpart.photoUrl}
          onBackPress={onBackPress}
        />
        {failureMessage === null ? null : (
          <View>
            <FormErrorBanner message={failureMessage} />
          </View>
        )}
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
        <MessageComposer isBusy={isSending || isUploading} onSend={send} onAttach={attach} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
