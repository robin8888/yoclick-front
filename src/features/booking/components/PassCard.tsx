import { useRouter } from 'expo-router';

import {
  countBookableSessions,
  pickHomePass,
  useBanknoteWatermark,
  useMyPasses,
} from '@/features/passes';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format';
import { BanknoteCard } from '@/ui/organisms/BanknoteCard';

import { useMyBookings } from '../hooks/useMyBookings';

const SERIAL_LENGTH = 6;

interface HomePassSummary {
  title: string;
  valueText: string;
  detailLines: string[];
  serialText: string;
  stampText: string;
  isUsable: boolean;
}

/**
 * Lo que cuenta el billete de inicio: el bono que se gastará antes y cuántas clases puede aún
 * agendar (las que le quedan menos las ya agendadas), o «sin bono».
 */
function useHomePassSummary(): HomePassSummary {
  const passes = useMyPasses().data?.passes ?? [];
  const upcoming = useMyBookings('upcoming').data?.bookings ?? [];
  const homePass = pickHomePass(passes);
  if (homePass === null) {
    return {
      title: i18n.t('booking.home.passTitle'),
      valueText: '0',
      detailLines: [i18n.t('booking.home.passEmpty')],
      serialText: 'Nº ——',
      stampText: i18n.t('passes.status.exhausted'),
      isUsable: false,
    };
  }
  const expiry =
    homePass.expiresAt === null
      ? []
      : [i18n.t('passes.expiresOn', { date: formatShortDate(homePass.expiresAt) })];
  return {
    title: homePass.name,
    valueText: String(countBookableSessions(passes, upcoming)),
    detailLines: [i18n.t('booking.home.passBookable'), ...expiry],
    serialText: `Nº ${homePass.id.replaceAll('-', '').slice(-SERIAL_LENGTH).toUpperCase()}`,
    stampText: i18n.t('passes.status.active'),
    isUsable: true,
  };
}

/** Tarjeta de bono del prototipo `home`, como un billete: lo que queda y acceso a «Mis bonos». */
export function PassCard(): React.JSX.Element {
  const router = useRouter();
  const summary = useHomePassSummary();
  const watermark = useBanknoteWatermark();
  const unit = i18n.t('passes.unit');

  return (
    <BanknoteCard
      title={summary.title}
      valueText={summary.valueText}
      unitText={unit}
      detailLines={summary.detailLines}
      serialText={summary.serialText}
      stampText={summary.stampText}
      watermark={watermark}
      tone={summary.isUsable ? 'active' : 'inactive'}
      accessibilityLabel={`${summary.title}. ${summary.valueText} ${unit}. ${summary.detailLines.join('. ')}`}
      onPress={() => {
        router.push('/(client)/my-passes');
      }}
    />
  );
}
