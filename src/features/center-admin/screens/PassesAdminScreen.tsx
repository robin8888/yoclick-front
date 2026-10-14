import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { OnlinePaymentsSection } from '../components/OnlinePaymentsSection';
import { PendingPassesSection } from '../components/PendingPassesSection';
import { RateCatalogSection } from '../components/RateCatalogSection';

/** Prototipo `amoney` (parte de bonos): lo que piden las personas y los bonos que se venden. */
export function PassesAdminScreen(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.passes.title')}
      subtitle={i18n.t('centerAdmin.passes.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <OnlinePaymentsSection />
      <PendingPassesSection />
      <RateCatalogSection
        onNewRate={() => {
          router.push('/(admin)/passes/new');
        }}
      />
    </ScreenTemplate>
  );
}
