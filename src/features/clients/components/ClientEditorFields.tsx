import { useActiveCenterSectorId } from '@/features/join';
import type {
  ClientResponseDto,
  GroupListResponseDtoGroupsItem,
} from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { Text } from '@/ui/atoms/Text';

import { buildLevelChoices } from '../model/client-display';
import { NO_CHOICE } from '../model/group-form';
import { ChoiceButtons } from './ChoiceButtons';

interface ClientEditorFieldsProps {
  client: ClientResponseDto | undefined;
  groups: readonly GroupListResponseDtoGroupsItem[];
  levelChoice: string;
  groupChoice: string;
  onLevelChoose: (level: string) => void;
  onGroupChoose: (groupId: string) => void;
}

function ClientSummary({ client }: Readonly<{ client: ClientResponseDto }>): React.JSX.Element {
  return (
    <Text color="ink2">
      {i18n.t('clients.clientEditor.summary', {
        since: i18n.t('clients.clientEditor.since', {
          date: formatShortDate(client.joinedAt, 'Europe/Madrid'),
        }),
        bookings: i18n.t('clients.clientEditor.bookings', { count: client.bookingCount }),
      })}
    </Text>
  );
}

/** Desde cuándo está y cuántas citas lleva, y el nivel y el grupo para cambiar. */
export function ClientEditorFields({
  client,
  groups,
  levelChoice,
  groupChoice,
  onLevelChoose,
  onGroupChoose,
}: Readonly<ClientEditorFieldsProps>): React.JSX.Element {
  const vocabulary = getSectorVocabulary(useActiveCenterSectorId());
  const levelChoices = buildLevelChoices(vocabulary.levels, i18n.t('clients.clientEditor.noLevel'));
  const groupChoices = [
    { value: NO_CHOICE, label: i18n.t('clients.clientEditor.noGroup') },
    ...groups.map((group) => ({ value: group.id, label: group.name })),
  ];

  return (
    <>
      {client === undefined ? null : <ClientSummary client={client} />}
      <ChoiceButtons
        title={i18n.t('clients.clientEditor.levelLabel')}
        choices={levelChoices}
        selectedValue={levelChoice}
        onChoose={onLevelChoose}
      />
      <ChoiceButtons
        title={i18n.t('clients.clientEditor.groupLabel')}
        choices={groupChoices}
        selectedValue={groupChoice}
        onChoose={onGroupChoose}
      />
    </>
  );
}
