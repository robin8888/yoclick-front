import { isApiError } from '@/shared/api/api-error';
import { getApiErrorMessage } from '@/shared/api/errors';
import { formatSupportCode, getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { ErrorState } from '@/ui/molecules/ErrorState';

interface LoadErrorStateProps {
  title: string;
  error: unknown;
  onRetry: () => void;
  isRetrying?: boolean;
}

/** Error de carga con reintento y, si la API lo dio, el código de soporte (`traceId`). */
export function LoadErrorState({
  title,
  error,
  onRetry,
  isRetrying = false,
}: Readonly<LoadErrorStateProps>): React.JSX.Element {
  const traceId = isApiError(error) ? error.traceId : undefined;

  return (
    <ErrorState
      title={title}
      message={getApiErrorMessage(error)}
      retryLabel={getSharedStateCopy().retryLabel}
      onRetry={onRetry}
      isRetrying={isRetrying}
      {...(traceId === undefined ? {} : { supportCodeText: formatSupportCode(traceId) })}
    />
  );
}
