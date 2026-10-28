import { useEffect } from 'react';
import { FlatList, KeyboardAvoidingView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { ConversationSafetySheets } from '../components/ConversationSafetySheets';
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
import { useBlockFlow, useReportFlow, type BlockablePerson } from '../hooks/useConversationSafety';
import { useSendAttachment } from '../hooks/useSendAttachment';
import { describeCounterpartName } from '../model/conversation-text';

/** La hora de los mensajes se muestra en la zona del centro (hoy una sola, la de España). */
const DEFAULT_CENTER_TIME_ZONE = 'Europe/Madrid';

type ThreadMessage = MessageListResponseDto['messages'][number];

interface ConversationScreenProps {
  conversationId: string;
}

interface CounterpartSummary {
  name: string;
  photoUrl: string | null;
  /** La otra persona, si es una persona y no el centro: es a quien se podría bloquear. */
  person: BlockablePerson | null;
}

/** Con quién se habla, sacado de la bandeja (que ya está en caché al llegar aquí). */
function useCounterpart(conversationId: string): CounterpartSummary {
  const centerName = useCenterName();
  const { data } = useConversations();
  const conversation = data?.conversations.find(({ id }) => id === conversationId);
  if (conversation === undefined)
    return { name: i18n.t('chat.title'), photoUrl: null, person: null };
  const { counterpart } = conversation;
  return {
    name: describeCounterpartName(counterpart, centerName),
    photoUrl: counterpart.kind === 'person' ? counterpart.photoUrl : null,
    person:
      counterpart.kind === 'person'
        ? { membershipId: counterpart.membershipId, role: counterpart.role }
        : null,
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
  onReportPress,
}: Readonly<{
  messages: readonly ThreadMessage[];
  onReportPress: (messageId: string) => void;
}>): React.JSX.Element {
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
          onReportPress={() => {
            onReportPress(item.id);
          }}
        />
      )}
    />
  );
}

/** El hilo con sus estados (carga, error, mensajes); lo que llega de la otra parte, mientras se mira, queda leído. */
function ConversationBody({
  conversationId,
  onReportPress,
}: Readonly<{
  conversationId: string;
  onReportPress: (messageId: string) => void;
}>): React.JSX.Element {
  const { data, isPending, isError, error, refetch } = useConversationMessages(conversationId);
  useMarkReadWhenOtherSideWrites(conversationId, data?.messages);

  return (
    <>
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
      {data === undefined ? null : (
        <MessageThread messages={data.messages} onReportPress={onReportPress} />
      )}
    </>
  );
}

/** La barra de escribir, con el aviso de lo que haya fallado al enviar un mensaje o un archivo. */
function ConversationComposer({
  conversationId,
}: Readonly<{ conversationId: string }>): React.JSX.Element {
  const { send, isSending, errorMessage: sendError } = useSendMessage(conversationId);
  const { attach, isUploading, errorMessage: attachError } = useSendAttachment(conversationId);
  const failureMessage = sendError ?? attachError;

  return (
    <>
      {failureMessage === null ? null : (
        <View>
          <FormErrorBanner message={failureMessage} />
        </View>
      )}
      <MessageComposer isBusy={isSending || isUploading} onSend={send} onAttach={attach} />
    </>
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
  const report = useReportFlow(conversationId);
  const block = useBlockFlow(counterpart.person, () => {
    onBackPress?.();
  });

  return (
    <SafeAreaView edges={['top']} style={createScreenStyle(theme)}>
      <KeyboardAvoidingView style={FILL_STYLE} behavior="padding">
        <ChatHeader
          name={counterpart.name}
          photoUrl={counterpart.photoUrl}
          onBackPress={onBackPress}
          onMenuPress={block.canBlock ? block.openConfirm : undefined}
        />
        {report.hasSentReport ? (
          <Text variant="caption" color="success" role="status">
            {i18n.t('chat.report.sent')}
          </Text>
        ) : null}
        <ConversationBody conversationId={conversationId} onReportPress={report.open} />
        <ConversationComposer conversationId={conversationId} />
      </KeyboardAvoidingView>
      <ConversationSafetySheets counterpartName={counterpart.name} report={report} block={block} />
    </SafeAreaView>
  );
}
