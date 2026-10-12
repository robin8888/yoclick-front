import { ClientPicker } from '@/features/clients';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';

import type { ChosenClient } from '../hooks/useNewAppointmentForm';

interface ClientChoiceFieldProps {
  client: ChosenClient | null;
  onClientSelect: (client: ChosenClient) => void;
  onClientClear: () => void;
}

/** A quién se le pone la cita: el buscador hasta elegir, y después la persona con «Cambiar». */
export function ClientChoiceField({
  client,
  onClientSelect,
  onClientClear,
}: Readonly<ClientChoiceFieldProps>): React.JSX.Element {
  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.clientLabel')}</Text>
      {client === null ? (
        <ClientPicker onClientSelect={onClientSelect} />
      ) : (
        <ListItem
          title={client.fullName}
          subtitle={i18n.t('staffAgenda.newAppointment.changeClient')}
          leadingIconName="user"
          onPress={onClientClear}
        />
      )}
    </>
  );
}
