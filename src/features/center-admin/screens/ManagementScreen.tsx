import { i18n } from '@/shared/i18n';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ManagementActions } from '../components/ManagementActions';

/**
 * «Gestión» (docs/spec/13): tres botones para crear sala, servicio y clase. Editar lo ya creado está debajo de cada formulario de creación.
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
    </ScreenTemplate>
  );
}
