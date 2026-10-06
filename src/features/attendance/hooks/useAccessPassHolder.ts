import { useQuery } from '@tanstack/react-query';

import { useActiveCenterSummary } from '@/features/auth';
import { getBookingsListMineQueryOptions } from '@/shared/api/generated/endpoints/bookings/bookings';
import { getMeGetProfileQueryOptions } from '@/shared/api/generated/endpoints/me/me';
import { useSessionStore } from '@/shared/auth/session-store';

interface NextAppointmentSummary {
  serviceName: string;
  startsAt: string;
}

interface AccessPassHolder {
  fullName: string;
  centerName: string;
  nextAppointment: NextAppointmentSummary | undefined;
}

/** Quién enseña el QR y para qué cita: lo que la tarjeta de acceso muestra junto al código. */
export function useAccessPassHolder(): AccessPassHolder {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const sessionFullName = useSessionStore((state) => state.user?.fullName);
  const profile = useQuery(getMeGetProfileQueryOptions());
  const center = useActiveCenterSummary();
  const upcomingBookings = useQuery(
    getBookingsListMineQueryOptions(
      centerId,
      { scope: 'upcoming' },
      { query: { enabled: centerId !== '' } },
    ),
  );
  const nextBooking = upcomingBookings.data?.bookings[0];

  return {
    fullName: sessionFullName ?? profile.data?.fullName ?? '',
    centerName: center.name,
    nextAppointment:
      nextBooking === undefined
        ? undefined
        : { serviceName: nextBooking.service.name, startsAt: nextBooking.startsAt },
  };
}
