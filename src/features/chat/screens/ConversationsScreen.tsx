import { LoadErrorState } from '@/features/join';
import type { ConversationListResponseDtoConversationsItem } from '@/shared/api/generated/model';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ConversationRow } from '../components/ConversationRow';
import { useCenterName } from '../hooks/useCenterName';
import { useConversations } from '../hooks/useChatQueries';
import {
  describeCounterpartName,
  describeLastMessage,
  describeUnreadCount,
} from '../model/conversation-text';

interface ConversationsScreenProps {
  onConversationOpen: (conversationId: string) => void;
  onNewConversationPress: () => void;
  /** Acceso secundario de seguridad: «Personas bloqueadas» (alumno, profesor) o «Denuncias» (centro). */
  safetyLink?: { label: string; onPress: () => void } | undefined;
}

interface ConversationListProps {
  conversations: readonly ConversationListResponseDtoConversationsItem[];
  onConversationOpen: (conversationId: string) => void;
  onNewConversationPress: () => void;
}

function ConversationList({
  conversations,
  onConversationOpen,
  onNewConversationPress,
}: Readonly<ConversationListProps>): React.JSX.Element {
  const centerName = useCenterName();
  if (conversations.length === 0) {
    return (
      <EmptyState
        iconName="messageCircle"
        title={i18n.t('chat.emptyTitle')}
        description={i18n.t('chat.emptyDescription')}
        actionLabel={i18n.t('chat.newMessage')}
        onActionPress={onNewConversationPress}
      />
    );
  }
  return (
    <>
      {conversations.map(({ id, counterpart, lastMessage, unreadCount }) => (
        <ConversationRow
          key={id}
          name={describeCounterpartName(counterpart, centerName)}
          photoUrl={counterpart.kind === 'person' ? counterpart.photoUrl : null}
          preview={describeLastMessage(lastMessage)}
          unreadCount={unreadCount}
          unreadLabel={describeUnreadCount(unreadCount)}
          onPress={() => {
            onConversationOpen(id);
          }}
        />
      ))}
    </>
  );
}

/** La bandeja de mensajes: cada conversación con lo último que se dijo y lo que queda sin leer. */
export function ConversationsScreen({
  onConversationOpen,
  onNewConversationPress,
  safetyLink,
}: Readonly<ConversationsScreenProps>): React.JSX.Element {
  const onBackPress = useBackAction();
  const { data, isPending, isError, error, refetch } = useConversations();

  return (
    <ScreenTemplate
      title={i18n.t('chat.title')}
      subtitle={i18n.t('chat.subtitle')}
      onBackPress={onBackPress}
      footer={<Button label={i18n.t('chat.newMessage')} onPress={onNewConversationPress} />}
    >
      {safetyLink === undefined ? null : (
        <Button variant="ghost" label={safetyLink.label} onPress={safetyLink.onPress} />
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
      {data === undefined ? null : (
        <ConversationList
          conversations={data.conversations}
          onConversationOpen={onConversationOpen}
          onNewConversationPress={onNewConversationPress}
        />
      )}
    </ScreenTemplate>
  );
}
