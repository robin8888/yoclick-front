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

function buildRescheduleAction(booking: Booking, onRescheduleRequest: (booking: Booking) => void) {
  const action: AppointmentButtonAction = {
    label: i18n.t('booking.list.rescheduleAction'),
    accessibilityLabel: i18n.t('booking.list.rescheduleActionLabel', {
      serviceName: booking.service.name,
    }),
    variant: 'outline',
    onPress: () => {
      onRescheduleRequest(booking);
    },
  };
  return action;
}

interface BookingRequests {
  onCancelRequest: (booking: Booking) => void;
  onRescheduleRequest: (booking: Booking) => void;
}

function buildButtonActions(booking: Booking, requests: BookingRequests) {
  return [
    buildRescheduleAction(booking, requests.onRescheduleRequest),
    buildCancelAction(booking, requests.onCancelRequest),
  ];
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
  /** Solo las próximas y confirmadas se pueden cambiar de hora. */
  onRescheduleRequest: ((booking: Booking) => void) | undefined;
}

/** Una cita de «Mis citas» con el estilo del prototipo `appts`. */
export function BookingCard({
  booking,
  onCancelRequest,
  onRescheduleRequest,
}: Readonly<BookingCardProps>): React.JSX.Element {
  const router = useRouter();
  const qrAvailability = useCheckInQrAvailability(booking);
  const presentation = presentBookingStatus(booking.status);
  const requests =
    onCancelRequest === undefined || onRescheduleRequest === undefined
      ? null
      : { onCancelRequest, onRescheduleRequest };
  const isActionable = presentation.canBeCancelled && requests !== null;

  return (
    <AppointmentCard
      dateTile={buildBookingDateTileLabels(booking.startsAt, DEFAULT_CENTER_TIME_ZONE)}
      serviceName={booking.service.name}
      detailsLabel={buildDetailsLabel(booking)}
      statusLabel={i18n.t(`booking.list.status.${booking.status}`)}
      statusTone={presentation.tone}
      buttonActions={requests !== null && isActionable ? buildButtonActions(booking, requests) : []}
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
