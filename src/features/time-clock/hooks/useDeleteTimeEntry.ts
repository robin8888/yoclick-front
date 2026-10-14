import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import { timeEntriesDelete } from '@/shared/api/generated/endpoints/time-entries/time-entries';

import { useActiveCenterId } from './useActiveCenterId';

interface DeleteTimeEntry {
  deleteEntry: (entryId: string, onDone: () => void) => void;
  isDeleting: boolean;
  errorMessage: string | null;
}

/** Quita un fichaje (por ejemplo, uno duplicado): se espera al servidor y se recarga el mes. */
export function useDeleteTimeEntry(): DeleteTimeEntry {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const isRequestInFlight = useRef(false);
  const mutation = useMutation({
    mutationFn: (entryId: string) => timeEntriesDelete(centerId, entryId),
    onSettled: () => {
      isRequestInFlight.current = false;
    },
  });

  return {
    deleteEntry: (entryId, onDone) => {
      if (isRequestInFlight.current) return;
      isRequestInFlight.current = true;
      mutation.mutate(entryId, {
        onSuccess: () => {
          void queryClient
            .invalidateQueries({ queryKey: [`/v1/centers/${centerId}/me/time-entries`] })
            .then(onDone);
        },
      });
    },
    isDeleting: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
