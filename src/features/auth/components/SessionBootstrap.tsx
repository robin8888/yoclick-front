import type { ReactNode } from 'react';

import { LoadErrorScreen } from '@/features/join';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { LoadingScreenTemplate } from '@/ui/templates/LoadingScreenTemplate';

import { useRestoreSessionOnLaunch } from '../hooks/useRestoreSessionOnLaunch';

interface SessionBootstrapProps {
  children: ReactNode;
}

const RESTORE_FAILURE = new Error('SESSION_RESTORE_FAILED');

/** No enseña ninguna ruta hasta saber si hay una sesión guardada válida. */
export function SessionBootstrap({ children }: Readonly<SessionBootstrapProps>): React.JSX.Element {
  const sessionStatus = useSessionStore((state) => state.status);
  const { hasRestoreFailed, retryRestore } = useRestoreSessionOnLaunch();

  if (sessionStatus !== 'restoring') return <>{children}</>;
  if (!hasRestoreFailed)
    return <LoadingScreenTemplate loadingLabel={getSharedStateCopy().loadingLabel} />;
  return (
    <LoadErrorScreen
      screenTitle={i18n.t('join.start.overline')}
      title={i18n.t('auth.session.errorTitle')}
      error={RESTORE_FAILURE}
      onRetry={retryRestore}
    />
  );
}
