import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { usePrivacyRequestList } from '../hooks/usePrivacyRequests';
import { PrivacyRequestsAdminSection } from './PrivacyRequestsAdminSection';

/** Carga las solicitudes y muestra la sección, o el estado de carga o de error con reintento. */
export function PrivacyRequestsLoader(): React.JSX.Element {
  const requests = usePrivacyRequestList();

  if (requests.isPending)
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (requests.isError) {
    return (
      <LoadErrorState
        title={i18n.t('centerAdmin.privacy.requests.errorTitle')}
        error={requests.error}
        onRetry={() => void requests.refetch()}
        isRetrying={requests.isFetching}
      />
    );
  }
  return <PrivacyRequestsAdminSection requests={requests.data.requests} />;
}
