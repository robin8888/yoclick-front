import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import { getServicePassBalance, useMyPasses } from '@/features/passes';
import type { ServiceSessionsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { StepProgress } from '@/ui/molecules/StepProgress';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ClassSelectionFields } from '../components/ClassSelectionFields';
import { PassBalanceNote } from '../components/PassBalanceNote';
import { NoScheduleYet } from '../components/NoScheduleYet';
import { ReviewClassButton } from '../components/ReviewClassButton';
import { useClassSelection } from '../hooks/useClassSelection';
import { useMyBookings } from '../hooks/useMyBookings';
import { useServiceSessions } from '../hooks/useServiceSessions';
import { slotRouteParamsSchema } from '../model/booking-route-params';

const BOOKING_STEP_COUNT = 2;

interface ClassStepProps {
  sessions: ServiceSessionsResponseDto;
  serviceId: string;
}

/** Elegir día y clase entre las que el centro ya fijó en sus salas, con plazas y por delante. */
function ClassStep({ sessions, serviceId }: Readonly<ClassStepProps>): React.JSX.Element {
  const router = useRouter();
  // Con bono se agendan tantas clases como le queden menos las ya agendadas; sin bono, una.
  const upcoming = useMyBookings('upcoming').data?.bookings ?? [];
  const balance = getServicePassBalance(useMyPasses().data?.passes ?? [], serviceId, upcoming);
  const selection = useClassSelection(sessions, balance?.bookableSessions ?? 1);

  return (
    <ScreenTemplate
      title={i18n.t('booking.slot.title')}
      subtitle={i18n.t('booking.slot.subtitleWithoutStaff')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <ReviewClassButton serviceId={serviceId} selectedSessions={selection.pickedClasses} />
      }
    >
      <StepProgress
        currentStep={BOOKING_STEP_COUNT}
        stepCount={BOOKING_STEP_COUNT}
        accessibilityLabel={i18n.t('booking.slot.stepLabel')}
      />
      <ClassSelectionFields selection={selection} />
      <PassBalanceNote serviceId={serviceId} pickedCount={selection.pickedClasses.length} />
    </ScreenTemplate>
  );
}

function BookClassContent({ serviceId }: Readonly<{ serviceId: string }>): React.JSX.Element {
  const sessions = useServiceSessions(serviceId, { shouldIncludeFull: true });

  if (sessions.isError) {
    return (
      <LoadErrorState
        title={i18n.t('booking.slot.errorTitle')}
        error={sessions.error}
        onRetry={() => void sessions.refetch()}
        isRetrying={sessions.isFetching}
      />
    );
  }
  if (sessions.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  const hasSchedule = sessions.data.isScheduled && sessions.data.nextOpenStartsAt !== null;
  if (!hasSchedule) return <NoScheduleYet />;
  return <ClassStep sessions={sessions.data} serviceId={serviceId} />;
}

/**
 * Día y clase: sin elegir profesor ni sala (los fija el centro). Se ofrecen solo los días y las
 * horas en que ese servicio se da de verdad, con plazas; si el centro aún no ha puesto horario,
 * se avisa.
 */
export function BookSlotScreen(): React.JSX.Element {
  const params = slotRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(client)/(tabs)/book" />;
  return <BookClassContent serviceId={params.data.serviceId} />;
}
