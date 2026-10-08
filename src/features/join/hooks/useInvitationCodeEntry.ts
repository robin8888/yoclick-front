import { useEffect, useState } from 'react';
import { useWatch, type Control } from 'react-hook-form';

import type { ErrorType } from '@/shared/api/api-mutator';
import { useJoinGetInvitation } from '@/shared/api/generated/endpoints/join/join';

import type { InvitationCodeFormValues } from '../schemas/invitation-code.schema';
import { isJoinCodeWellFormed } from '../model/join-code';
import { usePendingInvitationStore } from '../model/pending-invitation-store';
import { useFindCenterByJoinCode } from './useFindCenterByJoinCode';
import { useInvitationCodeForm } from './useInvitationCodeForm';

/** Una invitación personal: 12 letras y cifras en grupos de cuatro (`ABCD-EFGH-JKLM`). */
const INVITATION_CODE_PATTERN = /^[A-Z2-9]{4}-?[A-Z2-9]{4}-?[A-Z2-9]{4}$/i;

interface InvitationCodeEntry {
  control: Control<InvitationCodeFormValues>;
  submitCode: () => void;
  isChecking: boolean;
  failure: unknown;
}

/**
 * Escribir un código antes de tener cuenta: el de una invitación personal (rol y centro) o el corto
 * del centro (alumno). Si vale, se guarda para que el registro y el inicio de sesión sepan a qué
 * centro entra la persona.
 */
export function useInvitationCodeEntry(onCodeAccepted: () => void): InvitationCodeEntry {
  const saveInvitationCode = usePendingInvitationStore((state) => state.saveInvitationCode);
  const form = useInvitationCodeForm(null);
  const typedCode = useWatch({ control: form.control, name: 'invitationCode' });
  const findCenter = useFindCenterByJoinCode('code');
  const [centerCodeProblem, setCenterCodeProblem] = useState<ErrorType | null>(null);
  const preview = useJoinGetInvitation(form.submittedCode ?? '', {
    query: { enabled: form.submittedCode !== null, retry: false },
  });
  const confirmedCode = preview.isSuccess ? form.submittedCode : null;

  // Guardar el código y seguir es sincronizar con el store y el router (sistemas externos).
  useEffect(() => {
    if (confirmedCode === null) return;
    saveInvitationCode(confirmedCode);
    onCodeAccepted();
  }, [confirmedCode, saveInvitationCode, onCodeAccepted]);

  function submitCode(): void {
    setCenterCodeProblem(null);
    const isInvitationCode = INVITATION_CODE_PATTERN.test(typedCode.trim());
    if (isInvitationCode || !isJoinCodeWellFormed(typedCode)) {
      form.submitCode();
      return;
    }
    findCenter.mutate(typedCode, {
      onSuccess: onCodeAccepted,
      onError: setCenterCodeProblem,
    });
  }

  return {
    control: form.control,
    submitCode,
    isChecking: preview.isFetching || findCenter.isPending,
    failure: centerCodeProblem ?? preview.error,
  };
}
