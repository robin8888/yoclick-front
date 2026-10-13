import type { BadgeTone } from '@/ui/atoms/Badge';

export type BookingStatus = 'confirmed' | 'cancelled' | 'attended' | 'no_show';

interface BookingStatusPresentation {
  readonly tone: BadgeTone;
  /** Se puede cancelar mientras siga confirmada y no haya empezado; lo decide la API al pedirlo. */
  readonly canBeCancelled: boolean;
}

/** Lo que ve la persona: el estado de la API o «ya pasada» si su hora quedó atrás sin registrarse. */
export type BookingDisplayStatus = BookingStatus | 'past';

const STATUS_PRESENTATION: Readonly<Record<BookingDisplayStatus, BookingStatusPresentation>> = {
  past: { tone: 'neutral', canBeCancelled: false },
  confirmed: { tone: 'success', canBeCancelled: true },
  cancelled: { tone: 'neutral', canBeCancelled: false },
  attended: { tone: 'info', canBeCancelled: false },
  no_show: { tone: 'warning', canBeCancelled: false },
};

/** Una cita confirmada cuya hora de fin ya pasó no está «Confirmada»: ya pasó. */
export function resolveBookingDisplayStatus(
  booking: { status: BookingStatus; endsAt: string },
  now: Date,
): BookingDisplayStatus {
  const hasEnded = new Date(booking.endsAt).getTime() <= now.getTime();
  return booking.status === 'confirmed' && hasEnded ? 'past' : booking.status;
}

export function presentBookingStatus(status: BookingDisplayStatus): BookingStatusPresentation {
  return STATUS_PRESENTATION[status];
}
