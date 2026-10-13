import { View } from 'react-native';

import { ClientPicker } from '@/features/clients';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';

import type { ChosenClient } from '../hooks/useNewAppointmentForm';
import { EligibleClientPicker } from './EligibleClientPicker';

interface ClientChoiceFieldProps {
  clients: readonly ChosenClient[];
  /** Cita grupal o clase que ya existe: se puede elegir a varias personas. */
  canChooseSeveral: boolean;
  onClientToggle: (client: ChosenClient) => void;
  onClientsClear: () => void;
  /**
   * Al apuntar a una clase de este servicio solo se ofrece a quien tiene un bono en vigor con
   * clases; sin él, se puede elegir a cualquier persona del centro.
   */
  requiredPassServiceId?: string | undefined;
}

const FIELD_GAP_STYLE = { gap: 12 } as const;

/** «Puedes elegir a varias personas» o cuántas hay elegidas y quiénes. */
function ChosenClientsSummary({
  clients,
}: Readonly<{ clients: readonly ChosenClient[] }>): React.JSX.Element {
  return (
    <Text color="ink2">
      {clients.length === 0
        ? i18n.t('staffAgenda.newAppointment.severalClientsHint')
        : i18n.t('staffAgenda.newAppointment.chosenClients', {
            count: clients.length,
            names: clients.map((client) => client.fullName).join(', '),
          })}
    </Text>
  );
}

/** El buscador de todo el centro o, al apuntar a una clase, solo las personas con bono y clases. */
function ClientSearch({
  requiredPassServiceId,
  clients,
  onClientToggle,
}: Readonly<{
  requiredPassServiceId: string | undefined;
  clients: readonly ChosenClient[];
  onClientToggle: (client: ChosenClient) => void;
}>): React.JSX.Element {
  const selectedMembershipIds = clients.map((client) => client.membershipId);

  if (requiredPassServiceId === undefined) {
    return (
      <ClientPicker onClientSelect={onClientToggle} selectedMembershipIds={selectedMembershipIds} />
    );
  }
  return (
    <EligibleClientPicker
      serviceId={requiredPassServiceId}
      selectedMembershipIds={selectedMembershipIds}
      onClientToggle={onClientToggle}
    />
  );
}

/**
 * A quién se le pone la cita. Con una sola persona permitida, el buscador hasta elegir y después
 * la persona con «Cambiar». Con varias, el buscador sigue visible para marcar y desmarcar, y
 * debajo se cuentan y nombran las elegidas.
 */
export function ClientChoiceField({
  clients,
  canChooseSeveral,
  onClientToggle,
  onClientsClear,
  requiredPassServiceId,
}: Readonly<ClientChoiceFieldProps>): React.JSX.Element {
  const [firstClient] = clients;
  const labelKey = canChooseSeveral
    ? 'staffAgenda.newAppointment.clientsLabel'
    : 'staffAgenda.newAppointment.clientLabel';

  return (
    <>
      <Text variant="titleMd">{i18n.t(labelKey)}</Text>
      {!canChooseSeveral && firstClient !== undefined ? (
        <ListItem
          title={firstClient.fullName}
          subtitle={i18n.t('staffAgenda.newAppointment.changeClient')}
          leadingIconName="user"
          onPress={onClientsClear}
        />
      ) : (
        <>
          {canChooseSeveral ? <ChosenClientsSummary clients={clients} /> : null}
          <View style={FIELD_GAP_STYLE}>
            <ClientSearch
              requiredPassServiceId={requiredPassServiceId}
              clients={clients}
              onClientToggle={onClientToggle}
            />
          </View>
        </>
      )}
    </>
  );
}
