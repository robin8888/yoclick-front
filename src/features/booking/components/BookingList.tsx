import type { MyBookingsResponseDtoBookingsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { AppointmentCard } from '@/ui/organisms/AppointmentCard';

import type { BookingScope } from '../hooks/useMyBookings';
import { DEFAULT_CENTER_TIME_ZONE, formatBookingDayAndTime } from '../model/booking-labels';
import { presentBookingStatus } from '../model/booking-status';

interface EmptyBookingsProps {
  scope: BookingScope;
  onBookAction: () => void;
}

function EmptyBookings({ scope, onBookAction }: Readonly<EmptyBookingsProps>): React.JSX.Element {
  const isUpcoming = scope === 'upcoming';
  const titleKey = isUpcoming ? 'booking.list.emptyUpcomingTitle' : 'booking.list.emptyPastTitle';
  const descriptionKey = isUpcoming
    ? 'booking.list.emptyUpcomingDescription'
    : 'booking.list.emptyPastDescription';

  return (
    <EmptyState
      iconName="calendar"
      title={i18n.t(titleKey)}
      description={i18n.t(descriptionKey)}
      actionLabel={i18n.t('booking.list.bookAction')}
      onActionPress={onBookAction}
    />
  );
}

interface BookingCardProps {
  booking: MyBookingsResponseDtoBookingsItem;
  /** Solo las próximas y confirmadas se pueden cancelar. */
  onCancelRequest: ((booking: MyBookingsResponseDtoBookingsItem) => void) | undefined;
}

function BookingCard({ booking, onCancelRequest }: Readonly<BookingCardProps>): React.JSX.Element {
  const presentation = presentBookingStatus(booking.status);
  const canCancel = presentation.canBeCancelled && onCancelRequest !== undefined;

  return (
    <AppointmentCard
      serviceName={booking.service.name}
      whenLabel={formatBookingDayAndTime(booking.startsAt, DEFAULT_CENTER_TIME_ZONE)}
      staffLabel={i18n.t('booking.list.withStaff', { staffName: booking.staff.fullName })}
      statusLabel={i18n.t(`booking.list.status.${booking.status}`)}
      statusTone={presentation.tone}
      actionLabel={canCancel ? i18n.t('booking.list.cancelAction') : undefined}
      onActionPress={
        canCancel
          ? () => {
              onCancelRequest(booking);
            }
          : undefined
      }
    />
  );
}

interface BookingListProps {
  scope: BookingScope;
  bookings: readonly MyBookingsResponseDtoBookingsItem[];
  onBookAction: () => void;
  onCancelRequest: (booking: MyBookingsResponseDtoBookingsItem) => void;
}

/** Las citas de una pestaña, o el vacío con su siguiente paso (agendar). */
export function BookingList({
  scope,
  bookings,
  onBookAction,
  onCancelRequest,
}: Readonly<BookingListProps>): React.JSX.Element {
  if (bookings.length === 0) return <EmptyBookings scope={scope} onBookAction={onBookAction} />;
  return (
    <>
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancelRequest={scope === 'upcoming' ? onCancelRequest : undefined}
        />
      ))}
    </>
  );
}
