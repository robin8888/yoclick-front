import { useRouter } from 'expo-router';

import { useServiceCatalog } from '@/features/center-admin';
import { i18n } from '@/shared/i18n';
import { ListItem } from '@/ui/molecules/ListItem';

/** Prototipo `abrand`: acceso a «Servicios y horario» con el número de servicios. */
export function ServicesAndTeamLink(): React.JSX.Element {
  const router = useRouter();
  const serviceCount = useServiceCatalog().data?.services.length;
  const hasCounts = serviceCount !== undefined;

  return (
    <ListItem
      leadingIconName="calendar"
      title={i18n.t('branding.services.title')}
      subtitle={hasCounts ? i18n.t('branding.services.subtitle', { serviceCount }) : undefined}
      onPress={() => {
        router.push('/(admin)/services');
      }}
    />
  );
}
