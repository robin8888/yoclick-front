import { ServiceOptionList, SlotGrid } from '@/features/booking';
import { ClientPicker } from '@/features/clients';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { ListItem } from '@/ui/molecules/ListItem';

import type { NewAppointmentForm } from '../hooks/useNewAppointmentForm';

/** Los tres pasos de «Nueva cita» en una sola pantalla: cliente, servicio y hora libre. */
export function NewAppointmentFields({
  form,
}: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.clientLabel')}</Text>
      {form.client === null ? (
        <ClientPicker onClientSelect={form.selectClient} />
      ) : (
        <ListItem
          title={form.client.fullName}
          subtitle={i18n.t('staffAgenda.newAppointment.changeClient')}
          leadingIconName="user"
          onPress={form.clearClient}
        />
      )}
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.serviceLabel')}</Text>
      <ServiceOptionList
        services={form.services.data?.services ?? []}
        selectedServiceId={form.serviceId}
        onServiceSelect={form.selectService}
        onRetry={() => void form.services.refetch()}
      />
      {form.serviceId === null ? null : (
        <>
          <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.timeLabel')}</Text>
          <SlotGrid
            slots={form.slots}
            timeZone={form.timeZone}
            selectedStartsAt={form.selectedStartsAt}
            onSlotSelect={form.selectSlot}
          />
        </>
      )}
    </>
  );
}
