import { useRouter } from 'expo-router';

import { AutoStartSwitch } from '@/features/center-admin';
import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CenterDayControl } from '../components/CenterDayControl';
import { RoomAgendaList } from '../components/RoomAgendaList';
import { RoomDayGrid } from '../components/RoomDayGrid';
import { RoomWeekStrip } from '../components/RoomWeekStrip';
import { useAgendaDay, type AgendaDay } from '../hooks/useAgendaDay';
import { useCenterStaff } from '../hooks/useCenterStaff';
import { useDayAgenda } from '../hooks/useDayAgenda';
import { useHasCenterRooms } from '../hooks/useHasCenterRooms';
import { useRoomAgenda } from '../hooks/useRoomAgenda';
import type { AgendaStaffMember } from '../model/center-agenda-summary';
import { groupAgendaByStaff } from '../model/staff-lanes';

interface CenterAgendaContentProps {
  day: AgendaDay;
  dayLabel: string;
}

interface RoomAgendaSectionProps {
  day: AgendaDay;
  /** Centro sin salas: el equipo, cuyas citas se ven como si cada profesional fuese una sala. */
  staffLanes: readonly AgendaStaffMember[] | undefined;
}

/**
 * Lo que ocupa cada sala ese día; el centro necesita saber qué pasa en cada una. Un centro sin
 * salas lo ve igual, con cada profesional en el lugar de la sala.
 */
function RoomAgendaSection({
  day,
  staffLanes,
}: Readonly<RoomAgendaSectionProps>): React.JSX.Element | null {
  const roomAgenda = useRoomAgenda(day.isoDate);

  if (roomAgenda.data === undefined) return null;
  const agenda =
    staffLanes === undefined ? roomAgenda.data : groupAgendaByStaff(roomAgenda.data, staffLanes);
  return (
    <>
      <RoomWeekStrip
        selectedIsoDate={day.isoDate}
        agenda={agenda}
        onDaySelect={day.selectDate}
        {...(staffLanes === undefined ? {} : { staffLanes })}
      />
      <RoomDayGrid agenda={agenda} isoDate={agenda.date} isStaffLane={staffLanes !== undefined} />
      {agenda.sessionsWithoutRoom.length === 0 ? null : (
        <RoomAgendaList agenda={{ ...agenda, rooms: [] }} isoDate={agenda.date} />
      )}
    </>
  );
}

function CenterAgendaContent({
  dayLabel,
  day,
}: Readonly<CenterAgendaContentProps>): React.JSX.Element {
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
      <RoomAgendaSection day={day} staffLanes={hasRooms ? undefined : teamStaff} />
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
      <AutoStartSwitch />
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
        <CenterAgendaContent dayLabel={formatShortDate(dayDate, 'UTC')} day={day} />
      )}
    </ScreenTemplate>
  );
}
