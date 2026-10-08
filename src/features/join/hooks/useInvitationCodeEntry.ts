import { useEffect } from 'react';

import { useJoinGetInvitation } from '@/shared/api/generated/endpoints/join/join';

import { usePendingInvitationStore } from '../model/pending-invitation-store';
import { useInvitationCodeForm } from './useInvitationCodeForm';

interface InvitationCodeEntry {
  control: ReturnType<typeof useInvitationCodeForm>['control'];
  submitCode: () => void;
  isChecking: boolean;
  failure: unknown;
}

/**
 * Escribir el código antes de tener cuenta: se consulta la invitación y, si vale, se guarda para que
 * el registro, el inicio de sesión y la aceptación sepan a qué centro y con qué rol va la persona.
 */
export function useInvitationCodeEntry(onCodeAccepted: () => void): InvitationCodeEntry {
  const saveInvitationCode = usePendingInvitationStore((state) => state.saveInvitationCode);
  const form = useInvitationCodeForm(null);
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

  return {
    control: form.control,
    submitCode: form.submitCode,
    isChecking: preview.isFetching,
    failure: preview.error,
  };
}
