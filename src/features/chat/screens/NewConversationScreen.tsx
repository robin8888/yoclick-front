import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { ContactListResponseDto } from '@/shared/api/generated/model';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Avatar } from '@/ui/atoms/Avatar';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useCenterName } from '../hooks/useCenterName';
import { useOpenConversation } from '../hooks/useChatMutations';
import { useChatContacts } from '../hooks/useChatQueries';

interface NewConversationScreenProps {
  /** Ya existe (o se acaba de crear) la conversación elegida: la app abre su hilo. */
  onConversationOpened: (conversationId: string) => void;
}

interface ContactListProps {
  contacts: ContactListResponseDto;
  onContactPress: (membershipId: string | null) => void;
}

function ContactList({ contacts, onContactPress }: Readonly<ContactListProps>): React.JSX.Element {
  const centerName = useCenterName();
  const { client, staff } = getSectorVocabulary(useActiveCenterSectorId());
  const hasNobody = contacts.people.length === 0 && !contacts.canWriteToCenter;
  if (hasNobody) return <FormErrorBanner message={i18n.t('chat.noContacts')} />;

  return (
    <>
      {contacts.canWriteToCenter ? (
        <ListItem
          leadingIconName="messageCircle"
          title={centerName === '' ? i18n.t('chat.theCenter') : centerName}
          subtitle={i18n.t('chat.writeToCenter')}
          onPress={() => {
            onContactPress(null);
          }}
        />
      ) : null}
      {contacts.people.map((person) => (
        <ListItem
          key={person.membershipId}
          leading={<Avatar name={person.fullName} photoUrl={person.photoUrl} isDecorative />}
          title={person.fullName}
          subtitle={person.role === 'client' ? client.singular : staff.singular}
          onPress={() => {
            onContactPress(person.membershipId);
          }}
        />
      ))}
    </>
  );
}

/** «Nuevo mensaje»: el centro (si se puede) y las personas a las que quien mira puede escribir. */
export function NewConversationScreen({
  onConversationOpened,
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
          onContactPress={(membershipId) => {
            open(membershipId, onConversationOpened);
          }}
        />
      )}
    </ScreenTemplate>
  );
}
