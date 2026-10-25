import { useState } from 'react';

import { useActiveCenterSectorId } from '@/features/join';
import type {
  ContactListResponseDto,
  ContactListResponseDtoPeopleItem,
} from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { Avatar } from '@/ui/atoms/Avatar';
import { Input } from '@/ui/atoms/Input';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ListItem } from '@/ui/molecules/ListItem';

import { useCenterName } from '../hooks/useCenterName';
import { filterContactsByName } from '../model/contact-search';

interface ContactListProps {
  contacts: ContactListResponseDto;
  onContactPress: (membershipId: string | null) => void;
  onGroupMessagePress: (() => void) | undefined;
}

function GroupMessageEntry({
  onPress,
}: Readonly<{ onPress: (() => void) | undefined }>): React.JSX.Element | null {
  if (onPress === undefined) return null;
  return (
    <ListItem
      leadingIconName="users"
      title={i18n.t('chat.group.entryTitle')}
      subtitle={i18n.t('chat.group.entrySubtitle')}
      onPress={onPress}
    />
  );
}

function CenterEntry({ onPress }: Readonly<{ onPress: () => void }>): React.JSX.Element {
  const centerName = useCenterName();
  return (
    <ListItem
      leadingIconName="messageCircle"
      title={centerName === '' ? i18n.t('chat.theCenter') : centerName}
      subtitle={i18n.t('chat.writeToCenter')}
      onPress={onPress}
    />
  );
}

interface PersonRowsProps {
  people: readonly ContactListResponseDtoPeopleItem[];
  onContactPress: (membershipId: string) => void;
}

function PersonRows({ people, onContactPress }: Readonly<PersonRowsProps>): React.JSX.Element {
  const { client, staff } = getSectorVocabulary(useActiveCenterSectorId());
  return (
    <>
      {people.map((person) => (
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

interface ContactSearchInputProps {
  searchText: string;
  onSearchTextChange: (searchText: string) => void;
}

function ContactSearchInput({
  searchText,
  onSearchTextChange,
}: Readonly<ContactSearchInputProps>): React.JSX.Element {
  return (
    <Input
      value={searchText}
      onChangeText={onSearchTextChange}
      accessibilityLabel={i18n.t('chat.search.label')}
      placeholder={i18n.t('chat.search.placeholder')}
      leadingIconName="search"
      autoCapitalize="none"
      returnKeyType="search"
    />
  );
}

/** Buscador por nombre, el centro (si se le puede escribir) y las personas que coinciden. */
export function ContactList({
  contacts,
  onContactPress,
  onGroupMessagePress,
}: Readonly<ContactListProps>): React.JSX.Element {
  const [searchText, setSearchText] = useState('');
  if (contacts.people.length === 0 && !contacts.canWriteToCenter) {
    return <FormErrorBanner message={i18n.t('chat.noContacts')} />;
  }

  const matchingPeople = filterContactsByName(contacts.people, searchText);
  const isSearching = searchText.trim() !== '';

  return (
    <>
      {contacts.people.length === 0 ? null : (
        <ContactSearchInput searchText={searchText} onSearchTextChange={setSearchText} />
      )}
      {isSearching ? null : <GroupMessageEntry onPress={onGroupMessagePress} />}
      {contacts.canWriteToCenter && !isSearching ? (
        <CenterEntry
          onPress={() => {
            onContactPress(null);
          }}
        />
      ) : null}
      {isSearching && matchingPeople.length === 0 ? (
        <Text color="ink2">
          {i18n.t('chat.search.noResults', { searchText: searchText.trim() })}
        </Text>
      ) : null}
      <PersonRows people={matchingPeople} onContactPress={onContactPress} />
    </>
  );
}
