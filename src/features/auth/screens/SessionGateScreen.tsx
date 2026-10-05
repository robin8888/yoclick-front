import { Redirect } from 'expo-router';

import { LoadErrorScreen, usePendingInvitationStore } from '@/features/join';
import { useCenterCreationIntentStore } from '@/features/onboarding';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { LoadingScreenTemplate } from '@/ui/templates/LoadingScreenTemplate';

import { useHomeDestination } from '../hooks/useHomeDestination';
import { HOME_ROUTE_BY_KIND } from '../model/home-routes';
import { resolveSignedInGateRedirect } from '../model/resolve-gate-redirect';

/**
 * Ruta raíz (`/`): decide a dónde va la persona. Sin sesión, a iniciar sesión o registrarse. Con
 * sesión, lo que ya tiene manda (sus centros); solo si aún no tiene ninguno se usa lo que dijo en
 * el registro («Soy…»). Un enlace de invitación pendiente se acepta primero.
 */
export function SessionGateScreen(): React.JSX.Element {
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const hasInvitationLink = usePendingInvitationStore((state) => state.invitationCode !== null);
  const isInvitationExpected = usePendingInvitationStore((state) => state.isInvitationExpected);
  const isCenterCreationRequested = useCenterCreationIntentStore(
    (state) => state.isCenterCreationRequested,
  );
  const { destination, error, isRefetching, retry } = useHomeDestination();

  const redirect = resolveSignedInGateRedirect({
    destination,
    hasInvitationLink,
    isInvitationExpected,
    isCenterCreationRequested,
  });

  if (!isSignedIn) return <Redirect href="/(auth)/start" />;
  if (redirect !== null) return <Redirect href={redirect} />;
  if (destination !== null) return <Redirect href={HOME_ROUTE_BY_KIND[destination.kind]} />;
  if (error === null)
    return <LoadingScreenTemplate loadingLabel={getSharedStateCopy().loadingLabel} />;
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
