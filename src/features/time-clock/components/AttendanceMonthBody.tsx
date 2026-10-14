import type { TimeEntryListResponseDto, TimeEntryResponseDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { LoadErrorState } from '@/features/join';
import { useActiveCenterSummary } from '@/features/auth';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { CENTER_TIME_ZONE } from '../hooks/useAttendanceMonth';
import { useMonthTimeEntries } from '../hooks/useMonthTimeEntries';
import { useShareTimeReport } from '../hooks/useShareTimeReport';
import { groupEntriesByDay } from '../model/group-entries-by-day';
import { formatMonthTitle } from '../model/month';
import { AttendanceActions } from './AttendanceActions';
import { MonthContent } from './MonthContent';

interface AttendanceMonthBodyProps {
  monthId: string;
  onEntryPress: (entry: TimeEntryResponseDto) => void;
  onAddPress: () => void;
}

interface ReadyMonthProps extends AttendanceMonthBodyProps {
  month: TimeEntryListResponseDto;
}

/** El mes con datos: totales, días con fichajes, y las acciones de añadir y de sacar el informe. */
function ReadyMonth({
  monthId,
  month,
  onEntryPress,
  onAddPress,
}: Readonly<ReadyMonthProps>): React.JSX.Element {
  const staffName = useSessionStore((state) => state.user?.fullName) ?? '';
  const center = useActiveCenterSummary();
  const report = useShareTimeReport();
  const days = groupEntriesByDay(month.entries);

  return (
    <>
      <MonthContent
        month={month}
        days={days}
        timeZone={CENTER_TIME_ZONE}
        onEntryPress={onEntryPress}
        onAddPress={onAddPress}
      />
      <AttendanceActions
        hasEntries={days.length > 0}
        isSharingReport={report.isSharing}
        reportErrorMessage={report.errorMessage}
        onAddPress={onAddPress}
        onReportPress={() => {
          report.shareReport({
            staffName,
            centerName: center.name,
            monthTitle: formatMonthTitle(monthId),
            days: [...days].reverse(),
            totalWorkedMinutes: month.totals.workedMinutes,
            timeZone: CENTER_TIME_ZONE,
          });
        }}
      />
    </>
  );
}

/** El mes elegido con sus estados: cargando, con error y reintento, y con datos. */
export function AttendanceMonthBody(props: Readonly<AttendanceMonthBodyProps>): React.JSX.Element {
  const entries = useMonthTimeEntries(props.monthId);

  if (entries.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (entries.isError) {
    return (
      <LoadErrorState
        title={i18n.t('timeClock.errorTitle')}
        error={entries.error}
        onRetry={() => void entries.refetch()}
        isRetrying={entries.isFetching}
      />
    );
  }
  return <ReadyMonth {...props} month={entries.data} />;
}
