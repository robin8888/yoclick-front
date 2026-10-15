import { GenerateAccessQrButton } from '@/features/attendance';
import type { MyBookingsResponseDtoBookingsItem } from '@/shared/api/generated/model';

import { DEFAULT_CENTER_TIME_ZONE } from '../model/booking-labels';
import { ClientQuickActions } from './ClientQuickActions';

interface HomeShortcutsProps {
  nextBooking: MyBookingsResponseDtoBookingsItem | undefined;
}

/** Bajo la próxima cita: el QR de asistencia y los accesos rápidos (el bono actual está en «Mis bonos») del prototipo `home`. */
export function HomeShortcuts({ nextBooking }: Readonly<HomeShortcutsProps>): React.JSX.Element {
  return (
    <>
      <GenerateAccessQrButton nextAppointment={nextBooking} timeZone={DEFAULT_CENTER_TIME_ZONE} />
      <ClientQuickActions />
    </>
  );
}
