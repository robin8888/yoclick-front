import { GenerateAccessQrButton } from '@/features/attendance';
import type { MyBookingsResponseDtoBookingsItem } from '@/shared/api/generated/model';

import { DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import { PassCard } from './PassCard';
import { ClientQuickActions } from './ClientQuickActions';

interface HomeShortcutsProps {
  nextBooking: MyBookingsResponseDtoBookingsItem | undefined;
}

/** Bajo la próxima cita: el QR de asistencia, el bono y los accesos rápidos del prototipo `home`. */
export function HomeShortcuts({ nextBooking }: Readonly<HomeShortcutsProps>): React.JSX.Element {
  return (
    <>
      <GenerateAccessQrButton nextAppointment={nextBooking} timeZone={DEFAULT_CENTER_TIME_ZONE} />
      <PassCard />
      <ClientQuickActions />
    </>
  );
}
