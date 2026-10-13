import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getRatesListQueryKey, ratesArchive } from '@/shared/api/generated/endpoints/rates/rates';

import { useActiveCenterId } from './useActiveCenterId';

interface ArchiveRate {
  archiveRate: (rateId: string, onDone: () => void) => void;
  isArchiving: boolean;
  errorMessage: string | null;
}

/** Quita un bono de la venta; los ya vendidos siguen valiendo. */
export function useArchiveRate(): ArchiveRate {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (rateId: string) => ratesArchive(centerId, rateId),
  });

  return {
    archiveRate: (rateId, onDone) => {
      mutation.mutate(rateId, {
        onSuccess: () => {
          void queryClient
            .invalidateQueries({ queryKey: getRatesListQueryKey(centerId) })
            .then(onDone);
        },
      });
    },
    isArchiving: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
