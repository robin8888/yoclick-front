import { useRouter } from 'expo-router';

import { formatLongDate } from '@/features/booking';
import { useActiveCenterSectorId } from '@/features/join';
import { hasRoomManagement, i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CenterAgendaHeader } from '../components/CenterAgendaHeader';
import { CenterQuickActions } from '../components/CenterQuickActions';
import { ScanAttendanceButton } from '../components/ScanAttendanceButton';
import { useAgendaDay } from '../hooks/useAgendaDay';

/** La agenda, asignar citas, salas y horarios, servicios y bonos: los accesos del centro. */
function CenterActions({ isoDate }: Readonly<{ isoDate: string }>): React.JSX.Element {
  const router = useRouter();
  const sectorId = useActiveCenterSectorId();

  return (
    <CenterQuickActions
      canManageSpaces={hasRoomManagement(sectorId)}
      onAgendaPress={() => {
        router.push('/(admin)/day-agenda');
      }}
      onAssignAppointmentPress={() => {
        router.push({ pathname: '/(admin)/new-appointment', params: { date: isoDate } });
      }}
      onManagementPress={() => {
        router.push('/(admin)/(tabs)/management');
      }}
      onServicesPress={() => {
        router.push('/(admin)/services');
      }}
      onPassesPress={() => {
        router.push('/(admin)/passes');
      }}
      onSetupGuidePress={() => {
        router.push('/(admin)/setup-guide');
      }}
    />
  );
}

/** «Inicio» del centro: cinco botones grandes y el escáner de asistencia; la agenda, aparte. */
export function CenterAgendaScreen(): React.JSX.Element {
  const day = useAgendaDay();
  const dayDate = `${day.isoDate}T12:00:00.000Z`;
  const title = i18n.t('staffAgenda.center.homeTitle');

  return (
    <ScreenTemplate isHeaderHidden title={title}>
      <CenterAgendaHeader
        dateLabel={formatLongDate(dayDate, 'UTC')}
        title={title}
        notificationsHref="/(admin)/(tabs)/notifications"
      />
      <CenterActions isoDate={day.isoDate} />
      <ScanAttendanceButton isCenterWide />
    </ScreenTemplate>
  );
}
