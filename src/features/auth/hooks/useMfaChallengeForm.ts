import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm, type Control, type UseFormReturn } from 'react-hook-form';

import {
  mfaAppCodeFormSchema,
  mfaRecoveryCodeFormSchema,
  type MfaAppCodeFormValues,
  type MfaRecoveryCodeFormValues,
} from '../schemas/auth-forms.schema';
import { useAuthFlowStore } from '../model/auth-flow-store';
import { useMfaEmailCodeSender } from './useMfaEmailCodeSender';
import { useMfaVerification } from './useMfaVerification';

export type MfaCodeKind = 'appCode' | 'emailCode' | 'recoveryCode';

interface MfaChallengeForm {
  codeKind: MfaCodeKind;
  /** Las otras formas de dar el segundo factor, para ofrecerlas como alternativa. */
  otherCodeKinds: MfaCodeKind[];
  selectCodeKind: (kind: MfaCodeKind) => void;
  /** El código de seis dígitos, de la app o del correo según `codeKind`. */
  codeControl: Control<MfaAppCodeFormValues>;
  recoveryCodeControl: Control<MfaRecoveryCodeFormValues>;
  submitCode: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  hasChallenge: boolean;
  emailSender: ReturnType<typeof useMfaEmailCodeSender>;
}

/**
 * Envía el código del correo la primera vez que hace falta (al abrir la pantalla quien solo tiene
 * el correo, o al elegirlo); después se reenvía a mano con su cuenta atrás.
 */
function useSendEmailCodeOnce(input: { sendCode: () => void; isWanted: boolean }): () => void {
  const hasSent = useRef(false);
  const { sendCode, isWanted } = input;
  const sendOnce = (): void => {
    if (hasSent.current) return;
    hasSent.current = true;
    sendCode();
  };
  // Sincroniza con un sistema externo (el envío del correo): una sola vez, al hacer falta.
  useEffect(() => {
    if (isWanted && !hasSent.current) {
      hasSent.current = true;
      sendCode();
    }
  }, [isWanted, sendCode]);
  return sendOnce;
}

/** Los dos formularios del desafío: seis dígitos (app o correo) y código de recuperación. */
function useMfaCodeForms(): {
  codeForm: UseFormReturn<MfaAppCodeFormValues>;
  recoveryCodeForm: UseFormReturn<MfaRecoveryCodeFormValues>;
} {
  const codeForm = useForm<MfaAppCodeFormValues>({
    resolver: zodResolver(mfaAppCodeFormSchema),
    defaultValues: { code: '' },
  });
  const recoveryCodeForm = useForm<MfaRecoveryCodeFormValues>({
    resolver: zodResolver(mfaRecoveryCodeFormSchema),
    defaultValues: { recoveryCode: '' },
  });
  return { codeForm, recoveryCodeForm };
}

function listCodeKinds(hasApp: boolean): MfaCodeKind[] {
  return hasApp ? ['appCode', 'emailCode', 'recoveryCode'] : ['emailCode', 'recoveryCode'];
}

/**
 * Segundo factor del login: código de la app, código enviado al correo o uno de recuperación.
 * Quien activó el correo empieza por él (y se le envía solo); el resto, por la app.
 */
export function useMfaChallengeForm(): MfaChallengeForm {
  const methods = useAuthFlowStore((state) => state.mfaMethods);
  const hasApp = methods.includes('totp');
  const [codeKind, setCodeKind] = useState<MfaCodeKind>(hasApp ? 'appCode' : 'emailCode');
  const { verifyWith, isVerifying, errorMessage, hasChallenge } = useMfaVerification();
  const emailSender = useMfaEmailCodeSender();
  const { codeForm, recoveryCodeForm } = useMfaCodeForms();
  const sendCodeOnce = useSendEmailCodeOnce({
    sendCode: emailSender.sendCode,
    isWanted: codeKind === 'emailCode' && hasChallenge,
  });

  const submitSixDigits = codeForm.handleSubmit(({ code }) => {
    verifyWith(codeKind === 'emailCode' ? { emailCode: code } : { code });
  });
  const submitRecoveryCode = recoveryCodeForm.handleSubmit(({ recoveryCode }) => {
    verifyWith({ recoveryCode });
  });

  return {
    codeKind,
    otherCodeKinds: listCodeKinds(hasApp).filter((kind) => kind !== codeKind),
    selectCodeKind: (kind) => {
      codeForm.reset({ code: '' });
      setCodeKind(kind);
      if (kind === 'emailCode') sendCodeOnce();
    },
    codeControl: codeForm.control,
    recoveryCodeControl: recoveryCodeForm.control,
    submitCode: () => void (codeKind === 'recoveryCode' ? submitRecoveryCode() : submitSixDigits()),
    isSubmitting: isVerifying,
    errorMessage: errorMessage ?? emailSender.errorMessage,
    hasChallenge,
    emailSender,
  };
}
