import { Pressable, View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge } from '@/ui/atoms/Badge';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { useEligibleClients } from '../hooks/useEligibleClients';
import type { ChosenClient } from '../hooks/useNewAppointmentForm';
import {
  createEligibleCheckStyle,
  createEligibleRowStyle,
  ELIGIBLE_LIST_STYLE,
  ELIGIBLE_ROW_TEXT_STYLE,
} from './EligibleClientPicker.styles';

interface EligibleClientPickerProps {
  serviceId: string;
  selectedMembershipIds: readonly string[];
  onClientToggle: (client: ChosenClient) => void;
}

interface EligibleClientRowProps {
  client: {
    membershipId: string;
    fullName: string;
    photoUrl: string | null;
    bookableSessions: number;
  };
  isSelected: boolean;
  onPress: () => void;
}

/** Una persona con bono: su nombre, las clases que le quedan por agendar y un check si está elegida. */
function EligibleClientRow({
  client,
  isSelected,
  onPress,
}: Readonly<EligibleClientRowProps>): React.JSX.Element {
  const theme = useTheme();
  const bookable = i18n.t('staffAgenda.newAppointment.bookableCount', {
    count: client.bookableSessions,
  });

  return (
    <Pressable
      role="checkbox"
      accessibilityLabel={`${client.fullName}. ${bookable}`}
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={createEligibleRowStyle(theme, isSelected)}
    >
      <Avatar name={client.fullName} photoUrl={client.photoUrl} size="lg" isDecorative />
      <View style={ELIGIBLE_ROW_TEXT_STYLE}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {client.fullName}
        </Text>
        <Badge label={bookable} tone="success" />
      </View>
      <View style={createEligibleCheckStyle(theme, isSelected)}>
        {isSelected ? <Icon name="check" color="onBrand" /> : null}
      </View>
    </Pressable>
  );
}

/**
 * Las personas con bono en vigor y clases por agendar, para apuntarlas a la clase: cada una con las
 * clases que le quedan. Quien no tiene bono no sale: no se puede apuntar.
 */
export function EligibleClientPicker({
  serviceId,
  selectedMembershipIds,
  onClientToggle,
}: Readonly<EligibleClientPickerProps>): React.JSX.Element {
  const eligible = useEligibleClients(serviceId);

  if (eligible.isError) {
    return (
      <LoadErrorState
        title={i18n.t('staffAgenda.newAppointment.eligibleError')}
        error={eligible.error}
        onRetry={() => void eligible.refetch()}
        isRetrying={eligible.isFetching}
      />
    );
  }
  if (eligible.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (eligible.data.clients.length === 0) {
    return <Text color="ink2">{i18n.t('staffAgenda.newAppointment.noEligibleClients')}</Text>;
  }
  return (
    <View style={ELIGIBLE_LIST_STYLE}>
      {eligible.data.clients.map((client) => (
        <EligibleClientRow
          key={client.membershipId}
          client={client}
          isSelected={selectedMembershipIds.includes(client.membershipId)}
          onPress={() => {
            onClientToggle({ membershipId: client.membershipId, fullName: client.fullName });
          }}
        />
      ))}
    </View>
  );
}
