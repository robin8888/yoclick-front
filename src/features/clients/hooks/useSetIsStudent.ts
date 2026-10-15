import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  clientsUpdate,
  getClientsGetQueryKey,
  getClientsListQueryKey,
} from '@/shared/api/generated/endpoints/clients/clients';
import { useSessionStore } from '@/shared/auth/session-store';

interface SetIsStudent {
  setIsStudent: (isStudent: boolean) => void;
  isSaving: boolean;
  errorMessage: string | null;
}

/** Marca a una persona como alumno o solo como tutor; no es optimista: espera al servidor. */
export function useSetIsStudent(membershipId: string): SetIsStudent {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (isStudent: boolean) => clientsUpdate(centerId, membershipId, { isStudent }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: getClientsGetQueryKey(centerId, membershipId),
      });
      void queryClient.invalidateQueries({ queryKey: getClientsListQueryKey(centerId) });
    },
  });

  return {
    setIsStudent: (isStudent) => {
      mutation.mutate(isStudent);
    },
    isSaving: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
