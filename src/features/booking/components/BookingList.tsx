import type { MyBookingsResponseDtoBookingsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { EmptyState } from '@/ui/molecules/EmptyState';

import type { BookingScope } from '../hooks/useMyBookings';
import { BookingCard } from './BookingCard';
import { BookingHistoryEmptyState } from './BookingHistoryEmptyState';

interface EmptyBookingsProps {
  scope: BookingScope;
  onBookAction: () => void;
}

function EmptyBookings({ scope, onBookAction }: Readonly<EmptyBookingsProps>): React.JSX.Element {
  if (scope === 'past') return <BookingHistoryEmptyState onBookAction={onBookAction} />;

  return (
    <EmptyState
      iconName="calendar"
      title={i18n.t('booking.list.emptyUpcomingTitle')}
      description={i18n.t('booking.list.emptyUpcomingDescription')}
      actionLabel={i18n.t('booking.list.bookAction')}
      onActionPress={onBookAction}
    />
  );
}

interface BookingListProps {
  scope: BookingScope;
  bookings: readonly MyBookingsResponseDtoBookingsItem[];
  onBookAction: () => void;
  onCancelRequest: (booking: MyBookingsResponseDtoBookingsItem) => void;
  onRescheduleRequest: (booking: MyBookingsResponseDtoBookingsItem) => void;
}

/** Las citas de una pestaña, o el vacío con su siguiente paso (agendar). */
export function BookingList({
  scope,
  bookings,
  onBookAction,
  onCancelRequest,
  onRescheduleRequest,
}: Readonly<BookingListProps>): React.JSX.Element {
  if (bookings.length === 0) return <EmptyBookings scope={scope} onBookAction={onBookAction} />;
  return (
    <>
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancelRequest={scope === 'upcoming' ? onCancelRequest : undefined}
          onRescheduleRequest={scope === 'upcoming' ? onRescheduleRequest : undefined}
        />
      ))}
    </>
  );
}
