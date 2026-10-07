import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/shared/api/errors';

export interface ApiMutation<TInput, TResult = unknown> {
  run(input: TInput, onDone?: (result: TResult) => void): void;
  isRunning: boolean;
  errorMessage: string | null;
}

interface MutationOptions<TInput, TResult> {
  send: (input: TInput) => Promise<TResult>;
  /** Lo que queda desactualizado al terminar bien: se vuelve a pedir al servidor (nada es optimista). */
  invalidates: readonly QueryKey[];
}

/** Una mutación del servidor con estado de carga, mensaje de error y refresco de lo que cambia. */
export function useInvalidatingMutation<TInput, TResult>({
  send,
  invalidates,
}: Readonly<MutationOptions<TInput, TResult>>): ApiMutation<TInput, TResult> {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: send,
    onSuccess: () =>
      Promise.all(invalidates.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
  });

  return {
    run: (input, onDone) => {
      mutation.mutate(input, onDone ? { onSuccess: onDone } : {});
    },
    isRunning: mutation.isPending,
    errorMessage: mutation.isError ? getApiErrorMessage(mutation.error) : null,
  };
}
