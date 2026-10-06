import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/shared/api/api-error';
import { getApiErrorMessage } from '@/shared/api/errors';
import {
  clientsUpdate,
  getGroupsListQueryKey,
  groupsArchive,
  groupsCreate,
} from '@/shared/api/generated/endpoints/clients/clients';
import type { CreateGroupRequestDto, UpdateClientRequestDto } from '@/shared/api/generated/model';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';

const CONFLICT_STATUS = 409;

interface ClientMutation<TInput> {
  run: (input: TInput) => void;
  isRunning: boolean;
  errorMessage: string | null;
}

function useRefreshClients(): () => Promise<unknown> {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      // El prefijo de la ruta alcanza todas las páginas y filtros de la lista de clientes.
      queryClient.invalidateQueries({ queryKey: [`/v1/centers/${centerId}/clients`] }),
      queryClient.invalidateQueries({ queryKey: getGroupsListQueryKey(centerId) }),
    ]);
}

function describeGroupFailure(error: unknown): string {
  if (error instanceof ApiError && error.status === CONFLICT_STATUS) {
    return i18n.t('clients.groupForm.duplicateName');
  }
  return getApiErrorMessage(error);
}

/** Crea un grupo; no es optimista. Un nombre repetido se dice con palabras del centro. */
export function useCreateGroup(onDone: () => void): ClientMutation<CreateGroupRequestDto> {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const refresh = useRefreshClients();
  const mutation = useMutation({
    mutationFn: (request: CreateGroupRequestDto) => groupsCreate(centerId, request),
    onSuccess: () => void refresh().then(onDone),
  });

  return {
    run: (request) => {
      mutation.mutate(request);
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? describeGroupFailure(mutation.error) : null,
  };
}

/** Quita un grupo: sus clientes se quedan sin grupo. */
export function useArchiveGroup(onDone: () => void): ClientMutation<string> {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const refresh = useRefreshClients();
  const mutation = useMutation({
    mutationFn: (groupId: string) => groupsArchive(centerId, groupId),
    onSuccess: () => void refresh().then(onDone),
  });

  return {
    run: (groupId) => {
      mutation.mutate(groupId);
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}

interface ClientChange {
  membershipId: string;
  changes: UpdateClientRequestDto;
}

/** Cambia el nivel o el grupo de un cliente. */
export function useUpdateClient(onDone: () => void): ClientMutation<ClientChange> {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const refresh = useRefreshClients();
  const mutation = useMutation({
    mutationFn: ({ membershipId, changes }: ClientChange) =>
      clientsUpdate(centerId, membershipId, changes),
    onSuccess: () => void refresh().then(onDone),
  });

  return {
    run: (change) => {
      mutation.mutate(change);
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
