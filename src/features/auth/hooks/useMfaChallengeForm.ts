import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type Control } from 'react-hook-form';

import {
  mfaAppCodeFormSchema,
  mfaRecoveryCodeFormSchema,
  type MfaAppCodeFormValues,
  type MfaRecoveryCodeFormValues,
} from '../schemas/auth-forms.schema';
import { useMfaVerification } from './useMfaVerification';

export type MfaCodeKind = 'appCode' | 'recoveryCode';

interface MfaChallengeForm {
  codeKind: MfaCodeKind;
  toggleCodeKind: () => void;
  appCodeControl: Control<MfaAppCodeFormValues>;
  recoveryCodeControl: Control<MfaRecoveryCodeFormValues>;
  submitCode: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  hasChallenge: boolean;
}

/** Segundo factor del login: código de la app de autenticación o, si no la tiene, uno de recuperación. */
export function useMfaChallengeForm(): MfaChallengeForm {
  const [codeKind, setCodeKind] = useState<MfaCodeKind>('appCode');
  const { verifyWith, isVerifying, errorMessage, hasChallenge } = useMfaVerification();
  const appCodeForm = useForm<MfaAppCodeFormValues>({
    resolver: zodResolver(mfaAppCodeFormSchema),
    defaultValues: { code: '' },
  });
  const recoveryCodeForm = useForm<MfaRecoveryCodeFormValues>({
    resolver: zodResolver(mfaRecoveryCodeFormSchema),
    defaultValues: { recoveryCode: '' },
  });
  const submitAppCode = appCodeForm.handleSubmit(({ code }) => {
    verifyWith({ code });
  });
  const submitRecoveryCode = recoveryCodeForm.handleSubmit(({ recoveryCode }) => {
    verifyWith({ recoveryCode });
  });

  return {
    codeKind,
    toggleCodeKind: () => {
      setCodeKind((previousKind) => (previousKind === 'appCode' ? 'recoveryCode' : 'appCode'));
    },
    appCodeControl: appCodeForm.control,
    recoveryCodeControl: recoveryCodeForm.control,
    submitCode: () => void (codeKind === 'appCode' ? submitAppCode() : submitRecoveryCode()),
    isSubmitting: isVerifying,
    errorMessage,
    hasChallenge,
  };
}
