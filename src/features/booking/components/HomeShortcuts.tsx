import { useRouter } from 'expo-router';

import { GenerateAccessQrButton } from '@/features/attendance';
import type { MyBookingsResponseDtoBookingsItem } from '@/shared/api/generated/model';

import { DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import { PassCard } from './PassCard';
import { QuickAccessGrid } from './QuickAccessGrid';

interface HomeShortcutsProps {
  nextBooking: MyBookingsResponseDtoBookingsItem | undefined;
}

/** Bajo la próxima cita: el QR de asistencia, el bono y los accesos rápidos del prototipo `home`. */
export function HomeShortcuts({ nextBooking }: Readonly<HomeShortcutsProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <>
      <GenerateAccessQrButton nextAppointment={nextBooking} timeZone={DEFAULT_CENTER_TIME_ZONE} />
      <PassCard />
      <QuickAccessGrid
        onBookPress={() => {
          router.push('/(client)/(tabs)/book');
        }}
        onBookingsPress={() => {
          router.push('/(client)/(tabs)/bookings');
        }}
        onTeamPress={() => {
          router.push('/(client)/team');
        }}
      />
    </>
  );
}
