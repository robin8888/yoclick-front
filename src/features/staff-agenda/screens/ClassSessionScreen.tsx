import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ClassSessionBody } from '../components/ClassSessionBody';
import { ClassSessionFooter } from '../components/ClassSessionFooter';
import { useClassSessionActions } from '../hooks/useClassSessionActions';
import { useDayAgenda } from '../hooks/useDayAgenda';
import { classSessionRouteParamsSchema } from '../model/session-route-params';

interface ClassSessionDetailProps {
  entry: AgendaResponseDtoEntriesItem;
  timeZone: string;
  isoDate: string;
}

function ClassSessionDetail({
  entry,
  timeZone,
  isoDate,
}: Readonly<ClassSessionDetailProps>): React.JSX.Element {
  const router = useRouter();
  const { booking, client } = entry;
  const actions = useClassSessionActions(booking.id, isoDate);

  return (
    <ScreenTemplate
      title={booking.service.name}
      subtitle={client.fullName}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <ClassSessionFooter
          booking={booking}
          isStarting={actions.isStarting}
          isEnding={actions.isEnding}
          onStart={actions.startClass}
          onEnd={actions.endClass}
        />
      }
    >
      {actions.actionErrorMessage === null ? null : (
        <FormErrorBanner message={actions.actionErrorMessage} />
      )}
      <ClassSessionBody booking={booking} timeZone={timeZone} />
    </ScreenTemplate>
  );
}

function SessionNotFound({ onBack }: Readonly<{ onBack: () => void }>): React.JSX.Element {
  return (
    <ScreenTemplate title={i18n.t('staffAgenda.session.title')}>
      <EmptyState
        iconName="calendar"
        title={i18n.t('staffAgenda.session.notFoundTitle')}
        description={i18n.t('staffAgenda.session.notFoundDescription')}
        actionLabel={i18n.t('staffAgenda.session.backToAgendaAction')}
        onActionPress={onBack}
      />
    </ScreenTemplate>
  );
}

interface ClassSessionContentProps {
  bookingId: string;
  isoDate: string;
}

function ClassSessionContent({
  bookingId,
  isoDate,
}: Readonly<ClassSessionContentProps>): React.JSX.Element {
  const router = useRouter();
  const agenda = useDayAgenda(isoDate);
  const entry = agenda.data?.entries.find((candidate) => candidate.booking.id === bookingId);

  if (agenda.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (entry === undefined || agenda.data === undefined) {
    return <SessionNotFound onBack={router.back} />;
  }
  return <ClassSessionDetail entry={entry} timeZone={agenda.data.timezone} isoDate={isoDate} />;
}

/** Iniciar y terminar una clase con temporizador; queda registrado para el propietario. */
export function ClassSessionScreen(): React.JSX.Element {
  const params = classSessionRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/" />;
  return <ClassSessionContent bookingId={params.data.bookingId} isoDate={params.data.date} />;
}
