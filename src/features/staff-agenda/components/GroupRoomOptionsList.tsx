import { View } from 'react-native';

import type { GroupOptionsResponseDtoRoomsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { Text } from '@/ui/atoms/Text';
import { OptionCard } from '@/ui/molecules/OptionCard';
import { SlotButton } from '@/ui/molecules/SlotButton';

import { useTickingNow } from '@/shared/hooks/useTickingNow';

import type { NewAppointmentForm } from '../hooks/useNewAppointmentForm';
import { keepFutureSlots } from '@/shared/lib/slot-hours';
import { CHIP_ROW_STYLE } from './AppointmentTimePicker.styles';

/** Las horas que pasan desaparecen solas; con mirar cada minuto basta. */
const NOW_REFRESH_MS = 60_000;

interface RoomEntryProps {
  entry: GroupOptionsResponseDtoRoomsItem;
  form: NewAppointmentForm;
  /** Para no ofrecer horas ni grupos que ya empezaron. */
  now: Date;
}

function RoomSlotChips({ entry, form, now }: Readonly<RoomEntryProps>): React.JSX.Element {
  const { room } = entry;
  const openSlots = keepFutureSlots(entry.openSlots, now);

  if (openSlots.length === 0) {
    return <Text color="ink2">{i18n.t('staffAgenda.newAppointment.groupRoomNoSlots')}</Text>;
  }
  return (
    <View style={CHIP_ROW_STYLE.row}>
      {openSlots.map((slot) => (
        <SlotButton
          key={slot.startsAt}
          timeLabel={formatTime24h(slot.startsAt, form.timeZone)}
          isSelected={
            form.staffMembershipId === room.staff.membershipId &&
            form.roomId === room.id &&
            form.selectedStartsAt === slot.startsAt
          }
          onPress={() => {
            form.selectGroupSlot({
              staffMembershipId: room.staff.membershipId,
              roomId: room.id,
              startsAt: slot.startsAt,
            });
          }}
        />
      ))}
    </View>
  );
}

function RoomGroupCards({ entry, form, now }: Readonly<RoomEntryProps>): React.JSX.Element {
  return (
    <>
      {keepFutureSlots(entry.groupSessions, now).map((group) => (
        <OptionCard
          key={group.sessionId}
          title={i18n.t('staffAgenda.newAppointment.joinOption', {
            time: formatTime24h(group.startsAt, form.timeZone),
            room: entry.room.name,
          })}
          description={i18n.t('staffAgenda.newAppointment.joinSeats', {
            booked: group.bookedCount,
            capacity: group.capacity,
            service: group.serviceName,
          })}
          isSelected={group.sessionId === form.joinSessionId}
          onPress={() => {
            form.selectJoinSession(group.sessionId);
          }}
        />
      ))}
    </>
  );
}

/** Una sala con uno de sus profesores: las horas libres de los dos y los grupos con plazas. */
function RoomEntry({ entry, form, now }: Readonly<RoomEntryProps>): React.JSX.Element {
  const { room } = entry;

  return (
    <View style={CHIP_ROW_STYLE.container}>
      <Text variant="bodyStrong">
        {i18n.t('staffAgenda.newAppointment.groupRoomTeacher', {
          room: room.name,
          teacher: room.staff.fullName,
        })}
      </Text>
      <Text variant="caption" color="ink2">
        {i18n.t('staffAgenda.newAppointment.groupRoomSeats', { capacity: room.capacity })}
      </Text>
      <RoomSlotChips entry={entry} form={form} now={now} />
      <RoomGroupCards entry={entry} form={form} now={now} />
    </View>
  );
}

/**
 * Cita grupal: las salas donde se da el servicio con los profesores que lo dan. Se elige la hora de
 * uno de ellos (abre un grupo) o un grupo que ya existe con plazas (se apunta al alumno).
 */
export function GroupRoomOptionsList({
  form,
}: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element {
  const now = useTickingNow(NOW_REFRESH_MS);

  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.groupRoomsTitle')}</Text>
      <Text variant="caption" color="ink2">
        {i18n.t('staffAgenda.newAppointment.groupRoomsHelper')}
      </Text>
      {form.groupRoomOptions.length === 0 ? (
        <Text color="ink2">{i18n.t('staffAgenda.newAppointment.groupRoomsEmpty')}</Text>
      ) : null}
      {form.groupRoomOptions.map((entry) => (
        <RoomEntry
          key={`${entry.room.id}:${entry.room.staff.membershipId}`}
          entry={entry}
          form={form}
          now={now}
        />
      ))}
    </>
  );
}
