import {
  buildBanknoteSerial,
  getServicePassBalance,
  useBanknoteWatermark,
  useMyPasses,
} from '@/features/passes';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format';
import { BanknoteCard } from '@/ui/organisms/BanknoteCard';

import { useMyBookings } from '../hooks/useMyBookings';

interface PassBalanceNoteProps {
  serviceId: string;
  /** Cuántas clases lleva elegidas ahora mismo. */
  pickedCount: number;
}

/**
 * El bono, abajo, como un billete: la cifra grande es una PREVISIÓN de las clases que le quedarían
 * si asiste a lo elegido, y baja con cada día que marca. El descuento real ocurre al asistir (o al
 * no ir sin cancelar), nunca al reservar. Sin bono que valga para el servicio, no se muestra.
 */
export function PassBalanceNote({
  serviceId,
  pickedCount,
}: Readonly<PassBalanceNoteProps>): React.JSX.Element | null {
  const watermark = useBanknoteWatermark();
  const passes = useMyPasses().data?.passes ?? [];
  const upcoming = useMyBookings('upcoming').data?.bookings ?? [];
  const balance = getServicePassBalance(passes, serviceId, upcoming);
  if (balance === null) return null;

  const remainingAfter = Math.max(balance.bookableSessions - pickedCount, 0);
  const detailLines = [
    i18n.t('booking.slot.passUsage', {
      total: balance.remainingSessions,
      booked: balance.reservedSessions,
    }),
    i18n.t('booking.slot.passPicked', { picked: pickedCount }),
    i18n.t('booking.slot.passForecastNote'),
    ...(balance.expiresAt === null
      ? []
      : [i18n.t('passes.expiresOn', { date: formatShortDate(balance.expiresAt) })]),
  ];

  return (
    <BanknoteCard
      title={balance.passName}
      valueText={String(remainingAfter)}
      unitText={i18n.t('booking.slot.passRemainingUnit')}
      detailLines={detailLines}
      serialText={buildBanknoteSerial(balance.passId)}
      stampText={i18n.t('booking.slot.passStamp')}
      watermark={watermark}
      accessibilityLabel={`${balance.passName}. ${i18n.t('booking.slot.passRemainingLabel', {
        count: remainingAfter,
      })}. ${detailLines.join('. ')}`}
    />
  );
}
