import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { LoadErrorScreen } from '@/features/join';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { LoadingScreenTemplate } from '@/ui/templates/LoadingScreenTemplate';

import { useHomeDestination } from '../hooks/useHomeDestination';
import type { HomeDestinationKind } from '../model/resolve-home-destination';

interface RoleGateProps {
  allowedKind: Exclude<HomeDestinationKind, 'none'>;
  children: ReactNode;
}

/**
 * Guarda de un grupo de rutas (`(client)`, `(staff)`, `(admin)`): sin sesión vuelve a la raíz (iniciar sesión o registrarse) y con
 * otro rol vuelve a la raíz, que lo reencamina. Es solo usabilidad: la API decide los permisos.
 */
export function RoleGate({ allowedKind, children }: Readonly<RoleGateProps>): React.JSX.Element {
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const { destination, error, isRefetching, retry } = useHomeDestination();

  if (!isSignedIn) return <Redirect href="/" />;
  if (error !== null && destination === null) {
    return (
      <LoadErrorScreen
        screenTitle={i18n.t('join.start.overline')}
        title={i18n.t('auth.session.errorTitle')}
        error={error}
        onRetry={retry}
        isRetrying={isRefetching}
      />
    );
  }
  if (destination === null) {
    return <LoadingScreenTemplate loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (destination.kind !== allowedKind) return <Redirect href="/" />;
  return <>{children}</>;
}
