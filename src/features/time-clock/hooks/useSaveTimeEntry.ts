import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  timeEntriesCreate,
  timeEntriesUpdate,
} from '@/shared/api/generated/endpoints/time-entries/time-entries';

import { useActiveCenterId } from './useActiveCenterId';

export interface TimeEntryDraft {
  /** `null` al añadir un día olvidado; el id de la entrada al corregir una. */
  entryId: string | null;
  clockInAt: string;
  clockOutAt: string;
}

interface SaveTimeEntry {
  saveEntry: (draft: TimeEntryDraft, onDone: () => void) => void;
  isSaving: boolean;
  errorMessage: string | null;
  resetError: () => void;
}

/** Añade o corrige un fichaje: no es optimista; se espera al servidor y se recarga el mes. */
export function useSaveTimeEntry(): SaveTimeEntry {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const isRequestInFlight = useRef(false);
  const mutation = useMutation({
    mutationFn: (draft: TimeEntryDraft) => {
      const { entryId, clockInAt, clockOutAt } = draft;
      if (entryId === null) {
        return timeEntriesCreate(centerId, { clockInAt, clockOutAt });
      }
      return timeEntriesUpdate(centerId, entryId, { clockInAt, clockOutAt });
    },
    onSettled: () => {
      isRequestInFlight.current = false;
    },
  });

  return {
    saveEntry: (draft, onDone) => {
      if (isRequestInFlight.current) return;
      isRequestInFlight.current = true;
      mutation.mutate(draft, {
        onSuccess: () => {
          void queryClient
            .invalidateQueries({ queryKey: [`/v1/centers/${centerId}/me/time-entries`] })
            .then(onDone);
        },
      });
    },
    isSaving: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
    resetError: mutation.reset,
  };
}
