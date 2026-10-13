import { useRouter } from 'expo-router';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { AgendaResponseDto } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CenterDayControl } from '../components/CenterDayControl';
import { RoomAgendaList } from '../components/RoomAgendaList';
import { RoomDayGrid } from '../components/RoomDayGrid';
import { RoomWeekStrip } from '../components/RoomWeekStrip';
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
function RoomAgendaSection({ day }: Readonly<{ day: AgendaDay }>): React.JSX.Element | null {
  const roomAgenda = useRoomAgenda(day.isoDate);

  if (roomAgenda.data === undefined) return null;
  return (
    <>
      <RoomWeekStrip
        selectedIsoDate={day.isoDate}
        agenda={roomAgenda.data}
        onDaySelect={day.selectDate}
      />
      <RoomDayGrid agenda={roomAgenda.data} isoDate={roomAgenda.data.date} />
      {roomAgenda.data.sessionsWithoutRoom.length === 0 ? null : (
        <RoomAgendaList agenda={{ ...roomAgenda.data, rooms: [] }} isoDate={roomAgenda.data.date} />
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
      <CenterDayControl
        heading={heading}
        dayLabel={day.isToday ? i18n.t('staffAgenda.agenda.today') : dayLabel}
        onPreviousDay={day.goToPreviousDay}
        onNextDay={day.goToNextDay}
      />
      {hasRooms ? (
        <RoomAgendaSection day={day} />
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

/**
 * La agenda del centro en su propia pantalla: la semana, el día elegido y, por sala (o por
 * profesional si el centro no tiene salas), lo que hay en cada hora.
 */
export function CenterDayAgendaScreen(): React.JSX.Element {
  const router = useRouter();
  const day = useAgendaDay();
  const agenda = useDayAgenda(day.isoDate);
  const dayDate = `${day.isoDate}T12:00:00.000Z`;

  return (
    <ScreenTemplate
      title={i18n.t('staffAgenda.center.agendaTitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
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
