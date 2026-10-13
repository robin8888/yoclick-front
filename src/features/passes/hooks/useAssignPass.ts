import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import { passesAssign } from '@/shared/api/generated/endpoints/passes/passes';

import { useActiveCenterId } from './useActiveCenterId';

interface AssignPass {
  assignPass: (rateId: string, onAssigned: () => void) => void;
  isAssigning: boolean;
  errorMessage: string | null;
}

/**
 * El centro entrega un bono ya activo a una persona; no es optimista y recarga sus bonos. Un
 * segundo toque antes de que responda el servidor se ignora: nunca se crean dos bonos por error.
 */
export function useAssignPass(clientMembershipId: string): AssignPass {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  // Se activa al instante (un estado de React tardaría un render): frena el doble toque.
  const isRequestInFlight = useRef(false);
  const mutation = useMutation({
    mutationFn: (rateId: string) => passesAssign(centerId, { rateId, clientMembershipId }),
    onSettled: () => {
      isRequestInFlight.current = false;
    },
  });

  return {
    assignPass: (rateId, onAssigned) => {
      if (isRequestInFlight.current) return;
      isRequestInFlight.current = true;
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
