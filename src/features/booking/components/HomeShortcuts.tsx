import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

import { PassCard } from './PassCard';
import { QuickAccessGrid } from './QuickAccessGrid';

/** Bajo la próxima cita: «Mi QR de acceso», el bono y los accesos rápidos del prototipo `home`. */
export function HomeShortcuts(): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      <Button
        variant="secondary"
        leadingIconName="qrCode"
        label={i18n.t('booking.home.accessQrAction')}
        isFullWidth
        onPress={() => {
          router.push('/(client)/access-qr');
        }}
      />
      <PassCard />
      <QuickAccessGrid
        onBookPress={() => {
          router.push('/(client)/(tabs)/book');
        }}
        onBookingsPress={() => {
          router.push('/(client)/(tabs)/bookings');
        }}
      />
    </>
  );
}
