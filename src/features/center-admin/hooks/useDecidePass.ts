import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';
import { passesActivate, passesReject } from '@/shared/api/generated/endpoints/passes/passes';

import { useActiveCenterId } from './useActiveCenterId';

export type PassDecision = 'activate' | 'reject';

interface DecidePass {
  decidePass: (command: { passId: string; decision: PassDecision }) => void;
  isDeciding: boolean;
  errorMessage: string | null;
}

/** Activa (al cobrarlo) o rechaza un bono pedido; no es optimista: se espera al servidor. */
export function useDecidePass(): DecidePass {
  const centerId = useActiveCenterId();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ passId, decision }: { passId: string; decision: PassDecision }) =>
      decision === 'activate' ? passesActivate(centerId, passId) : passesReject(centerId, passId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [`/v1/centers/${centerId}/passes`] });
    },
  });

  return {
    decidePass: (command) => {
      mutation.mutate(command);
    },
    isDeciding: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
