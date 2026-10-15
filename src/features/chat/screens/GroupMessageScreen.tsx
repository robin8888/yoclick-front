import { useState } from 'react';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { GroupListResponseDtoGroupsItem } from '@/shared/api/generated/model';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { FormField } from '@/ui/molecules/FormField';
import { OptionCard } from '@/ui/molecules/OptionCard';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import {
  useBroadcastGroups,
  useGroupBroadcast,
  type BroadcastResult,
} from '../hooks/useGroupBroadcast';

const MAX_MESSAGE_LENGTH = 2000;

function GroupOptions({
  groups,
  selectedGroupId,
  clientWord,
  onSelect,
}: Readonly<{
  groups: readonly GroupListResponseDtoGroupsItem[];
  selectedGroupId: string | null;
  clientWord: string;
  onSelect: (groupId: string) => void;
}>): React.JSX.Element {
  if (groups.length === 0) {
    return <Text color="ink2">{i18n.t('chat.group.noGroups', { clientWord })}</Text>;
  }
  return (
    <>
      {groups.map((group) => (
        <OptionCard
          key={group.id}
          title={group.name}
          meta={i18n.t('chat.group.memberCount', { count: group.memberCount, clientWord })}
          isSelected={group.id === selectedGroupId}
          isDisabled={group.memberCount === 0}
          onPress={() => {
            onSelect(group.id);
          }}
        />
      ))}
    </>
  );
}

function BroadcastSummary({ result }: Readonly<{ result: BroadcastResult }>): React.JSX.Element {
  return (
    <>
      <Text variant="bodyStrong">{i18n.t('chat.group.sent', { count: result.sentCount })}</Text>
      {result.skippedMinorCount === 0 ? null : (
        <Text variant="caption" color="ink2">
          {i18n.t('chat.group.skippedMinors', { count: result.skippedMinorCount })}
        </Text>
      )}
    </>
  );
}

/** Los grupos del centro: cargando, con error y reintento, o la lista para elegir uno. */
function GroupChoice({
  selectedGroupId,
  clientWord,
  onSelect,
}: Readonly<{
  selectedGroupId: string | null;
  clientWord: string;
  onSelect: (groupId: string) => void;
}>): React.JSX.Element {
  const groups = useBroadcastGroups();

  return (
    <>
      {groups.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {groups.isError ? (
        <LoadErrorState
          title={i18n.t('chat.errorTitle')}
          error={groups.error}
          onRetry={() => {
            void groups.refetch();
          }}
        />
      ) : null}
      {groups.data === undefined ? null : (
        <GroupOptions
          groups={groups.data.groups}
          selectedGroupId={selectedGroupId}
          clientWord={clientWord}
          onSelect={onSelect}
        />
      )}
    </>
  );
}

interface BroadcastFormProps {
  clientWord: string;
  broadcast: ReturnType<typeof useGroupBroadcast>;
}

/** Elegir el grupo, escribir el mensaje y enviarlo. */
function BroadcastForm({ clientWord, broadcast }: Readonly<BroadcastFormProps>): React.JSX.Element {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const trimmedDraft = draft.trim();
  const canSend = selectedGroupId !== null && trimmedDraft !== '';

  return (
    <>
      <GroupChoice
        selectedGroupId={selectedGroupId}
        clientWord={clientWord}
        onSelect={setSelectedGroupId}
      />
      <FormField
        label={i18n.t('chat.group.messageLabel')}
        value={draft}
        onChangeText={setDraft}
        isMultiline
        maxLength={MAX_MESSAGE_LENGTH}
      />
      <Button
        label={i18n.t('chat.group.send')}
        isDisabled={!canSend || broadcast.isSending}
        onPress={() => {
          if (selectedGroupId === null) return;
          broadcast.send({ groupId: selectedGroupId, body: trimmedDraft });
        }}
      />
    </>
  );
}

/** Escribir a todas las personas de un grupo: cada una lo recibe en su conversación con el centro. */
export function GroupMessageScreen(): React.JSX.Element {
  const onBackPress = useBackAction();
  const clientWord = getSectorVocabulary(useActiveCenterSectorId()).client.plural;
  const broadcast = useGroupBroadcast();

  return (
    <ScreenTemplate
      title={i18n.t('chat.group.title')}
      subtitle={i18n.t('chat.group.subtitle', { clientWord })}
      onBackPress={onBackPress}
      isLoading={broadcast.isSending}
      loadingLabel={getSharedStateCopy().loadingLabel}
    >
      <BroadcastForm clientWord={clientWord} broadcast={broadcast} />
      {broadcast.errorMessage === null ? null : (
        <FormErrorBanner message={broadcast.errorMessage} />
      )}
      {broadcast.result === null ? null : <BroadcastSummary result={broadcast.result} />}
    </ScreenTemplate>
  );
}
