import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { passesAssign } from '@/shared/api/generated/endpoints/passes/passes';

import { useActiveCenterId } from './useActiveCenterId';

interface AssignPass {
  assignPass: (rateId: string, onAssigned: () => void) => void;
  isAssigning: boolean;
  errorMessage: string | null;
}

/** El centro entrega un bono ya activo a una persona; no es optimista y recarga sus bonos. */
export function useAssignPass(clientMembershipId: string): AssignPass {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (rateId: string) => passesAssign(centerId, { rateId, clientMembershipId }),
  });

  return {
    assignPass: (rateId, onAssigned) => {
      mutation.mutate(rateId, {
        onSuccess: () => {
          void queryClient
            .invalidateQueries({ queryKey: [`/v1/centers/${centerId}/passes`] })
            .then(onAssigned);
        },
      });
    },
    isAssigning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
