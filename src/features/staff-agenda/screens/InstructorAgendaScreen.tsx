import { useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AgendaDayStrip } from '../components/AgendaDayStrip';
import { InstructorAgendaContent } from '../components/InstructorAgendaContent';
import { InstructorAgendaHeader } from '../components/InstructorAgendaHeader';
import { useAgendaDay } from '../hooks/useAgendaDay';
import { useDayAgenda } from '../hooks/useDayAgenda';
import { buildAgendaDays } from '../model/agenda-days';

function InstructorAgendaBody({
  agenda,
}: Readonly<{ agenda: ReturnType<typeof useDayAgenda> }>): React.JSX.Element | null {
  if (agenda.isError) {
    return (
      <LoadErrorState
        title={i18n.t('staffAgenda.agenda.errorTitle')}
        error={agenda.error}
        onRetry={() => void agenda.refetch()}
        isRetrying={agenda.isFetching}
      />
    );
  }
  if (agenda.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  return <InstructorAgendaContent agenda={agenda.data} />;
}

/** Prototipo `iagenda`: la primera pantalla del profesional, con su día hora a hora. */
export function InstructorAgendaScreen(): React.JSX.Element {
  const router = useRouter();
  const day = useAgendaDay();
  const agenda = useDayAgenda(day.isoDate);

  return (
    <ScreenTemplate
      isHeaderHidden
      title={i18n.t('staffAgenda.agenda.staffTitle')}
      floatingAction={
        <Button
          leadingIconName="plus"
          label={i18n.t('staffAgenda.instructor.newAppointmentAction')}
          onPress={() => {
            router.push({ pathname: '/(staff)/new-appointment', params: { date: day.isoDate } });
          }}
        />
      }
    >
      <InstructorAgendaHeader />
      <AgendaDayStrip
        days={buildAgendaDays(day.todayIsoDate)}
        selectedIsoDate={day.isoDate}
        onDaySelect={day.selectDate}
      />
      <Button
        variant="dark"
        leadingIconName="qrCode"
        isFullWidth
        label={i18n.t('staffAgenda.instructor.scanAttendanceAction')}
        onPress={() => {
          router.push('/(staff)/scan');
        }}
      />
      <InstructorAgendaBody agenda={agenda} />
    </ScreenTemplate>
  );
}
