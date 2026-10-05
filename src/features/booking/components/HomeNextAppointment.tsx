import type { MyBookingsResponseDtoBookingsItem } from '@/shared/api/generated/model';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';

import { DEFAULT_CENTER_TIME_ZONE, formatServiceDuration } from '../model/booking-labels';
import { calculateDurationInMinutes } from '../model/home-labels';
import { NextAppointmentHero, NoAppointmentHero } from './NextAppointmentHero';

interface HomeNextAppointmentProps {
  nextBooking: MyBookingsResponseDtoBookingsItem | undefined;
  onBookAction: () => void;
}

/** La tarjeta principal del inicio: la próxima cita o la invitación a reservar. */
export function HomeNextAppointment({
  nextBooking,
  onBookAction,
}: Readonly<HomeNextAppointmentProps>): React.JSX.Element {
  if (nextBooking === undefined) return <NoAppointmentHero onBookAction={onBookAction} />;
  const { startsAt, endsAt } = nextBooking;
  const time = formatTime24h(startsAt, DEFAULT_CENTER_TIME_ZONE);
  const duration = formatServiceDuration(calculateDurationInMinutes(startsAt, endsAt));

  return (
    <NextAppointmentHero
      serviceName={nextBooking.service.name}
      staffName={nextBooking.staff.fullName}
      dateLabel={formatShortDate(startsAt, DEFAULT_CENTER_TIME_ZONE)}
      timeAndDurationLabel={`${time} · ${duration}`}
    />
  );
}
