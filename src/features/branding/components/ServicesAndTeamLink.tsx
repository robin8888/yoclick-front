import { useRouter } from 'expo-router';

import { useAssignableStaff, useServiceCatalog } from '@/features/center-admin';
import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { ListItem } from '@/ui/molecules/ListItem';

/** Prototipo `abrand`: acceso a «Servicios, horario y [profesionales]» con sus cifras. */
export function ServicesAndTeamLink(): React.JSX.Element {
  const router = useRouter();
  const staffWord = getSectorVocabulary(useActiveCenterSectorId()).staff.plural;
  const serviceCount = useServiceCatalog().data?.services.length;
  const staffCount = useAssignableStaff().members.length;
  const hasCounts = serviceCount !== undefined;

  return (
    <ListItem
      leadingIconName="calendar"
      title={i18n.t('branding.services.title', { staffWord })}
      subtitle={
        hasCounts
          ? i18n.t('branding.services.subtitle', { serviceCount, staffCount, staffWord })
          : undefined
      }
      onPress={() => {
        router.push('/(admin)/services');
      }}
    />
  );
}
