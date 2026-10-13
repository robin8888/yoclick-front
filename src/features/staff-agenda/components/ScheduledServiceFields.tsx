import { View } from 'react-native';

import type { ServiceSessionsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { getTodayIsoDate } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { OptionCard } from '@/ui/molecules/OptionCard';

import type { NewAppointmentForm } from '../hooks/useNewAppointmentForm';
import { AppointmentDayCalendar } from './AppointmentDayCalendar';

type OpenSession = ServiceSessionsResponseDto['sessions'][number];

const LIST_STYLE = { gap: 8 } as const;

/** El día local (en la zona del centro) en que empieza una clase. */
function getLocalDate(startsAt: string, timeZone: string): string {
  return getTodayIsoDate(new Date(startsAt), timeZone);
}

interface DaySessionsProps {
  sessions: readonly OpenSession[];
  timeZone: string;
  joinSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
}

/** Las clases de ese día con sala, profesor y plazas que quedan; se elige una. */
function DaySessions({
  sessions,
  timeZone,
  joinSessionId,
  onSessionSelect,
}: Readonly<DaySessionsProps>): React.JSX.Element {
  if (sessions.length === 0) {
    return <Text color="ink2">{i18n.t('staffAgenda.newAppointment.noClassThisDay')}</Text>;
  }
  return (
    <View style={LIST_STYLE}>
      {sessions.map((session) => (
        <OptionCard
          key={session.id}
          title={i18n.t('staffAgenda.newAppointment.classOption', {
            startTime: formatTime24h(session.startsAt, timeZone),
            endTime: formatTime24h(session.endsAt, timeZone),
            room: session.room?.name ?? i18n.t('staffAgenda.newAppointment.noRoom'),
          })}
          description={i18n.t('staffAgenda.newAppointment.classSeats', {
            teacher: session.teacher.fullName,
            remaining: session.remainingSeats,
            capacity: session.capacity,
          })}
          isSelected={session.id === joinSessionId}
          onPress={() => {
            onSessionSelect(session.id);
          }}
        />
      ))}
    </View>
  );
}

interface NextClassSuggestionProps {
  sessions: ServiceSessionsResponseDto;
  onDateSelect: (isoDate: string) => void;
}

/** «Próxima clase con plazas: 2026-10-20 a las 18:00»: lleva a esa fecha de un toque. */
function NextClassSuggestion({
  sessions,
  onDateSelect,
}: Readonly<NextClassSuggestionProps>): React.JSX.Element | null {
  const { nextOpenStartsAt, timezone } = sessions;
  if (nextOpenStartsAt === null) return null;
  const nextDate = getLocalDate(nextOpenStartsAt, timezone);

  return (
    <Button
      variant="outline"
      leadingIconName="calendar"
      label={i18n.t('staffAgenda.newAppointment.goToNextClass', {
        date: nextDate,
        time: formatTime24h(nextOpenStartsAt, timezone),
      })}
      onPress={() => {
        onDateSelect(nextDate);
      }}
    />
  );
}

interface ScheduledServiceFieldsProps {
  form: NewAppointmentForm;
  sessions: ServiceSessionsResponseDto;
}

/**
 * Un servicio con horario de sala: el centro asigna dentro de sus clases. El calendario solo deja
 * elegir los días que tienen clase con plazas, debajo salen las clases de ese día y, si no hay
 * ninguna, se sugiere la próxima fecha con plazas.
 */
export function ScheduledServiceFields({
  form,
  sessions,
}: Readonly<ScheduledServiceFieldsProps>): React.JSX.Element {
  const enabledDates = new Set(
    sessions.sessions.map((session) => getLocalDate(session.startsAt, sessions.timezone)),
  );
  const sessionsOfDay = sessions.sessions.filter(
    (session) => getLocalDate(session.startsAt, sessions.timezone) === form.isoDate,
  );

  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.classDayLabel')}</Text>
      <Text variant="caption" color="ink2">
        {i18n.t('staffAgenda.newAppointment.classDayHelper')}
      </Text>
      <AppointmentDayCalendar
        selectedIsoDate={form.isoDate}
        enabledDates={enabledDates}
        onDateSelect={form.selectDate}
      />
      {sessionsOfDay.length === 0 ? (
        <NextClassSuggestion sessions={sessions} onDateSelect={form.selectDate} />
      ) : null}
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.classesLabel')}</Text>
      <DaySessions
        sessions={sessionsOfDay}
        timeZone={sessions.timezone}
        joinSessionId={form.joinSessionId}
        onSessionSelect={form.selectJoinSession}
      />
    </>
  );
}
