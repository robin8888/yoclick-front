import { useRouter } from 'expo-router';

import { CenterIdentityHeader, useActiveCenterSummary } from '@/features/auth';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { AppointmentCard } from '@/ui/organisms/AppointmentCard';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useMyBookings } from '../hooks/useMyBookings';
import { DEFAULT_CENTER_TIME_ZONE, formatBookingDayAndTime } from '../model/booking-labels';
import { presentBookingStatus } from '../model/booking-status';

function extractFirstName(fullName: string | undefined): string {
  return fullName?.trim().split(/\s+/)[0] ?? '';
}

/** Prototipo `home`: saludo, próxima cita y el acceso a agendar. */
export function ClientHomeScreen(): React.JSX.Element {
  const router = useRouter();
  const center = useActiveCenterSummary();
  const fullName = useSessionStore((state) => state.user?.fullName);
  const nextBooking = useMyBookings('upcoming').data?.bookings[0];

  return (
    <ScreenTemplate
      title={i18n.t('booking.home.greeting', { firstName: extractFirstName(fullName) })}
      isHeaderCentered
      headerAccessory={<CenterIdentityHeader centerName={center.name} logoUrl={center.logoUrl} />}
      footer={
        <Button
          label={i18n.t('booking.home.bookAction')}
          isFullWidth
          onPress={() => {
            router.push('/(client)/(tabs)/book');
          }}
        />
      }
    >
      <Text variant="titleMd">{i18n.t('booking.home.nextAppointment')}</Text>
      {nextBooking === undefined ? (
        <Text color="ink2">{i18n.t('booking.home.noNextAppointment')}</Text>
      ) : (
        <AppointmentCard
          serviceName={nextBooking.service.name}
          whenLabel={formatBookingDayAndTime(nextBooking.startsAt, DEFAULT_CENTER_TIME_ZONE)}
          staffLabel={i18n.t('booking.list.withStaff', { staffName: nextBooking.staff.fullName })}
          statusLabel={i18n.t(`booking.list.status.${nextBooking.status}`)}
          statusTone={presentBookingStatus(nextBooking.status).tone}
          actionLabel={i18n.t('booking.home.viewAllAction')}
          onActionPress={() => {
            router.push('/(client)/(tabs)/bookings');
          }}
        />
      )}
    </ScreenTemplate>
  );
}
