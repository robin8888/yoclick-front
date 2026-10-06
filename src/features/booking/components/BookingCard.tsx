import { useRouter } from 'expo-router';

import { useCheckInQrAvailability } from '@/features/attendance';
import type { MyBookingsResponseDtoBookingsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { AppointmentCard, type AppointmentButtonAction } from '@/ui/organisms/AppointmentCard';

import { buildBookingDateTileLabels, DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import { presentBookingStatus } from '../model/booking-status';
import { calculateDurationInMinutes } from '../model/home-labels';

type Booking = MyBookingsResponseDtoBookingsItem;

function buildCancelAction(booking: Booking, onCancelRequest: (booking: Booking) => void) {
  const action: AppointmentButtonAction = {
    label: i18n.t('booking.list.cancelAction'),
    accessibilityLabel: i18n.t('booking.list.cancelActionLabel', {
      serviceName: booking.service.name,
    }),
    variant: 'outline',
    onPress: () => {
      onCancelRequest(booking);
    },
  };
  return action;
}

function buildDetailsLabel(booking: Booking): string {
  return i18n.t('booking.list.detailsLine', {
    time: formatTime24h(booking.startsAt, DEFAULT_CENTER_TIME_ZONE),
    durationMinutes: calculateDurationInMinutes(booking.startsAt, booking.endsAt),
    staffName: booking.staff.fullName,
  });
}

interface BookingCardProps {
  booking: Booking;
  /** Solo las próximas y confirmadas se pueden cancelar. */
  onCancelRequest: ((booking: Booking) => void) | undefined;
}

/** Una cita de «Mis citas» con el estilo del prototipo `appts`. */
export function BookingCard({
  booking,
  onCancelRequest,
}: Readonly<BookingCardProps>): React.JSX.Element {
  const router = useRouter();
  const qrAvailability = useCheckInQrAvailability(booking);
  const presentation = presentBookingStatus(booking.status);
  const isActionable = presentation.canBeCancelled && onCancelRequest !== undefined;

  return (
    <AppointmentCard
      dateTile={buildBookingDateTileLabels(booking.startsAt, DEFAULT_CENTER_TIME_ZONE)}
      serviceName={booking.service.name}
      detailsLabel={buildDetailsLabel(booking)}
      statusLabel={i18n.t(`booking.list.status.${booking.status}`)}
      statusTone={presentation.tone}
      buttonActions={isActionable ? [buildCancelAction(booking, onCancelRequest)] : []}
      linkActions={
        isActionable
          ? [
              {
                label: i18n.t('booking.list.accessQrAction'),
                iconName: 'qrCode',
                isDisabled: qrAvailability?.isAvailable !== true,
                onPress: () => {
                  router.push('/(client)/access-qr');
                },
              },
            ]
          : []
      }
    />
  );
}
