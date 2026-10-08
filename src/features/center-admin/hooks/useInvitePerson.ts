import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getInvitationsListPendingQueryKey,
  invitationsCreate,
  useInvitationsListPending,
} from '@/shared/api/generated/endpoints/team/team';
import type {
  InvitationResponseDto,
  PendingInvitationsResponseDtoInvitationsItem,
} from '@/shared/api/generated/model';
import { createIdempotencyIntention } from '@/shared/api/idempotency';

import type { InviteContact } from '../model/invite-contact';
import type { InvitedRole } from '../model/invite-person-route';
import { useActiveCenterId } from './useActiveCenterId';

interface InvitePerson {
  pendingInvitations: readonly PendingInvitationsResponseDtoInvitationsItem[];
  /** La última invitación creada: trae el código, que solo se ve esta vez. */
  createdInvitation: InvitationResponseDto | undefined;
  invite: (contact: InviteContact) => void;
  isInviting: boolean;
  inviteErrorMessage: string | null;
  startAnother: () => void;
}

function buildRequestBody(contact: InviteContact, role: InvitedRole) {
  return contact.kind === 'email' ? { email: contact.email, role } : { phone: contact.phone, role };
}

/** Invitar a una persona con un rol (alumno o instructor) y ver las invitaciones pendientes de ese rol. */
export function useInvitePerson(role: InvitedRole): InvitePerson {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const pendingQuery = useInvitationsListPending(centerId);
  const inviteMutation = useMutation({
    mutationFn: (contact: InviteContact) =>
      invitationsCreate(centerId, buildRequestBody(contact, role), {
        headers: createIdempotencyIntention().headers,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: getInvitationsListPendingQueryKey(centerId) }),
  });

  return {
    pendingInvitations: (pendingQuery.data?.invitations ?? []).filter(
      (invitation) => invitation.role === role,
    ),
    createdInvitation: inviteMutation.data,
    invite: (contact) => {
      inviteMutation.mutate(contact);
    },
    isInviting: inviteMutation.isPending,
    inviteErrorMessage: inviteMutation.isError ? getApiErrorMessage(inviteMutation.error) : null,
    startAnother: inviteMutation.reset,
  };
}
