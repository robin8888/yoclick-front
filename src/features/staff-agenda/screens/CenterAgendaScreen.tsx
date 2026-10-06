import { useRouter } from 'expo-router';

import { useActiveCenterSummary } from '@/features/auth';
import { formatLongDate } from '@/features/booking';
import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { AgendaResponseDto } from '@/shared/api/generated/model';
import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CenterAgendaHeader } from '../components/CenterAgendaHeader';
import { CenterKpiSection } from '../components/CenterKpiSection';
import { CenterDayControl } from '../components/CenterDayControl';
import { ScanAttendanceButton } from '../components/ScanAttendanceButton';
import { StaffAgendaColumns } from '../components/StaffAgendaColumns';
import { useAgendaDay, type AgendaDay } from '../hooks/useAgendaDay';
import { useCenterStaff } from '../hooks/useCenterStaff';
import { useDayAgenda } from '../hooks/useDayAgenda';
import { buildStaffAgendaColumns } from '../model/center-agenda-summary';

interface CenterAgendaContentProps {
  agenda: AgendaResponseDto;
  day: AgendaDay;
  dayLabel: string;
}

function CenterAgendaContent({
  agenda,
  dayLabel,
  day,
}: Readonly<CenterAgendaContentProps>): React.JSX.Element {
  const router = useRouter();
  const teamStaff = useCenterStaff();
  const staffWord = getSectorVocabulary(useActiveCenterSectorId()).staff.singular;

  return (
    <>
      <CenterKpiSection agenda={agenda} />
      <CenterDayControl
        heading={i18n.t('staffAgenda.center.byStaffTitle', { staffWord })}
        dayLabel={day.isToday ? i18n.t('staffAgenda.agenda.today') : dayLabel}
        onPreviousDay={day.goToPreviousDay}
        onNextDay={day.goToNextDay}
      />
      <StaffAgendaColumns
        columns={buildStaffAgendaColumns(agenda.entries, teamStaff)}
        timeZone={agenda.timezone}
        onEntryPress={(bookingId) => {
          router.push({
            pathname: '/(staff)/sessions/[bookingId]',
            params: { bookingId, date: agenda.date },
          });
        }}
      />
    </>
  );
}

/** Prototipo `aagenda`: resumen del día y una columna de citas por profesional. */
export function CenterAgendaScreen(): React.JSX.Element {
  const center = useActiveCenterSummary();
  const day = useAgendaDay();
  const agenda = useDayAgenda(day.isoDate);
  const dayDate = `${day.isoDate}T12:00:00.000Z`;
  const title = i18n.t('staffAgenda.agenda.adminTitle');

  return (
    <ScreenTemplate isHeaderHidden title={title}>
      <CenterAgendaHeader
        centerName={center.name}
        centerLogoUrl={resolveApiAssetUrl(center.logoUrl)}
        dateLabel={formatLongDate(dayDate, 'UTC')}
        title={title}
      />
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
