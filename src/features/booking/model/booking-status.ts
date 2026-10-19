import type { BadgeTone } from '@/ui/atoms/Badge';

export type BookingStatus = 'confirmed' | 'cancelled' | 'attended' | 'no_show';

interface BookingStatusPresentation {
  readonly tone: BadgeTone;
  /** Se puede cancelar mientras siga confirmada y no haya empezado; lo decide la API al pedirlo. */
  readonly canBeCancelled: boolean;
}

/** Lo que ve la persona: el estado de la API o «ya pasada» si su hora quedó atrás sin registrarse. */
export type BookingDisplayStatus = BookingStatus | 'past' | 'needs_new_pass';

const STATUS_PRESENTATION: Readonly<Record<BookingDisplayStatus, BookingStatusPresentation>> = {
  past: { tone: 'neutral', canBeCancelled: false },
  confirmed: { tone: 'success', canBeCancelled: true },
  // Se conserva la cita (se puede cancelar o mover), pero no se atiende hasta tener un bono nuevo.
  needs_new_pass: { tone: 'warning', canBeCancelled: true },
  cancelled: { tone: 'neutral', canBeCancelled: false },
  attended: { tone: 'info', canBeCancelled: false },
  no_show: { tone: 'warning', canBeCancelled: false },
};

/** Una cita confirmada cuya hora de fin ya pasó no está «Confirmada»: ya pasó. */
export function resolveBookingDisplayStatus(
  booking: { status: BookingStatus; endsAt: string; needsNewPass?: boolean },
  now: Date,
): BookingDisplayStatus {
  if (booking.status !== 'confirmed') return booking.status;
  const hasEnded = new Date(booking.endsAt).getTime() <= now.getTime();
  if (hasEnded) return 'past';
  return booking.needsNewPass === true ? 'needs_new_pass' : booking.status;
}

export function presentBookingStatus(status: BookingDisplayStatus): BookingStatusPresentation {
  return STATUS_PRESENTATION[status];
}
