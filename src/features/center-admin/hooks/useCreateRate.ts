import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { getRatesListQueryKey, ratesCreate } from '@/shared/api/generated/endpoints/rates/rates';
import type { CreateRateRequestDto } from '@/shared/api/generated/model';

import { useActiveCenterId } from './useActiveCenterId';

interface CreateRate {
  createRate: (request: CreateRateRequestDto) => void;
  isCreating: boolean;
  errorMessage: string | null;
}

/** Crea un bono; no es optimista y, al terminar, recarga la lista y avisa. */
export function useCreateRate(onCreated: () => void): CreateRate {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (request: CreateRateRequestDto) => ratesCreate(centerId, request),
    onSuccess: () => {
      void queryClient
        .invalidateQueries({ queryKey: getRatesListQueryKey(centerId) })
        .then(onCreated);
    },
  });

  return {
    createRate: (request) => {
      mutation.mutate(request);
    },
    isCreating: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
