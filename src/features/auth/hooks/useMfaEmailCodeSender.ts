import { getApiErrorMessage } from '@/shared/api/errors';
import { useAuthSendMfaEmailCode } from '@/shared/api/generated/endpoints/auth/auth';

import { useAuthFlowStore } from '../model/auth-flow-store';
import { useResendCooldown } from './useResendCooldown';

/** El servidor no deja pedir otro código antes de 60 segundos: la cuenta atrás lo evita. */
const RESEND_COOLDOWN_SECONDS = 60;

interface MfaEmailCodeSender {
  sendCode: () => void;
  isSending: boolean;
  hasSent: boolean;
  /** Segundos que faltan para poder pedir otro; 0 = ya se puede. */
  secondsLeft: number;
  emailHint: string | null;
  errorMessage: string | null;
}

/** Pide al servidor que envíe el código del segundo factor al correo de quien inicia sesión. */
export function useMfaEmailCodeSender(): MfaEmailCodeSender {
  const mfaToken = useAuthFlowStore((state) => state.mfaChallengeToken);
  const emailHint = useAuthFlowStore((state) => state.mfaEmailHint);
  const sendMutation = useAuthSendMfaEmailCode();
  const cooldown = useResendCooldown(RESEND_COOLDOWN_SECONDS);

  return {
    sendCode: () => {
      if (mfaToken === null || sendMutation.isPending || cooldown.secondsLeft > 0) return;
      sendMutation.mutate({ data: { mfaToken } }, { onSuccess: cooldown.startCooldown });
    },
    isSending: sendMutation.isPending,
    hasSent: sendMutation.isSuccess,
    secondsLeft: cooldown.secondsLeft,
    emailHint,
    errorMessage: sendMutation.isError ? getApiErrorMessage(sendMutation.error) : null,
  };
}
