import { useRouter } from 'expo-router';

import { formatLongDate } from '@/features/booking';
import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { AgendaResponseDto } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { Button } from '@/ui/atoms/Button';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CenterAgendaHeader } from '../components/CenterAgendaHeader';
import { CenterKpiSection } from '../components/CenterKpiSection';
import { CenterDayControl } from '../components/CenterDayControl';
import { ScanAttendanceButton } from '../components/ScanAttendanceButton';
import { RoomAgendaList } from '../components/RoomAgendaList';
import { RoomTimeline } from '../components/RoomTimeline';
import { StaffAgendaColumns } from '../components/StaffAgendaColumns';
import { useAgendaDay, type AgendaDay } from '../hooks/useAgendaDay';
import { useCenterStaff } from '../hooks/useCenterStaff';
import { useDayAgenda } from '../hooks/useDayAgenda';
import { useHasCenterRooms } from '../hooks/useHasCenterRooms';
import { useRoomAgenda } from '../hooks/useRoomAgenda';
import { buildStaffAgendaColumns } from '../model/center-agenda-summary';

interface CenterAgendaContentProps {
  agenda: AgendaResponseDto;
  day: AgendaDay;
  dayLabel: string;
}

/** Cada sala con lo que la ocupa ese día; el centro necesita saber qué pasa en cada una. */
function RoomAgendaSection({ isoDate }: Readonly<{ isoDate: string }>): React.JSX.Element | null {
  const roomAgenda = useRoomAgenda(isoDate);

  if (roomAgenda.data === undefined) return null;
  return (
    <>
      <RoomTimeline agenda={roomAgenda.data} isoDate={isoDate} />
      {roomAgenda.data.sessionsWithoutRoom.length === 0 ? null : (
        <RoomAgendaList agenda={{ ...roomAgenda.data, rooms: [] }} isoDate={isoDate} />
      )}
    </>
  );
}

function CenterAgendaContent({
  agenda,
  dayLabel,
  day,
}: Readonly<CenterAgendaContentProps>): React.JSX.Element {
  const router = useRouter();
  const teamStaff = useCenterStaff();
  const hasRooms = useHasCenterRooms();
  const staffWord = getSectorVocabulary(useActiveCenterSectorId()).staff.singular;
  const heading = hasRooms
    ? i18n.t('staffAgenda.center.byRoomTitle')
    : i18n.t('staffAgenda.center.byStaffTitle', { staffWord });

  return (
    <>
      <CenterKpiSection agenda={agenda} />
      <CenterDayControl
        heading={heading}
        dayLabel={day.isToday ? i18n.t('staffAgenda.agenda.today') : dayLabel}
        onPreviousDay={day.goToPreviousDay}
        onNextDay={day.goToNextDay}
      />
      {hasRooms ? (
        <RoomAgendaSection isoDate={day.isoDate} />
      ) : (
        <StaffAgendaColumns
          columns={buildStaffAgendaColumns(agenda.entries, teamStaff)}
          timeZone={agenda.timezone}
          onEntryPress={(bookingId) => {
            router.push({
              pathname: '/(staff)/sessions/[bookingId]',
              params: { bookingId, date: agenda.date, isCenterWide: 'true' },
            });
          }}
        />
      )}
    </>
  );
}

/** «Nueva cita»: solo el centro asigna citas; el profesional no. */
function NewAppointmentButton({ isoDate }: Readonly<{ isoDate: string }>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      leadingIconName="plus"
      label={i18n.t('staffAgenda.instructor.newAppointmentAction')}
      onPress={() => {
        router.push({ pathname: '/(admin)/new-appointment', params: { date: isoDate } });
      }}
    />
  );
}

/** Prototipo `aagenda`: resumen del día y una columna de citas por profesional. */
export function CenterAgendaScreen(): React.JSX.Element {
  const day = useAgendaDay();
  const agenda = useDayAgenda(day.isoDate);
  const dayDate = `${day.isoDate}T12:00:00.000Z`;
  const title = i18n.t('staffAgenda.agenda.adminTitle');

  return (
    <ScreenTemplate
      isHeaderHidden
      title={title}
      floatingAction={<NewAppointmentButton isoDate={day.isoDate} />}
    >
      <CenterAgendaHeader dateLabel={formatLongDate(dayDate, 'UTC')} title={title} />
      <ScanAttendanceButton isCenterWide />
      {agenda.isError ? (
        <LoadErrorState
          title={i18n.t('staffAgenda.agenda.errorTitle')}
          error={agenda.error}
          onRetry={() => void agenda.refetch()}
          isRetrying={agenda.isFetching}
        />
      ) : null}
      {agenda.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {agenda.data === undefined ? null : (
        <CenterAgendaContent
          agenda={agenda.data}
          dayLabel={formatShortDate(dayDate, 'UTC')}
          day={day}
        />
      )}
    </ScreenTemplate>
  );
}
