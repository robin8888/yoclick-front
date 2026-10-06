import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { i18n } from '@/shared/i18n';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { CenterJoinConfirmation } from '../components/CenterJoinConfirmation';
import { LoadErrorScreen } from '../components/LoadErrorScreen';
import { useCenterBranding } from '../hooks/useCenterBranding';
import { mapBrandingToPendingCenter } from '../model/pending-center';
import { usePendingCenterStore } from '../model/pending-center-store';

interface JoinConfirmScreenProps {
  centerId: string;
}

/** Prototipo `jconfirm`: la persona comprueba que es su centro antes de unirse. */
export function JoinConfirmScreen({
  centerId,
}: Readonly<JoinConfirmScreenProps>): React.JSX.Element {
  const branding = useCenterBranding(centerId);
  const pendingCenter = usePendingCenterStore((state) => state.pendingCenter);

  if (branding.isError) {
    return (
      <LoadErrorScreen
        screenTitle={i18n.t('join.confirm.title')}
        title={i18n.t('join.confirm.errorTitle')}
        error={branding.error}
        onRetry={() => void branding.refetch()}
        isRetrying={branding.isFetching}
      />
    );
  }
  if (branding.data === undefined) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }

  // El código solo se conserva si la persona lo escribió para este mismo centro.
  const isSameCenter = pendingCenter?.id === centerId;
  const joinCode = isSameCenter ? pendingCenter.joinCode : undefined;
  const joinSource = isSameCenter ? pendingCenter.joinSource : undefined;
  return (
    <CenterJoinConfirmation
      centerToJoin={mapBrandingToPendingCenter(branding.data, joinCode, joinSource)}
    />
  );
}
