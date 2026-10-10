import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { OptionCard } from '@/ui/molecules/OptionCard';

import type { NewAppointmentForm } from '../hooks/useNewAppointmentForm';

/** Tipo de cita: privada (una persona) o grupal (hasta el aforo de la sala). */
export function AppointmentModeFields({
  form,
}: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.modeLabel')}</Text>
      <OptionCard
        title={i18n.t('staffAgenda.newAppointment.modePrivate')}
        description={i18n.t('staffAgenda.newAppointment.modePrivateHelper')}
        isSelected={form.mode === 'private'}
        onPress={() => {
          form.selectMode('private');
        }}
      />
      <OptionCard
        title={i18n.t('staffAgenda.newAppointment.modeGroup')}
        description={i18n.t('staffAgenda.newAppointment.modeGroupHelper')}
        isSelected={form.mode === 'group'}
        onPress={() => {
          form.selectMode('group');
        }}
      />
    </>
  );
}

/** Las salas libres a la hora elegida; la grupal usa el aforo de la sala que se elija. */
export function RoomChoices({ form }: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  if (form.freeRooms.length === 0) {
    return <Text color="ink2">{i18n.t('staffAgenda.newAppointment.noFreeRoom')}</Text>;
  }
  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.roomLabel')}</Text>
      {form.freeRooms.map((room) => (
        <OptionCard
          key={room.id}
          title={i18n.t('staffAgenda.newAppointment.roomOption', {
            name: room.name,
            capacity: room.capacity,
          })}
          isSelected={room.id === form.roomId}
          onPress={() => {
            form.selectRoom(room.id);
          }}
        />
      ))}
    </>
  );
}
