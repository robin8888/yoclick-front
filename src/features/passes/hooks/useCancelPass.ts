import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import { passesCancel } from '@/shared/api/generated/endpoints/passes/passes';

import { useActiveCenterId } from './useActiveCenterId';

interface CancelPass {
  cancelPass: (passId: string, onDone: () => void) => void;
  isCancelling: boolean;
  errorMessage: string | null;
}

/** El centro quita un bono asignado; no es optimista: se espera al servidor y se recargan las listas. */
export function useCancelPass(): CancelPass {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const isRequestInFlight = useRef(false);
  const mutation = useMutation({
    mutationFn: (passId: string) => passesCancel(centerId, passId),
    onSettled: () => {
      isRequestInFlight.current = false;
    },
  });

  return {
    cancelPass: (passId, onDone) => {
      if (isRequestInFlight.current) return;
      isRequestInFlight.current = true;
      mutation.mutate(passId, {
        onSuccess: () => {
          void queryClient
            .invalidateQueries({ queryKey: [`/v1/centers/${centerId}/passes`] })
            .then(onDone);
        },
      });
    },
    isCancelling: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
