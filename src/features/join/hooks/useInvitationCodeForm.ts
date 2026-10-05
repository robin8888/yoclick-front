import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, type Control } from 'react-hook-form';

import {
  invitationCodeFormSchema,
  type InvitationCodeFormValues,
} from '../schemas/invitation-code.schema';

interface InvitationCodeForm {
  control: Control<InvitationCodeFormValues>;
  /** Código ya enviado; con él se consulta la invitación. */
  submittedCode: string | null;
  submitCode: () => void;
  resetCode: () => void;
}

/** El código puede venir ya relleno (enlace de invitación): entonces se consulta sin preguntar. */
export function useInvitationCodeForm(initialCode: string | null): InvitationCodeForm {
  const [submittedCode, setSubmittedCode] = useState<string | null>(initialCode);
  const { control, handleSubmit } = useForm<InvitationCodeFormValues>({
    resolver: zodResolver(invitationCodeFormSchema),
    defaultValues: { invitationCode: initialCode ?? '' },
  });
  const submitCode = handleSubmit(({ invitationCode }) => {
    setSubmittedCode(invitationCode);
  });

  return {
    control,
    submittedCode,
    submitCode: () => void submitCode(),
    resetCode: () => {
      setSubmittedCode(null);
    },
  };
}
