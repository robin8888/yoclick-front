import { SignOutAction } from '@/features/session';
import { useSignOutFlow } from '@/shared/auth/useSignOutFlow';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { LoadErrorState } from './LoadErrorState';

interface LoadErrorScreenProps {
  /** Título de la pantalla (el de siempre); `title` es el del error y no puede repetirlo. */
  screenTitle: string;
  title: string;
  error: unknown;
  onRetry: () => void;
  isRetrying?: boolean;
}

/** Pantalla entera para cuando lo que la alimenta no ha podido cargarse. */
export function LoadErrorScreen({
  screenTitle,
  title,
  error,
  onRetry,
  isRetrying = false,
}: Readonly<LoadErrorScreenProps>): React.JSX.Element {
  const signOut = useSignOutFlow();

  return (
    <ScreenTemplate hasPlatformHeroBackground title={screenTitle} isLoading={signOut.isSigningOut}>
      <LoadErrorState title={title} error={error} onRetry={onRetry} isRetrying={isRetrying} />
      <SignOutAction flow={signOut} />
    </ScreenTemplate>
  );
}
