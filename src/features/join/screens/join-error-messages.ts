import { isApiError } from '@/shared/api/api-error';
import { getApiErrorMessage } from '@/shared/api/errors';
import { i18n } from '@/shared/i18n';

const JOIN_CODE_INVALID_ERROR_CODE = 'JOIN_CODE_INVALID';

/** Para un código mal escrito se explica qué hacer; el resto de fallos usa el mensaje común. */
export function getJoinCodeErrorMessage(error: unknown): string {
  if (isApiError(error) && error.code === JOIN_CODE_INVALID_ERROR_CODE) {
    return i18n.t('join.code.notFound');
  }
  return getApiErrorMessage(error);
}

export function getJoinCenterErrorMessage(error: unknown): string {
  if (isApiError(error) && error.code === JOIN_CODE_INVALID_ERROR_CODE) {
    return i18n.t('join.confirm.needsCodeMessage');
  }
  return getApiErrorMessage(error);
}
