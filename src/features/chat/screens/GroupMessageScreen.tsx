import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { GroupListResponseDtoGroupsItem } from '@/shared/api/generated/model';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { OptionCard } from '@/ui/molecules/OptionCard';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { ChatHeader } from '../components/ChatHeader';
import { MessageComposer } from '../components/MessageComposer';
import {
  useBroadcastGroups,
  useGroupBroadcast,
  type BroadcastResult,
} from '../hooks/useGroupBroadcast';
import {
  createGroupListContentStyle,
  createScreenStyle,
  FILL_STYLE,
} from './ConversationScreen.styles';

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

interface BroadcastBodyProps {
  broadcast: ReturnType<typeof useGroupBroadcast>;
  clientWord: string;
  selectedGroupId: string | null;
  onSelect: (groupId: string) => void;
}

/** Lo que se desplaza: la explicación, los grupos a elegir y el resultado del envío. */
function BroadcastBody({
  broadcast,
  clientWord,
  selectedGroupId,
  onSelect,
}: Readonly<BroadcastBodyProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <ScrollView
      style={FILL_STYLE}
      contentContainerStyle={createGroupListContentStyle(theme)}
      keyboardShouldPersistTaps="handled"
    >
      <Text color="ink2">{i18n.t('chat.group.subtitle', { clientWord })}</Text>
      <GroupChoice selectedGroupId={selectedGroupId} clientWord={clientWord} onSelect={onSelect} />
      {broadcast.errorMessage === null ? null : (
        <FormErrorBanner message={broadcast.errorMessage} />
      )}
      {broadcast.result === null ? null : <BroadcastSummary result={broadcast.result} />}
    </ScrollView>
  );
}

/**
 * Escribir a todas las personas de un grupo: cada una lo recibe en su conversación con el centro.
 * Tiene el mismo marco que el hilo (campo fijo pegado al teclado): dentro de `ScreenTemplate` el
 * campo quedaba tapado por el teclado.
 */
export function GroupMessageScreen(): React.JSX.Element {
  const theme = useTheme();
  const onBackPress = useBackAction();
  const clientWord = getSectorVocabulary(useActiveCenterSectorId()).client.plural;
  const broadcast = useGroupBroadcast();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  return (
    <SafeAreaView edges={['top']} style={createScreenStyle(theme)}>
      <KeyboardAvoidingView style={FILL_STYLE} behavior="padding">
        <ChatHeader
          name={i18n.t('chat.group.title')}
          photoUrl={null}
          iconName="users"
          onBackPress={onBackPress}
        />
        <BroadcastBody
          broadcast={broadcast}
          clientWord={clientWord}
          selectedGroupId={selectedGroupId}
          onSelect={setSelectedGroupId}
        />
        <MessageComposer
          isBusy={broadcast.isSending}
          isSendDisabled={selectedGroupId === null}
          onSend={(body, onSent) => {
            if (selectedGroupId === null) return;
            broadcast.send({ groupId: selectedGroupId, body }, onSent);
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
