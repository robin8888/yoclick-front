import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { BookingSummary } from '../components/BookingSummary';
import { useCenterServices } from '../hooks/useCenterServices';
import { useCreateBooking } from '../hooks/useCreateBooking';
import { DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import {
  confirmBookingRouteParamsSchema,
  type ConfirmBookingRouteParams,
} from '../model/booking-route-params';

function useConfirmBooking(params: ConfirmBookingRouteParams): {
  createAndOpenDoneScreen: () => void;
  isCreating: boolean;
  createErrorMessage: string | null;
} {
  const router = useRouter();
  const booking = useCreateBooking({
    serviceId: params.serviceId,
    startsAt: params.startsAt,
    staffMembershipId: params.staffMembershipId,
  });

  return {
    createAndOpenDoneScreen: () => {
      booking.createBooking((createdBooking) => {
        router.replace({
          pathname: '/(client)/book/done',
          params: { bookingId: createdBooking.id },
        });
      });
    },
    isCreating: booking.isCreating,
    createErrorMessage: booking.createErrorMessage,
  };
}

function BookConfirmContent({
  params,
}: Readonly<{ params: ConfirmBookingRouteParams }>): React.JSX.Element {
  const router = useRouter();
  const confirmation = useConfirmBooking(params);
  const service = useCenterServices().data?.services.find(
    (candidate) => candidate.id === params.serviceId,
  );

  return (
    <ScreenTemplate
      title={i18n.t('booking.confirm.title')}
      isLoading={confirmation.isCreating}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <Button
          label={i18n.t('booking.confirm.confirmLabel')}
          isFullWidth
          isLoading={confirmation.isCreating}
          onPress={confirmation.createAndOpenDoneScreen}
        />
      }
    >
      {confirmation.createErrorMessage === null ? null : (
        <FormErrorBanner message={confirmation.createErrorMessage} />
      )}
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

/** Prototipo `book4`: resumen antes de reservar. Los parámetros de la ruta se validan con zod. */
export function BookConfirmScreen(): React.JSX.Element {
  const params = confirmBookingRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(client)/(tabs)/book" />;
  return <BookConfirmContent params={params.data} />;
}
