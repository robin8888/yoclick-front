import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { BookingSummary } from '../components/BookingSummary';
import { BookingFailureModals } from '../components/BookingFailureModals';
import { useCenterServices } from '../hooks/useCenterServices';
import { useCreateBookings } from '../hooks/useCreateBookings';
import { DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import {
  confirmBookingRouteParamsSchema,
  type ConfirmBookingRouteParams,
} from '../model/booking-route-params';

function useConfirmBooking(params: ConfirmBookingRouteParams): {
  createAndOpenDoneScreen: () => void;
  isCreating: boolean;
  createErrorMessage: string | null;
  isPassNeeded: boolean;
  clearError: () => void;
} {
  const router = useRouter();
  const bookings = useCreateBookings({
    serviceId: params.serviceId,
    classSessionIds: params.classes.map(({ id }) => id),
  });

  return {
    createAndOpenDoneScreen: () => {
      bookings.createBookings((createdBookings) => {
        const [onlyBooking] = createdBookings;
        // Una clase: su pantalla de «reservada». Varias: la lista de Mis citas, con todas.
        if (createdBookings.length === 1 && onlyBooking !== undefined) {
          router.replace({
            pathname: '/(client)/book/done',
            params: { bookingId: onlyBooking.id },
          });
          return;
        }
        router.replace('/(client)/(tabs)/bookings');
      });
    },
    isCreating: bookings.isCreating,
    createErrorMessage: bookings.createErrorMessage,
    isPassNeeded: bookings.isPassNeeded,
    clearError: bookings.clearError,
  };
}

/** Un resumen por clase elegida, con el servicio y su precio. */
function ChosenClassSummaries({
  params,
}: Readonly<{ params: ConfirmBookingRouteParams }>): React.JSX.Element {
  const service = useCenterServices().data?.services.find(
    (candidate) => candidate.id === params.serviceId,
  );

  return (
    <>
      {params.classes.map((chosenClass) => (
        <BookingSummary
          key={chosenClass.id}
          serviceName={service?.name ?? ''}
          durationMinutes={service?.durationMinutes ?? null}
          priceCents={service?.priceCents ?? null}
          startsAt={chosenClass.startsAt}
          timeZone={DEFAULT_CENTER_TIME_ZONE}
          staffName={chosenClass.staffName}
        />
      ))}
    </>
  );
}

function BookConfirmContent({
  params,
}: Readonly<{ params: ConfirmBookingRouteParams }>): React.JSX.Element {
  const router = useRouter();
  const confirmation = useConfirmBooking(params);
  const isMany = params.classes.length > 1;

  return (
    <ScreenTemplate
      title={i18n.t('booking.confirm.title')}
      isLoading={confirmation.isCreating}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <Button
          label={
            isMany
              ? i18n.t('booking.confirm.confirmManyLabel', { count: params.classes.length })
              : i18n.t('booking.confirm.confirmLabel')
          }
          isFullWidth
          isLoading={confirmation.isCreating}
          onPress={confirmation.createAndOpenDoneScreen}
        />
      }
    >
      <BookingFailureModals
        createErrorMessage={confirmation.createErrorMessage}
        isPassNeeded={confirmation.isPassNeeded}
        onDismiss={confirmation.clearError}
      />
      <ChosenClassSummaries params={params} />
    </ScreenTemplate>
  );
}

/** Prototipo `book4`: resumen antes de reservar. Los parámetros de la ruta se validan con zod. */
export function BookConfirmScreen(): React.JSX.Element {
  const params = confirmBookingRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(client)/(tabs)/book" />;
  return <BookConfirmContent params={params.data} />;
}
