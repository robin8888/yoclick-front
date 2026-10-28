import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { BlockedPeopleResponseDtoBlocksItem } from '@/shared/api/generated/model';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useBlockedPeople, useUnblockPerson } from '../hooks/useChatSafety';
import { createSafetyRowStyle, createSafetyRowTextStyle } from './ChatSafety.styles';

function BlockedPersonRow({
  person,
  isBusy,
  onUnblockPress,
}: Readonly<{
  person: BlockedPeopleResponseDtoBlocksItem;
  isBusy: boolean;
  onUnblockPress: () => void;
}>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createSafetyRowStyle(theme)}>
      <Avatar name={person.fullName} photoUrl={person.photoUrl} size="md" isDecorative />
      <View style={createSafetyRowTextStyle(theme)}>
        <Text variant="bodyStrong">{person.fullName}</Text>
      </View>
      <Button
        variant="outline"
        size="sm"
        label={i18n.t('chat.blocked.unblockAction')}
        accessibilityLabel={i18n.t('chat.blocked.unblockA11y', { name: person.fullName })}
        isLoading={isBusy}
        onPress={onUnblockPress}
      />
    </View>
  );
}

function BlockedPeopleRows({
  blocks,
}: Readonly<{ blocks: readonly BlockedPeopleResponseDtoBlocksItem[] }>): React.JSX.Element {
  const unblocking = useUnblockPerson();

  return (
    <>
      {unblocking.errorMessage === null ? null : (
        <FormErrorBanner message={unblocking.errorMessage} />
      )}
      {blocks.map((person) => (
        <BlockedPersonRow
          key={person.membershipId}
          person={person}
          isBusy={unblocking.pendingMembershipId === person.membershipId}
          onUnblockPress={() => {
            unblocking.unblock(person.membershipId);
          }}
        />
      ))}
    </>
  );
}

function BlockedPeopleList(): React.JSX.Element {
  const blocked = useBlockedPeople();

  if (blocked.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (blocked.isError) {
    return (
      <LoadErrorState
        title={i18n.t('chat.blocked.errorTitle')}
        error={blocked.error}
        onRetry={() => {
          void blocked.refetch();
        }}
        isRetrying={blocked.isFetching}
      />
    );
  }
  if (blocked.data.blocks.length === 0) {
    return (
      <View>
        <Text variant="titleMd">{i18n.t('chat.blocked.emptyTitle')}</Text>
        <Text color="ink2">{i18n.t('chat.blocked.emptyDescription')}</Text>
      </View>
    );
  }
  return <BlockedPeopleRows blocks={blocked.data.blocks} />;
}

/** Las personas que quien mira ha bloqueado en el chat, para poder desbloquearlas (Apple 1.2). */
export function BlockedPeopleScreen(): React.JSX.Element {
  const onBackPress = useBackAction();

  return (
    <ScreenTemplate
      title={i18n.t('chat.blocked.title')}
      subtitle={i18n.t('chat.blocked.subtitle')}
      onBackPress={onBackPress}
    >
      <BlockedPeopleList />
    </ScreenTemplate>
  );
}
