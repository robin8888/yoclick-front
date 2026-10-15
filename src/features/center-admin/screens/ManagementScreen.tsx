import { i18n } from '@/shared/i18n';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ManagementActions } from '../components/ManagementActions';
import { RoomBlocksManagementSection } from '../components/RoomBlocksManagementSection';
import { ScheduleWeekSection } from '../components/ScheduleWeekSection';

/**
 * «Gestión» (docs/spec/13): tres botones para crear sala, servicio y clase; debajo, los bloqueos de
 * cada sala (alquiler, mantenimiento) y las clases fijas de la semana.
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
      <RoomBlocksManagementSection />
      <ScheduleWeekSection />
    </ScreenTemplate>
  );
}
