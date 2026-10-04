import { Redirect } from 'expo-router';

import { LoadErrorScreen } from '@/features/join';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { useHomeDestination } from '../hooks/useHomeDestination';
import { HOME_ROUTE_BY_KIND } from '../model/home-routes';

/** Ruta raíz (`/`): decide a dónde va la persona según tenga sesión y centros. */
export function SessionGateScreen(): React.JSX.Element {
  const isSignedIn = useSessionStore((state) => state.status === 'signedIn');
  const { destination, error, isRefetching, retry } = useHomeDestination();

  if (!isSignedIn) return <Redirect href="/join" />;
  if (destination !== null) return <Redirect href={HOME_ROUTE_BY_KIND[destination.kind]} />;
  if (error === null) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
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
