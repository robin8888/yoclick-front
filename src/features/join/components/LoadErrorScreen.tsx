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
  return (
    <ScreenTemplate hasPlatformHeroBackground title={screenTitle}>
      <LoadErrorState title={title} error={error} onRetry={onRetry} isRetrying={isRetrying} />
    </ScreenTemplate>
  );
}
