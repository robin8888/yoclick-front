import { useMutation } from '@tanstack/react-query';
import { Linking } from 'react-native';

import { centersCreateSubscriptionPortal } from '@/shared/api/generated/endpoints/centers/centers';

import { describeLinkFailure } from './describeLinkFailure';
import { useActiveCenterId } from './useActiveCenterId';

interface OpenSubscriptionPortal {
  openPortal: () => void;
  isOpening: boolean;
  portalErrorMessage: string | null;
  clearError: () => void;
}

/**
 * Abre el portal de Stripe en el navegador: ahí se cambia de plan o de periodicidad, de tarjeta, se ven las
 * facturas y se cancela. Al volver a la app se recarga la suscripción.
 */
export function useOpenSubscriptionPortal(): OpenSubscriptionPortal {
  const centerId = useActiveCenterId();
  const mutation = useMutation({
    mutationFn: async () => {
      const { url } = await centersCreateSubscriptionPortal(centerId);
      await Linking.openURL(url);
    },
  });

  return {
    openPortal: () => {
      mutation.mutate();
    },
    isOpening: mutation.isPending,
    portalErrorMessage: mutation.isError ? describeLinkFailure(mutation.error) : null,
    clearError: mutation.reset,
  };
}
