import { useRouter } from 'expo-router';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ImportStepContent } from '../components/ImportStepContent';
import { useClientImportWizard } from '../hooks/useClientImportWizard';

const STEP_SUBTITLE_KEYS = {
  file: 'centerAdmin.importClients.stepFile',
  columns: 'centerAdmin.importClients.stepColumns',
  review: 'centerAdmin.importClients.stepReview',
  done: 'centerAdmin.importClients.stepDone',
} as const;

/** Prototipo `aimport`: traer a las personas de un CSV de otro programa en cuatro pasos. */
export function ImportClientsScreen(): React.JSX.Element {
  const router = useRouter();
  const wizard = useClientImportWizard();
  const clientWord = getSectorVocabulary(useActiveCenterSectorId()).client.plural;

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.importClients.title', { clientWord })}
      subtitle={i18n.t(STEP_SUBTITLE_KEYS[wizard.step])}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={wizard.isImporting}
    >
      <ImportStepContent
        wizard={wizard}
        clientWord={clientWord}
        onSeeClientsPress={() => {
          router.replace('/(admin)/(tabs)/clients');
        }}
      />
    </ScreenTemplate>
  );
}
