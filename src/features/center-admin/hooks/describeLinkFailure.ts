import { isApiError, isNetworkError } from '@/shared/api/api-error';
import { getApiErrorMessage } from '@/shared/api/errors';
import { i18n } from '@/shared/i18n';

/** Un fallo de la API o de red tiene su mensaje; cualquier otro es que el navegador no se pudo abrir. */
export function describeLinkFailure(error: unknown): string {
  return isApiError(error) || isNetworkError(error)
    ? getApiErrorMessage(error)
    : i18n.t('centerAdmin.plans.openFailed');
}
