import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { AccessibilityInfo } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { ServiceSessionsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { ProblemModal } from '@/ui/organisms/ProblemModal';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ClassChoiceFields } from '../components/ClassChoiceFields';
import { NoScheduleYet } from '../components/NoScheduleYet';
import { useClassChoice } from '../hooks/useClassChoice';
import { useRescheduleBooking } from '../hooks/useRescheduleBooking';
import { useServiceSessions } from '../hooks/useServiceSessions';
import { DEFAULT_CENTER_TIME_ZONE, formatBookingDayAndTime } from '../model/booking-labels';
import {
  rescheduleRouteParamsSchema,
  type RescheduleRouteParams,
} from '../model/booking-route-params';

function buildSubtitle(params: RescheduleRouteParams): string {
  return i18n.t('booking.reschedule.subtitle', {
    serviceName: params.serviceName,
    whenLabel: formatBookingDayAndTime(params.startsAt, DEFAULT_CENTER_TIME_ZONE),
  });
}

interface MoveStepProps {
  params: RescheduleRouteParams;
  sessions: ServiceSessionsResponseDto;
}

/** Pide el cambio al servidor y, cuando lo confirma, vuelve a «Mis citas» anunciándolo. */
function useMoveToClass(params: RescheduleRouteParams, classSessionId: string | undefined) {
  const router = useRouter();
  const reschedule = useRescheduleBooking();

  return {
    ...reschedule,
    confirmMove: () => {
      if (classSessionId === undefined) return;
      reschedule.rescheduleBooking(
        { bookingId: params.bookingId, serviceId: params.serviceId, classSessionId },
        () => {
          AccessibilityInfo.announceForAccessibility(i18n.t('booking.reschedule.announcement'));
          router.dismissTo('/(client)/(tabs)/bookings');
        },
      );
    },
  };
}

/** Elegir otra clase con plazas del mismo servicio y pasar a ella la reserva. */
function MoveStep({ params, sessions }: Readonly<MoveStepProps>): React.JSX.Element {
  const router = useRouter();
  const choice = useClassChoice(sessions);
  const move = useMoveToClass(params, choice.selectedClass?.id);

  return (
    <ScreenTemplate
      title={i18n.t('booking.reschedule.title')}
      subtitle={buildSubtitle(params)}
      isLoading={move.isRescheduling}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <Button
          label={i18n.t('booking.reschedule.confirmLabel')}
          isFullWidth
          isDisabled={choice.selectedClass === null}
          isLoading={move.isRescheduling}
          onPress={move.confirmMove}
        />
      }
    >
      <ProblemModal
        message={move.rescheduleErrorMessage}
        onDismiss={move.clearError}
        {...getProblemModalCopy()}
      />
      <ClassChoiceFields choice={choice} />
    </ScreenTemplate>
  );
}

function RescheduleBookingContent({
  params,
}: Readonly<{ params: RescheduleRouteParams }>): React.JSX.Element {
  const sessions = useServiceSessions(params.serviceId);

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
  if (!sessions.data.isScheduled) return <NoScheduleYet />;
  return <MoveStep params={params} sessions={sessions.data} />;
}

/** Cambiar una cita de clase: mismas clases con plazas que al reservar, con confirmación directa. */
export function RescheduleBookingScreen(): React.JSX.Element {
  const params = rescheduleRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(client)/(tabs)/bookings" />;
  return <RescheduleBookingContent params={params.data} />;
}
