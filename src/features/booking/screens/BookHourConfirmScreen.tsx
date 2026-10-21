import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { ProblemModal } from '@/ui/organisms/ProblemModal';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { BookingSummary } from '../components/BookingSummary';
import { useCenterServices } from '../hooks/useCenterServices';
import { useCreateHourBooking } from '../hooks/useCreateHourBooking';
import { DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import {
  confirmHourRouteParamsSchema,
  type ConfirmHourRouteParams,
} from '../model/hour-route-params';

function useConfirmHourBooking(params: ConfirmHourRouteParams): {
  confirmAndOpenDoneScreen: () => void;
  isCreating: boolean;
  createErrorMessage: string | null;
  clearError: () => void;
} {
  const router = useRouter();
  const booking = useCreateHourBooking({
    serviceId: params.serviceId,
    startsAt: params.startsAt,
    staffMembershipId: params.staffMembershipId,
  });

  return {
    confirmAndOpenDoneScreen: () => {
      booking.createHourBooking((createdBooking) => {
        router.replace({
          pathname: '/(client)/book/done',
          params: { bookingId: createdBooking.id },
        });
      });
    },
    isCreating: booking.isCreating,
    createErrorMessage: booking.createErrorMessage,
    clearError: booking.clearError,
  };
}

function BookHourConfirmContent({
  params,
}: Readonly<{ params: ConfirmHourRouteParams }>): React.JSX.Element {
  const router = useRouter();
  const booking = useConfirmHourBooking(params);
  const service = useCenterServices().data?.services.find(
    (candidate) => candidate.id === params.serviceId,
  );

  return (
    <ScreenTemplate
      title={i18n.t('booking.confirm.title')}
      isLoading={booking.isCreating}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <Button
          label={i18n.t('booking.confirm.confirmLabel')}
          isFullWidth
          isLoading={booking.isCreating}
          onPress={booking.confirmAndOpenDoneScreen}
        />
      }
    >
      <ProblemModal
        message={booking.createErrorMessage}
        onDismiss={booking.clearError}
        {...getProblemModalCopy()}
      />
      <BookingSummary
        serviceName={service?.name ?? ''}
        durationMinutes={service?.durationMinutes ?? null}
        priceCents={service?.priceCents ?? null}
        startsAt={params.startsAt}
        timeZone={DEFAULT_CENTER_TIME_ZONE}
        staffName={params.staffName}
      />
    </ScreenTemplate>
  );
}

/** Resumen antes de reservar una hora libre; los parámetros de la ruta se validan con zod. */
export function BookHourConfirmScreen(): React.JSX.Element {
  const params = confirmHourRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(client)/(tabs)/book" />;
  return <BookHourConfirmContent params={params.data} />;
}
