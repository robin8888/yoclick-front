import { i18n } from '@/shared/i18n';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ManagementActions } from '../components/ManagementActions';
import { RoomBlocksManagementSection } from '../components/RoomBlocksManagementSection';
import { RoomsManagementSection } from '../components/RoomsManagementSection';
import { ScheduleWeekSection } from '../components/ScheduleWeekSection';

/**
 * «Gestión» (docs/spec/09): los espacios del centro con su aforo, profesor y servicio fijos, y el
 * horario fijo semanal (clases que se repiten, con su grupo fijo). Los bloqueos cuelgan de cada espacio.
 */
export function ManagementScreen(): React.JSX.Element {
  const onBackPress = useBackAction();

  return (
    <ScreenTemplate
      onBackPress={onBackPress}
      title={i18n.t('centerAdmin.management.title')}
      subtitle={i18n.t('centerAdmin.management.subtitle')}
    >
      <ManagementActions />
      <RoomsManagementSection />
      <RoomBlocksManagementSection />
      <ScheduleWeekSection />
    </ScreenTemplate>
  );
}
