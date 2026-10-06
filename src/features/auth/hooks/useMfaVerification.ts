import { getDeviceName } from '@/shared/auth/device-name';
import { useAuthVerifyMfa } from '@/shared/api/generated/endpoints/auth/auth';
import { getApiErrorMessage } from '@/shared/api/errors';
import { i18n } from '@/shared/i18n';

import { useAuthFlowStore } from '../model/auth-flow-store';
import { useCompleteSignIn } from './useCompleteSignIn';

type MfaCodeFields = { code: string } | { recoveryCode: string };

interface MfaVerification {
  verifyWith: (codeFields: MfaCodeFields) => void;
  isVerifying: boolean;
  errorMessage: string | null;
  hasChallenge: boolean;
}

/** Envía el código del segundo factor con el desafío del login y, si vale, abre la sesión. */
export function useMfaVerification(): MfaVerification {
  const mfaToken = useAuthFlowStore((state) => state.mfaChallengeToken);
  const clearMfaChallengeToken = useAuthFlowStore((state) => state.clearMfaChallengeToken);
  const verifyMutation = useAuthVerifyMfa();
  const { completeSignIn, hasSessionStartFailed } = useCompleteSignIn();

  function verifyWith(codeFields: MfaCodeFields): void {
    if (mfaToken === null) return;
    verifyMutation.mutate(
      { data: { mfaToken, ...codeFields, deviceName: getDeviceName() } },
      {
        onSuccess: (response) => {
          clearMfaChallengeToken();
          completeSignIn(response);
        },
      },
    );
  }

  return {
    verifyWith,
    isVerifying: verifyMutation.isPending,
    errorMessage: resolveMfaErrorMessage(verifyMutation.error, hasSessionStartFailed),
    hasChallenge: mfaToken !== null,
  };
}

function resolveMfaErrorMessage(
  verificationError: unknown,
  hasSessionStartFailed: boolean,
): string | null {
  if (verificationError !== null) return getApiErrorMessage(verificationError);
  return hasSessionStartFailed ? i18n.t('errors.UNKNOWN_ERROR') : null;
}
