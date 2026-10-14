import { View } from 'react-native';

import {
  buildBanknoteSerial,
  getServicePassBalance,
  useBanknoteWatermark,
  useMyPasses,
} from '@/features/passes';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { BanknoteCard } from '@/ui/organisms/BanknoteCard';

import { useMyBookings } from '../hooks/useMyBookings';

interface PassBalanceNoteProps {
  serviceId: string;
  /** Cuántas clases lleva elegidas ahora mismo. */
  pickedCount: number;
}

type ServicePassBalance = NonNullable<ReturnType<typeof getServicePassBalance>>;

/** Dentro del billete, como en los demás: solo cuándo caduca. */
function buildCardDetailLines(balance: ServicePassBalance): string[] {
  if (balance.expiresAt === null) return [];
  return [i18n.t('passes.expiresOn', { date: formatShortDate(balance.expiresAt) })];
}

/**
 * Debajo del billete, las cuentas: las clases que tiene, las que ya agendó, las que elige ahora y
 * cuántas le quedarían por agendar. La cifra del billete es siempre su saldo real.
 */
function buildUsageLines(balance: ServicePassBalance, pickedCount: number): string[] {
  const left = Math.max(balance.bookableSessions - pickedCount, 0);
  return [
    i18n.t('booking.slot.passUsage', {
      total: balance.remainingSessions,
      booked: balance.reservedSessions,
    }),
    i18n.t('booking.slot.passPicked', { picked: pickedCount }),
    i18n.t('booking.slot.passForecast', { left }),
    i18n.t('booking.slot.passForecastNote'),
  ];
}

/**
 * El bono, abajo, como un billete: la cifra grande es su saldo real (el mismo que en «Mis bonos») y
 * dentro lleva la caducidad. Debajo, las cuentas: agendadas, elegidas y la previsión por agendar.
 * El descuento real ocurre al asistir (o al no ir sin cancelar), nunca al reservar. Sin bono que valga para el servicio, no se muestra.
 */
export function PassBalanceNote({
  serviceId,
  pickedCount,
}: Readonly<PassBalanceNoteProps>): React.JSX.Element | null {
  const theme = useTheme();
  const watermark = useBanknoteWatermark();
  const passes = useMyPasses().data?.passes ?? [];
  const upcoming = useMyBookings('upcoming').data?.bookings ?? [];
  const balance = getServicePassBalance(passes, serviceId, upcoming);
  if (balance === null) return null;

  const usageLines = buildUsageLines(balance, pickedCount);
  const cardDetailLines = buildCardDetailLines(balance);

  return (
    <View style={{ gap: theme.space[2] }}>
      <BanknoteCard
        title={balance.passName}
        valueText={String(balance.remainingSessions)}
        unitText={i18n.t('booking.slot.passClassesUnit')}
        detailLines={cardDetailLines}
        serialText={buildBanknoteSerial(balance.passId)}
        stampText={i18n.t('booking.slot.passStamp')}
        watermark={watermark}
        accessibilityLabel={`${balance.passName}. ${i18n.t('booking.slot.passRemainingLabel', {
          count: balance.remainingSessions,
        })}. ${cardDetailLines.join('. ')}`}
      />
      {usageLines.map((line) => (
        <Text key={line} variant="caption" color="ink2">
          {line}
        </Text>
      ))}
    </View>
  );
}
