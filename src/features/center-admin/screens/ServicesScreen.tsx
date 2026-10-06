import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { OpeningHoursSection } from '../components/OpeningHoursSection';
import { RoomsSection } from '../components/RoomsSection';
import { ServiceCatalogSection } from '../components/ServiceCatalogSection';
import { TeamSection } from '../components/TeamSection';
import { useCenterSettings } from '../hooks/useCenterSettings';
import { useServiceCatalog } from '../hooks/useServiceCatalog';

const NEW_SERVICE_ROUTE_ID = 'new';

/** Prototipo `asvc`: lo que los clientes pueden reservar y cuándo abre el centro. */
export function ServicesScreen(): React.JSX.Element {
  const router = useRouter();
  const catalog = useServiceCatalog();
  const settings = useCenterSettings();

  const openEditor = (serviceId: string): void => {
    router.push({ pathname: '/(admin)/services/[serviceId]', params: { serviceId } });
  };

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.services.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <ServiceCatalogSection
        catalog={catalog}
        onServiceOpen={openEditor}
        onNewService={() => {
          openEditor(NEW_SERVICE_ROUTE_ID);
        }}
      />
      <RoomsSection />
      {settings.data === undefined ? null : (
        <OpeningHoursSection openingHours={settings.data.openingHours} />
      )}
      <TeamSection />
    </ScreenTemplate>
  );
}
