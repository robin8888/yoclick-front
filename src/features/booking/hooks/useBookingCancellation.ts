import { useState } from 'react';

import type { MyBookingsResponseDtoBookingsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';

import { useCancelBooking } from './useCancelBooking';

interface BookingCancellation {
  /** La cita que se está a punto de cancelar; `null` con la hoja cerrada. */
  bookingToCancel: MyBookingsResponseDtoBookingsItem | null;
  isCancelling: boolean;
  cancelErrorMessage: string | null;
  /** Resultado de la última cancelación, para avisar si fue fuera de plazo. */
  resultMessage: string | null;
  askToCancel: (booking: MyBookingsResponseDtoBookingsItem) => void;
  dismiss: () => void;
  confirmCancellation: () => void;
}

/** El ciclo de «Cancelar cita»: preguntar, esperar al servidor y decir cómo ha ido. */
export function useBookingCancellation(): BookingCancellation {
  const [bookingToCancel, setBookingToCancel] = useState<MyBookingsResponseDtoBookingsItem | null>(
    null,
  );
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const { cancelBooking, isCancelling, cancelErrorMessage } = useCancelBooking();

  return {
    bookingToCancel,
    isCancelling,
    cancelErrorMessage,
    resultMessage,
    askToCancel: (booking) => {
      setResultMessage(null);
      setBookingToCancel(booking);
    },
    dismiss: () => {
      setBookingToCancel(null);
    },
    confirmCancellation: () => {
      if (bookingToCancel === null) return;
      cancelBooking(bookingToCancel.id, (result) => {
        setBookingToCancel(null);
        setResultMessage(
          result.withinPolicy
            ? i18n.t('booking.cancel.resultOnTime')
            : i18n.t('booking.cancel.resultLate'),
        );
      });
    },
  };
}
