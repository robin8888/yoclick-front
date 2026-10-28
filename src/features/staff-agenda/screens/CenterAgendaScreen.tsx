import { useRouter } from 'expo-router';

import { formatLongDate } from '@/features/booking';
import { OverLimitBanner, PlanSummaryCard, SetupProgressCard } from '@/features/center-admin';
import { useActiveCenterModules, useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, hasRoomManagement, i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CenterAgendaHeader } from '../components/CenterAgendaHeader';
import { CenterQuickActions } from '../components/CenterQuickActions';
import { ScanAttendanceButton } from '../components/ScanAttendanceButton';
import { useAgendaDay } from '../hooks/useAgendaDay';

/** La agenda, asignar citas, salas y clases, servicios y bonos: los accesos del centro. */
function CenterActions({ isoDate }: Readonly<{ isoDate: string }>): React.JSX.Element {
  const router = useRouter();
  const sectorId = useActiveCenterSectorId();
  const modules = useActiveCenterModules();

  return (
    <CenterQuickActions
      canManageSpaces={hasRoomManagement(sectorId) && modules.rooms}
      hasPasses={modules.passes}
      sessionsWord={getSectorVocabulary(sectorId).session.plural}
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
      onTeamPress={() => {
        router.push('/(admin)/team');
      }}
      onPassesPress={() => {
        router.push('/(admin)/passes');
      }}
      onSetupGuidePress={() => {
        router.push('/(admin)/setup-guide');
      }}
      onMessagesPress={() => {
        router.push('/(admin)/messages');
      }}
      onVoiceReceptionistPress={() => {
        router.push('/(admin)/voice-receptionist');
      }}
    />
  );
}

/** «Inicio» del centro: cinco botones grandes y el escáner de asistencia; la agenda, aparte. */
export function CenterAgendaScreen(): React.JSX.Element {
  const day = useAgendaDay();
  const dayDate = `${day.isoDate}T12:00:00.000Z`;
  const title = i18n.t('staffAgenda.center.homeTitle');
  const hasAttendance = useActiveCenterModules().attendance;

  return (
    <ScreenTemplate isHeaderHidden title={title}>
      <CenterAgendaHeader
        dateLabel={formatLongDate(dayDate, 'UTC')}
        title={title}
        notificationsHref="/(admin)/(tabs)/notifications"
      />
      <PlanSummaryCard />
      <OverLimitBanner />
      <SetupProgressCard />
      <CenterActions isoDate={day.isoDate} />
      {hasAttendance ? <ScanAttendanceButton isCenterWide /> : null}
    </ScreenTemplate>
  );
}
