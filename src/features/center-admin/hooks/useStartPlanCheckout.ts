import { useMutation } from '@tanstack/react-query';
import { Linking } from 'react-native';

import { centersCreateSubscriptionCheckout } from '@/shared/api/generated/endpoints/centers/centers';
import type { CheckoutRequestDto } from '@/shared/api/generated/model';

import { describeLinkFailure } from './describeLinkFailure';
import { useActiveCenterId } from './useActiveCenterId';

interface StartPlanCheckout {
  startCheckout: (choice: CheckoutRequestDto) => void;
  /** El plan que se está preparando, para marcar su botón como ocupado. */
  pendingPlanId: CheckoutRequestDto['planId'] | null;
  checkoutErrorMessage: string | null;
  clearError: () => void;
}

/**
 * Pide a la API la página de pago de Stripe y la abre en el navegador: la suscripción no se paga dentro
 * de la app. No hace falta esperar a la vuelta, porque al regresar a la app se recarga la suscripción.
 */
export function useStartPlanCheckout(): StartPlanCheckout {
  const centerId = useActiveCenterId();
  const mutation = useMutation({
    mutationFn: async (choice: CheckoutRequestDto) => {
      const { url } = await centersCreateSubscriptionCheckout(centerId, choice);
      await Linking.openURL(url);
    },
  });

  return {
    startCheckout: (choice) => {
      mutation.mutate(choice);
    },
    pendingPlanId: mutation.isPending ? mutation.variables.planId : null,
    checkoutErrorMessage: mutation.isError ? describeLinkFailure(mutation.error) : null,
    clearError: mutation.reset,
  };
}
