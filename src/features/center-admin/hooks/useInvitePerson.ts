import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getInvitationsListPendingQueryKey,
  invitationsCreate,
  invitationsRevoke,
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
  resendInvitation: (invitation: PendingInvitationsResponseDtoInvitationsItem) => void;
  revokeInvitation: (invitationId: string) => void;
}

function toContact(pending: PendingInvitationsResponseDtoInvitationsItem): InviteContact | null {
  if (pending.email !== null) return { kind: 'email', email: pending.email };
  if (pending.phone !== null) return { kind: 'phone', phone: pending.phone };
  return null;
}

function resolveErrorMessage(error: unknown): string | null {
  return error === null || error === undefined ? null : getApiErrorMessage(error);
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

  const revokeMutation = useMutation({
    mutationFn: (invitationId: string) => invitationsRevoke(centerId, invitationId),
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
    inviteErrorMessage: resolveErrorMessage(inviteMutation.error ?? revokeMutation.error),
    startAnother: inviteMutation.reset,
    // Invitar de nuevo al mismo destino anula la anterior y da un código nuevo.
    resendInvitation: (pending) => {
      const contact = toContact(pending);
      if (contact !== null) inviteMutation.mutate(contact);
    },
    revokeInvitation: (invitationId) => {
      revokeMutation.mutate(invitationId);
    },
  };
}
