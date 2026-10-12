import { i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { RoomsManagementSection } from '../components/RoomsManagementSection';
import { ScheduleWeekSection } from '../components/ScheduleWeekSection';

/**
 * «Gestión» (docs/spec/09): los espacios del centro con su aforo, profesor y servicio fijos, y el
 * horario fijo semanal (clases que se repiten, con su grupo fijo). Los bloqueos cuelgan de cada espacio.
 */
export function ManagementScreen(): React.JSX.Element {
  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.management.title')}
      subtitle={i18n.t('centerAdmin.management.subtitle')}
    >
      <RoomsManagementSection />
      <ScheduleWeekSection />
    </ScreenTemplate>
  );
}
