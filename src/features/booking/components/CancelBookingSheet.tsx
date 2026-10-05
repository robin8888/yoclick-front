import type { MyBookingsResponseDtoBookingsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

import { DEFAULT_CENTER_TIME_ZONE, formatBookingDayAndTime } from '../model/booking-labels';

interface CancelBookingSheetProps {
  /** La cita que se va a cancelar; `null` con la hoja cerrada. */
  booking: MyBookingsResponseDtoBookingsItem | null;
  isCancelling: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** «¿Cancelar esta cita?» con el servicio y la hora, antes de que el servidor decida. */
export function CancelBookingSheet({
  booking,
  isCancelling,
  onConfirm,
  onDismiss,
}: Readonly<CancelBookingSheetProps>): React.JSX.Element {
  const message =
    booking === null
      ? ''
      : i18n.t('booking.cancel.message', {
          serviceName: booking.service.name,
          whenLabel: formatBookingDayAndTime(booking.startsAt, DEFAULT_CENTER_TIME_ZONE),
        });

  return (
    <ConfirmSheet
      isVisible={booking !== null}
      title={i18n.t('booking.cancel.title')}
      message={message}
      confirmLabel={i18n.t('booking.cancel.confirmAction')}
      dismissLabel={i18n.t('booking.cancel.keepAction')}
      isDestructive
      isConfirming={isCancelling}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    />
  );
}
