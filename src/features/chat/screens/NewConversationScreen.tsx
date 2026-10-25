import { LoadErrorState } from '@/features/join';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ContactList } from '../components/ContactList';
import { useOpenConversation } from '../hooks/useChatMutations';
import { useChatContacts } from '../hooks/useChatQueries';

interface NewConversationScreenProps {
  /** Ya existe (o se acaba de crear) la conversación elegida: la app abre su hilo. */
  onConversationOpened: (conversationId: string) => void;
  /** Solo la administración: escribir a todas las personas de un grupo. */
  onGroupMessagePress?: (() => void) | undefined;
}

/** «Nuevo mensaje»: el centro (si se puede) y las personas a las que quien mira puede escribir. */
export function NewConversationScreen({
  onConversationOpened,
  onGroupMessagePress,
}: Readonly<NewConversationScreenProps>): React.JSX.Element {
  const onBackPress = useBackAction();
  const { data, isPending, isError, error, refetch } = useChatContacts();
  const { open, isOpening, errorMessage } = useOpenConversation();

  return (
    <ScreenTemplate
      title={i18n.t('chat.newMessage')}
      subtitle={i18n.t('chat.newSubtitle')}
      onBackPress={onBackPress}
      isLoading={isOpening}
      loadingLabel={getSharedStateCopy().loadingLabel}
    >
      {errorMessage === null ? null : <FormErrorBanner message={errorMessage} />}
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
        <ContactList
          contacts={data}
          onGroupMessagePress={onGroupMessagePress}
          onContactPress={(membershipId) => {
            open(membershipId, onConversationOpened);
          }}
        />
      )}
    </ScreenTemplate>
  );
}
