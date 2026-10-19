import { View } from 'react-native';

import type { MyWaitlistResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';

import { useWaitlistActions } from '../hooks/useWaitlistActions';
import { buildWaitlistStatusLabel } from '../model/waitlist-labels';

const ACTIONS_STYLE = { gap: 8 } as const;

interface WaitlistSessionActionProps {
  classSessionId: string;
  /** La entrada de la persona en la espera de esta clase, si ya está. */
  entry: MyWaitlistResponseDtoEntriesItem | undefined;
  timeZone: string;
}

type WaitlistActions = ReturnType<typeof useWaitlistActions>;

function JoinWaitlist({
  classSessionId,
  actions,
}: Readonly<{ classSessionId: string; actions: WaitlistActions }>): React.JSX.Element {
  return (
    <Button
      variant="outline"
      size="sm"
      label={i18n.t('waitlist.joinAction')}
      isLoading={actions.isBusy}
      onPress={() => {
        actions.joinWaitlist(classSessionId);
      }}
    />
  );
}

/** La plaza ofrecida se confirma o se deja; en cola solo se puede salir. */
function EntryButtons({
  entry,
  actions,
}: Readonly<{
  entry: MyWaitlistResponseDtoEntriesItem;
  actions: WaitlistActions;
}>): React.JSX.Element {
  const isOffered = entry.status === 'offered';
  return (
    <>
      {isOffered ? (
        <Button
          size="sm"
          label={i18n.t('waitlist.confirmAction')}
          isLoading={actions.isBusy}
          onPress={() => {
            actions.confirmOffer(entry.id);
          }}
        />
      ) : null}
      <Button
        variant="ghost"
        size="sm"
        label={isOffered ? i18n.t('waitlist.declineAction') : i18n.t('waitlist.leaveAction')}
        isDisabled={actions.isBusy}
        onPress={() => {
          actions.leaveWaitlist(entry.id);
        }}
      />
    </>
  );
}

/**
 * Lo que se puede hacer con una clase llena: apuntarse a su lista de espera, salir de ella o, si ya
 * se liberó una plaza, confirmarla (o dejarla para que pase a la siguiente persona).
 */
export function WaitlistSessionAction({
  classSessionId,
  entry,
  timeZone,
}: Readonly<WaitlistSessionActionProps>): React.JSX.Element {
  const actions = useWaitlistActions();

  return (
    <View style={ACTIONS_STYLE}>
      {entry === undefined ? (
        <JoinWaitlist classSessionId={classSessionId} actions={actions} />
      ) : (
        <>
          <Text variant="caption" color="ink2">
            {buildWaitlistStatusLabel(entry, timeZone)}
          </Text>
          <EntryButtons entry={entry} actions={actions} />
        </>
      )}
      {actions.errorMessage === null ? null : <FormErrorBanner message={actions.errorMessage} />}
    </View>
  );
}
