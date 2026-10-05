import { useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { JoinCodeShare } from '../components/JoinCodeShare';
import { useCenterSettings } from '../hooks/useCenterSettings';

/** Prototipo `ashare`: QR, código y enlace con los que la clientela se une al centro. */
export function InviteClientsScreen(): React.JSX.Element {
  const router = useRouter();
  const settings = useCenterSettings();
  const center = settings.data;

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.inviteClients.title')}
      subtitle={
        center === undefined
          ? undefined
          : i18n.t('centerAdmin.inviteClients.subtitle', { centerName: center.name })
      }
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {settings.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {settings.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.inviteClients.errorTitle')}
          error={settings.error}
          onRetry={() => void settings.refetch()}
          isRetrying={settings.isFetching}
        />
      ) : null}
      {center === undefined ? null : (
        <JoinCodeShare centerName={center.name} joinCode={center.joinCode} />
      )}
    </ScreenTemplate>
  );
}
