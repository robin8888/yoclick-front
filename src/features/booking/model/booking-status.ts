import type { BadgeTone } from '@/ui/atoms/Badge';

export type BookingStatus = 'confirmed' | 'cancelled' | 'attended' | 'no_show';

interface BookingStatusPresentation {
  readonly tone: BadgeTone;
  /** Se puede cancelar mientras siga confirmada y no haya empezado; lo decide la API al pedirlo. */
  readonly canBeCancelled: boolean;
}

const STATUS_PRESENTATION: Readonly<Record<BookingStatus, BookingStatusPresentation>> = {
  confirmed: { tone: 'success', canBeCancelled: true },
  cancelled: { tone: 'neutral', canBeCancelled: false },
  attended: { tone: 'info', canBeCancelled: false },
  no_show: { tone: 'warning', canBeCancelled: false },
};

export function presentBookingStatus(status: BookingStatus): BookingStatusPresentation {
  return STATUS_PRESENTATION[status];
}
