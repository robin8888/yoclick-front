import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { usePlatformOverview } from '../hooks/usePlatformOverview';
import { OverviewSections } from './OverviewSections';

/** El resumen de la plataforma, con sus estados de carga y de error. */
export function OverviewTab(): React.JSX.Element {
  const overview = usePlatformOverview();

  if (overview.isError) {
    return (
      <LoadErrorState
        title={i18n.t('platform.overview.errorTitle')}
        error={overview.error}
        onRetry={() => void overview.refetch()}
        isRetrying={overview.isFetching}
      />
    );
  }
  if (overview.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  return <OverviewSections overview={overview.data} />;
}
