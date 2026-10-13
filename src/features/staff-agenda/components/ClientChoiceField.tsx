import { View } from 'react-native';

import { ClientPicker } from '@/features/clients';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';

import type { ChosenClient } from '../hooks/useNewAppointmentForm';

interface ClientChoiceFieldProps {
  clients: readonly ChosenClient[];
  /** Cita grupal o clase que ya existe: se puede elegir a varias personas. */
  canChooseSeveral: boolean;
  onClientToggle: (client: ChosenClient) => void;
  onClientsClear: () => void;
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
            <ClientPicker
              onClientSelect={onClientToggle}
              selectedMembershipIds={clients.map((client) => client.membershipId)}
            />
          </View>
        </>
      )}
    </>
  );
}
