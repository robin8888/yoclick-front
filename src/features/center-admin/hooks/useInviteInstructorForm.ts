import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Control } from 'react-hook-form';

import { inviteInstructorFormSchema, type InviteInstructorFormValues } from '../model/invite-form';
import { useInstructorInvitations } from './useInstructorInvitations';

type Invitations = ReturnType<typeof useInstructorInvitations>;

interface InviteInstructorForm {
  control: Control<InviteInstructorFormValues>;
  submitInvitation: () => void;
  pendingInvitations: Invitations['pendingInvitations'];
  isInviting: boolean;
  inviteErrorMessage: string | null;
}

/** Escribir el correo y pulsar «Añadir» envía la invitación y deja el campo listo para otra. */
export function useInviteInstructorForm(): InviteInstructorForm {
  const invitations = useInstructorInvitations();
  const { control, handleSubmit, reset } = useForm<InviteInstructorFormValues>({
    resolver: zodResolver(inviteInstructorFormSchema),
    defaultValues: { email: '' },
  });

  return {
    control,
    submitInvitation: () =>
      void handleSubmit(({ email }) => {
        invitations.inviteInstructor(email, () => {
          reset();
        });
      })(),
    pendingInvitations: invitations.pendingInvitations,
    isInviting: invitations.isInviting,
    inviteErrorMessage: invitations.inviteErrorMessage,
  };
}
