import { useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import type { AgendaResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AgendaEntryCard } from '../components/AgendaEntryCard';
import { DateNavigator } from '../components/DateNavigator';
import { ScanAttendanceButton } from '../components/ScanAttendanceButton';
import { useAgendaDay } from '../hooks/useAgendaDay';
import { useDayAgenda } from '../hooks/useDayAgenda';

interface AgendaScreenProps {
  /** La agenda del centro (administración) nombra al profesional en cada cita. */
  isCenterWide: boolean;
}

interface AgendaEntriesProps {
  agenda: AgendaResponseDto;
  isCenterWide: boolean;
  onRefresh: () => void;
}

function AgendaEntries({
  agenda,
  isCenterWide,
  onRefresh,
}: Readonly<AgendaEntriesProps>): React.JSX.Element {
  const router = useRouter();

  if (agenda.entries.length === 0) {
    return (
      <EmptyState
        iconName="calendar"
        title={i18n.t('staffAgenda.agenda.emptyTitle')}
        description={i18n.t('staffAgenda.agenda.emptyDescription')}
        actionLabel={getSharedStateCopy().retryLabel}
        onActionPress={onRefresh}
      />
    );
  }
  return (
    <>
      {agenda.entries.map((entry) => (
        <AgendaEntryCard
          key={entry.booking.id}
          entry={entry}
          timeZone={agenda.timezone}
          shouldShowStaffName={isCenterWide}
          onPress={() => {
            router.push({
              pathname: '/(staff)/sessions/[bookingId]',
              params: { bookingId: entry.booking.id, date: agenda.date },
            });
          }}
        />
      ))}
    </>
  );
}

/** Prototipo `iagenda` / `aagenda`: las citas de un día, con flechas para cambiar de día. */
export function AgendaScreen({ isCenterWide }: Readonly<AgendaScreenProps>): React.JSX.Element {
  const day = useAgendaDay();
  const agenda = useDayAgenda(day.isoDate);
  const dayLabel = formatShortDate(`${day.isoDate}T12:00:00.000Z`, 'UTC');

  return (
    <ScreenTemplate
      title={i18n.t(
        isCenterWide ? 'staffAgenda.agenda.adminTitle' : 'staffAgenda.agenda.staffTitle',
      )}
    >
      <ScanAttendanceButton isCenterWide={isCenterWide} />
      <DateNavigator
        dateLabel={day.isToday ? `${i18n.t('staffAgenda.agenda.today')} · ${dayLabel}` : dayLabel}
        onPreviousDay={day.goToPreviousDay}
        onNextDay={day.goToNextDay}
      />
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
        <AgendaEntries
          agenda={agenda.data}
          isCenterWide={isCenterWide}
          onRefresh={() => void agenda.refetch()}
        />
      )}
    </ScreenTemplate>
  );
}
