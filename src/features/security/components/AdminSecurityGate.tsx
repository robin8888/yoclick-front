import type { ReactNode } from 'react';

import { LoadErrorScreen } from '@/features/join';
import { useMfaGetStatus } from '@/shared/api/generated/endpoints/mfa/mfa';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { LoadingScreenTemplate } from '@/ui/templates/LoadingScreenTemplate';

import { MfaSetupScreen } from '../screens/MfaSetupScreen';

interface AdminSecurityGateProps {
  children: ReactNode;
}

/**
 * La zona de administración exige el segundo factor (SEC-47). Quien aún no lo tiene activado ve
 * su configuración en lugar de la zona; los permisos los sigue decidiendo la API.
 */
export function AdminSecurityGate({
  children,
}: Readonly<AdminSecurityGateProps>): React.JSX.Element {
  const mfaStatus = useMfaGetStatus();

  if (mfaStatus.isError) {
    return (
      <LoadErrorScreen
        screenTitle={i18n.t('security.mfaSetup.passwordTitle')}
        title={i18n.t('security.mfaSetup.gateErrorTitle')}
        error={mfaStatus.error}
        onRetry={() => void mfaStatus.refetch()}
        isRetrying={mfaStatus.isFetching}
      />
    );
  }
  if (mfaStatus.data === undefined) {
    return <LoadingScreenTemplate loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  return mfaStatus.data.isEnabled ? <>{children}</> : <MfaSetupScreen />;
}
