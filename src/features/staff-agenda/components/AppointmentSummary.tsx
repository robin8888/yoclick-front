import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { Text } from '@/ui/atoms/Text';

import type { NewAppointmentForm } from '../hooks/useNewAppointmentForm';

/** Las líneas de lo que se va a asignar, con el tipo (privada o grupal) bien visible. */
function listSummaryLines(form: NewAppointmentForm): string[] {
  const joinedGroup = form.joinableGroups.find((group) => group.sessionId === form.joinSessionId);
  if (joinedGroup !== undefined) {
    return [
      i18n.t('staffAgenda.newAppointment.summaryJoin', {
        time: formatTime24h(joinedGroup.startsAt, form.timeZone),
        room: joinedGroup.room.name,
      }),
    ];
  }
  const service = (form.services.data?.services ?? []).find(
    (candidate) => candidate.id === form.serviceId,
  );
  if (service === undefined || form.selectedStartsAt === null) return [];

  const kindKey =
    form.mode === 'group'
      ? 'staffAgenda.newAppointment.summaryGroup'
      : 'staffAgenda.newAppointment.summaryPrivate';
  const lines = [
    i18n.t(kindKey, {
      service: service.name,
      time: formatTime24h(form.selectedStartsAt, form.timeZone),
    }),
  ];
  const room =
    form.freeRooms.find((candidate) => candidate.id === form.roomId) ??
    form.groupRoomOptions.find((entry) => entry.room.id === form.roomId)?.room;
  if (room !== undefined) {
    lines.push(i18n.t('staffAgenda.newAppointment.summaryRoom', { name: room.name }));
  }
  return lines;
}

/** Resumen de la cita antes de guardar, para que el tipo y la sala no se confundan. */
export function AppointmentSummary({
  form,
}: Readonly<{ form: NewAppointmentForm }>): React.JSX.Element | null {
  const lines = listSummaryLines(form);
  if (lines.length === 0) return null;

  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.summaryTitle')}</Text>
      {lines.map((line) => (
        <Text key={line} variant="bodyStrong">
          {line}
        </Text>
      ))}
    </>
  );
}
