import { DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import { countSessionsInCurrentWeek } from '../model/weekly-progress';
import { useMyBookings } from './useMyBookings';

/** Sesiones a las que la persona asistió esta semana (lunes a domingo, hora del centro). */
export function useAttendedThisWeek(): number {
  const pastBookings = useMyBookings('past').data?.bookings ?? [];
  const attendedStartTimes = pastBookings
    .filter((booking) => booking.status === 'attended')
    .map((booking) => booking.startsAt);
  return countSessionsInCurrentWeek(attendedStartTimes, new Date(), DEFAULT_CENTER_TIME_ZONE);
}
