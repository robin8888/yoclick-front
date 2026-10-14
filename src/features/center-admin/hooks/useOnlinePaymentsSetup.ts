import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Linking } from 'react-native';

import { getApiErrorMessage } from '@/shared/api/errors';
import {
  getPaymentsGetStatusQueryKey,
  getPaymentsGetStatusQueryOptions,
  paymentsStartOnboarding,
} from '@/shared/api/generated/endpoints/payments/payments';
import { useSessionStore } from '@/shared/auth/session-store';

const ONLINE_PAYMENTS_STATUSES = ['not_included', 'not_started', 'pending', 'ready'] as const;
export type OnlinePaymentsStatus = (typeof ONLINE_PAYMENTS_STATUSES)[number];

interface OnlinePaymentsSetup {
  /** `null` mientras se consulta. */
  status: OnlinePaymentsStatus | null;
  /** Abre el formulario de alta de Stripe en el navegador. */
  startOnboarding: () => void;
  /** Vuelve a preguntar a Stripe, p. ej. al regresar del formulario de alta. */
  refreshStatus: () => void;
  isBusy: boolean;
  errorMessage: string | null;
}

/** El estado de los cobros online del centro y el alta en Stripe (solo el plan Premium cobra). */
export function useOnlinePaymentsSetup(): OnlinePaymentsSetup {
  const centerId = useSessionStore((state) => state.activeCenterId) ?? '';
  const queryClient = useQueryClient();
  const status = useQuery(getPaymentsGetStatusQueryOptions(centerId));
  const onboarding = useMutation({
    mutationFn: () => paymentsStartOnboarding(centerId),
    onSuccess: ({ url }) => {
      void Linking.openURL(url);
      void queryClient.invalidateQueries({ queryKey: getPaymentsGetStatusQueryKey(centerId) });
    },
  });

  return {
    status:
      ONLINE_PAYMENTS_STATUSES.find((candidate) => candidate === String(status.data?.status)) ??
      null,
    startOnboarding: () => {
      onboarding.mutate();
    },
    refreshStatus: () => {
      void status.refetch();
    },
    isBusy: onboarding.isPending || status.isFetching,
    errorMessage: onboarding.isError ? getApiErrorMessage(onboarding.error) : null,
  };
}
