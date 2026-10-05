import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { IconBadge } from '@/ui/atoms/IconBadge';
import { Text } from '@/ui/atoms/Text';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useMyBookings } from '../hooks/useMyBookings';
import { DEFAULT_CENTER_TIME_ZONE, formatBookingDayAndTime } from '../model/booking-labels';
import { bookedRouteParamsSchema } from '../model/booking-route-params';

interface BookedSummary {
  serviceName: string;
  whenLabel: string;
}

/** La cita recién creada, leída de la lista de próximas (que se recarga al reservar). */
function useBookedSummary(bookingId: string): BookedSummary | null {
  const booking = useMyBookings('upcoming').data?.bookings.find(
    (candidate) => candidate.id === bookingId,
  );
  if (booking === undefined) return null;
  return {
    serviceName: booking.service.name,
    whenLabel: formatBookingDayAndTime(booking.startsAt, DEFAULT_CENTER_TIME_ZONE),
  };
}

function BookedFooter(): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      <Button
        label={i18n.t('booking.done.viewBookingsAction')}
        isFullWidth
        onPress={() => {
          router.replace('/(client)/(tabs)/bookings');
        }}
      />
      <Button
        variant="ghost"
        label={i18n.t('booking.done.doneAction')}
        isFullWidth
        onPress={() => {
          router.replace('/(client)/(tabs)/home');
        }}
      />
    </>
  );
}

function BookedContent({ bookingId }: Readonly<{ bookingId: string }>): React.JSX.Element {
  const summary = useBookedSummary(bookingId);
  const whenLabel = summary?.whenLabel;

  // Anuncia la confirmación una sola vez cuando se conoce la hora (CLAUDE.md › Accesibilidad).
  useEffect(() => {
    if (whenLabel !== undefined) {
      AccessibilityInfo.announceForAccessibility(
        i18n.t('booking.done.announcement', { whenLabel }),
      );
    }
  }, [whenLabel]);

  return (
    <ScreenTemplate
      title={i18n.t('booking.done.title')}
      isHeaderCentered
      headerAccessory={<IconBadge iconName="checkCircle" />}
      footer={<BookedFooter />}
    >
      {summary === null ? null : (
        <Text variant="titleMd" align="center">
          {i18n.t('booking.done.summary', {
            serviceName: summary.serviceName,
            whenLabel: summary.whenLabel,
          })}
        </Text>
      )}
    </ScreenTemplate>
  );
}

/** Prototipo `booked`: la cita queda confirmada y se anuncia a los lectores de pantalla. */
export function BookedScreen(): React.JSX.Element {
  const params = bookedRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(client)/(tabs)/home" />;
  return <BookedContent bookingId={params.data.bookingId} />;
}
