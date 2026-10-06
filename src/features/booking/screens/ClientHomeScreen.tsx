import { useRouter } from 'expo-router';

import { useActiveCenterSummary } from '@/features/auth';
import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { HomeHeader } from '../components/HomeHeader';
import { HomeNextAppointment } from '../components/HomeNextAppointment';
import { HomeShortcuts } from '../components/HomeShortcuts';
import { WeeklyProgressCard } from '../components/WeeklyProgressCard';
import { useAttendedThisWeek } from '../hooks/useAttendedThisWeek';
import { useClientFullName } from '../hooks/useClientFullName';
import { useMyBookings } from '../hooks/useMyBookings';
import { DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import { extractFirstName, formatLongDate } from '../model/home-labels';
import { WEEKLY_GOAL_SESSION_COUNT } from '../model/weekly-progress';

/** Prototipo `home`: saludo, próxima cita sobre el color del centro, semana y accesos rápidos. */
export function ClientHomeScreen(): React.JSX.Element {
  const router = useRouter();
  const center = useActiveCenterSummary();
  const fullName = useClientFullName();
  const nextBooking = useMyBookings('upcoming').data?.bookings[0];
  const attendedThisWeek = useAttendedThisWeek();

  const openBookTab = (): void => {
    router.push('/(client)/(tabs)/book');
  };

  return (
    <ScreenTemplate
      isHeaderHidden
      title={i18n.t('booking.home.title', { centerName: center.name })}
    >
      <HomeHeader
        centerName={center.name}
        centerLogoUrl={resolveApiAssetUrl(center.logoUrl)}
        dateLabel={formatLongDate(new Date(), DEFAULT_CENTER_TIME_ZONE)}
        greeting={i18n.t('booking.home.greeting', { firstName: extractFirstName(fullName) })}
        fullName={fullName}
      />
      <HomeNextAppointment nextBooking={nextBooking} onBookAction={openBookTab} />
      <WeeklyProgressCard completedCount={attendedThisWeek} goalCount={WEEKLY_GOAL_SESSION_COUNT} />
      <HomeShortcuts nextBooking={nextBooking} />
    </ScreenTemplate>
  );
}
