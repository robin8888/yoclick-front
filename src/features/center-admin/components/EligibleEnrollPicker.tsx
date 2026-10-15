import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Avatar } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { useEligibleForService } from '../hooks/useEligibleForService';

interface EligibleEnrollPickerProps {
  serviceId: string;
  selectedMembershipIds: readonly string[];
  onClientToggle: (client: { membershipId: string; fullName: string }) => void;
}

function EligibleRows({
  clients,
  selectedMembershipIds,
  onClientToggle,
}: Readonly<{
  clients: readonly {
    membershipId: string;
    fullName: string;
    photoUrl: string | null;
    bookableSessions: number;
  }[];
  selectedMembershipIds: readonly string[];
  onClientToggle: EligibleEnrollPickerProps['onClientToggle'];
}>): React.JSX.Element {
  return (
    <>
      {clients.map((client) => (
        <ListItem
          key={client.membershipId}
          leading={<Avatar name={client.fullName} photoUrl={client.photoUrl} isDecorative />}
          title={client.fullName}
          subtitle={i18n.t('staffAgenda.newAppointment.bookableCount', {
            count: client.bookableSessions,
          })}
          isSelected={selectedMembershipIds.includes(client.membershipId)}
          onPress={() => {
            onClientToggle({ membershipId: client.membershipId, fullName: client.fullName });
          }}
        />
      ))}
    </>
  );
}

/**
 * Las personas a las que se puede matricular en la clase: con un bono en vigor y clases por
 * agendar para su servicio. Quien no lo tiene no sale: primero hay que activarle un bono.
 */
export function EligibleEnrollPicker({
  serviceId,
  selectedMembershipIds,
  onClientToggle,
}: Readonly<EligibleEnrollPickerProps>): React.JSX.Element {
  const eligible = useEligibleForService(serviceId);

  if (eligible.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (eligible.isError) {
    return (
      <LoadErrorState
        title={i18n.t('centerAdmin.schedules.enrollLoadError')}
        error={eligible.error}
        onRetry={() => {
          void eligible.refetch();
        }}
      />
    );
  }
  if (eligible.data.clients.length === 0) {
    return <Text color="ink2">{i18n.t('centerAdmin.schedules.enrollNobodyWithPass')}</Text>;
  }
  return (
    <>
      <Text color="ink2">{i18n.t('centerAdmin.schedules.enrollOnlyWithPass')}</Text>
      <EligibleRows
        clients={eligible.data.clients}
        selectedMembershipIds={selectedMembershipIds}
        onClientToggle={onClientToggle}
      />
    </>
  );
}
