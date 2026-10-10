import { useRouter } from 'expo-router';

import type { AgendaResponseDtoEntriesItemBooking } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import { resolveSessionPhase } from '../model/session-phase';
import { ClassSessionSummary } from './ClassSessionSummary';
import { ClassTimerPanel } from './ClassTimerPanel';

interface ClassSessionBodyProps {
  booking: AgendaResponseDtoEntriesItemBooking;
  timeZone: string;
  isoDate: string;
  /** Solo el centro puede apuntar a más gente a un grupo. */
  canAddPeople: boolean;
}

/** En un grupo con plazas, el centro puede apuntar a más alumnos a la misma hora y sala. */
function AddPeopleToGroup({
  booking,
  timeZone,
  isoDate,
}: Readonly<Omit<ClassSessionBodyProps, 'canAddPeople'>>): React.JSX.Element {
  const router = useRouter();
  const { capacity, bookedCount } = booking.session;

  if (bookedCount >= capacity) {
    return <Text color="ink2">{i18n.t('staffAgenda.session.groupFull')}</Text>;
  }
  return (
    <Button
      isFullWidth
      variant="outline"
      label={i18n.t('staffAgenda.session.addPeopleAction')}
      onPress={() => {
        router.push({
          pathname: '/(admin)/new-appointment',
          params: { date: isoDate, time: formatTime24h(booking.startsAt, timeZone) },
        });
      }}
    />
  );
}

/** El reloj (solo mientras la clase está en curso) y el resumen de previsto frente a real. */
export function ClassSessionBody({
  booking,
  timeZone,
  isoDate,
  canAddPeople,
}: Readonly<ClassSessionBodyProps>): React.JSX.Element {
  const isInProgress = resolveSessionPhase(booking) === 'in-progress';

  return (
    <>
      {isInProgress && booking.startedAt !== null ? (
        <ClassTimerPanel
          startedAt={booking.startedAt}
          plannedDurationMinutes={booking.service.durationMinutes}
        />
      ) : null}
      <ClassSessionSummary booking={booking} timeZone={timeZone} />
      {canAddPeople && booking.session.mode === 'group' && booking.status === 'confirmed' ? (
        <AddPeopleToGroup booking={booking} timeZone={timeZone} isoDate={isoDate} />
      ) : null}
    </>
  );
}
