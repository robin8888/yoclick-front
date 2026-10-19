import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';

import { ActingForSelector } from '@/features/guardians';
import { LoadErrorState } from '@/features/join';
import type { MyBookingsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { BookingList } from '../components/BookingList';
import { WaitlistBookingCards } from '../components/WaitlistBookingCards';
import { CancelBookingSheet } from '../components/CancelBookingSheet';
import { useBookingCancellation } from '../hooks/useBookingCancellation';
import { useMyBookings, type BookingScope } from '../hooks/useMyBookings';

const SCOPE_OPTIONS = [
  { value: 'upcoming', label: i18n.t('booking.list.upcoming') },
  { value: 'past', label: i18n.t('booking.list.past') },
] as const;

interface BookingsContentProps {
  scope: BookingScope;
  bookings: MyBookingsResponseDto['bookings'];
}

function buildRescheduleRoute(booking: MyBookingsResponseDto['bookings'][number]): Href {
  return {
    pathname: '/(client)/book/reschedule',
    params: {
      bookingId: booking.id,
      serviceId: booking.service.id,
      staffMembershipId: booking.staff.membershipId,
      serviceName: booking.service.name,
      startsAt: booking.startsAt,
    },
  };
}

/** La lista con su ciclo de cancelación (hoja de confirmación y mensajes de resultado). */
function BookingsContent({ scope, bookings }: Readonly<BookingsContentProps>): React.JSX.Element {
  const router = useRouter();
  const cancellation = useBookingCancellation();

  return (
    <>
      {cancellation.resultMessage === null ? null : (
        <FormErrorBanner tone="success" message={cancellation.resultMessage} />
      )}
      {cancellation.cancelErrorMessage === null ? null : (
        <FormErrorBanner message={cancellation.cancelErrorMessage} />
      )}
      <BookingList
        scope={scope}
        bookings={bookings}
        onBookAction={() => {
          router.push('/(client)/(tabs)/book');
        }}
        onCancelRequest={cancellation.askToCancel}
        onRescheduleRequest={(booking) => {
          router.push(buildRescheduleRoute(booking));
        }}
      />
      <WaitlistBookingCards scope={scope} />
      <CancelBookingSheet
        booking={cancellation.bookingToCancel}
        isCancelling={cancellation.isCancelling}
        onConfirm={cancellation.confirmCancellation}
        onDismiss={cancellation.dismiss}
      />
    </>
  );
}

function BookingsOutcome({ scope }: Readonly<{ scope: BookingScope }>): React.JSX.Element {
  const bookings = useMyBookings(scope);

  if (bookings.isError) {
    return (
      <LoadErrorState
        title={i18n.t('booking.list.errorTitle')}
        error={bookings.error}
        onRetry={() => void bookings.refetch()}
        isRetrying={bookings.isFetching}
      />
    );
  }
  if (bookings.data === undefined) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  return <BookingsContent scope={scope} bookings={bookings.data.bookings} />;
}

/** Prototipo `appts`: próximas e historial; cancelar con confirmación. */
export function MyBookingsScreen(): React.JSX.Element {
  const onBackPress = useBackAction();
  const [scope, setScope] = useState<BookingScope>('upcoming');

  return (
    <ScreenTemplate onBackPress={onBackPress} title={i18n.t('booking.list.title')}>
      <ActingForSelector />
      <SegmentedControl options={SCOPE_OPTIONS} selectedValue={scope} onValueChange={setScope} />
      <BookingsOutcome scope={scope} />
    </ScreenTemplate>
  );
}
