import { useRouter } from 'expo-router';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ActivityLogSection } from '../components/ActivityLogSection';
import { OpenSessionsSection } from '../components/OpenSessionsSection';
import { TwoFactorStatusCard } from '../components/TwoFactorStatusCard';

/** Prototipo `asec`: verificación en dos pasos, sesiones abiertas y registro de actividad. */
export function AccountSecurityScreen(): React.JSX.Element {
  const router = useRouter();
  const clientWord = getSectorVocabulary(useActiveCenterSectorId()).client.plural;

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.security.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <TwoFactorStatusCard clientWord={clientWord} />
      <OpenSessionsSection />
      <ActivityLogSection />
    </ScreenTemplate>
  );
}
