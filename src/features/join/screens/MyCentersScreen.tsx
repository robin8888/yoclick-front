import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { LoadErrorScreen } from '../components/LoadErrorScreen';
import { MyCentersOverview } from '../components/MyCentersOverview';
import { useMyCenters } from '../hooks/useMyCenters';

/** Prototipo `jcenters`: cambiar de centro cambia la marca de la app. */
export function MyCentersScreen(): React.JSX.Element {
  const myCenters = useMyCenters();

  if (myCenters.isError) {
    return (
      <LoadErrorScreen
        screenTitle={i18n.t('join.centers.title')}
        title={i18n.t('join.centers.errorTitle')}
        error={myCenters.error}
        onRetry={() => void myCenters.refetch()}
        isRetrying={myCenters.isFetching}
      />
    );
  }
  if (myCenters.data === undefined) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  return <MyCentersOverview memberships={myCenters.data.memberships} />;
}
