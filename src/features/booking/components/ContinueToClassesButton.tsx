import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

import type { BookingMethod } from '../model/booking-method';

interface ContinueToClassesButtonProps {
  selectedServiceId: string | null;
  bookingMethod: BookingMethod | null;
}

/**
 * «Continuar» del paso 1: desactivado hasta elegir servicio. Lleva a elegir día y clase, o día y hora
 * si el servicio se reserva por disponibilidad.
 */
export function ContinueToClassesButton({
  selectedServiceId,
  bookingMethod,
}: Readonly<ContinueToClassesButtonProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      label={i18n.t('booking.book.continueLabel')}
      isFullWidth
      isDisabled={selectedServiceId === null}
      onPress={() => {
        if (selectedServiceId === null) return;
        router.push({
          pathname: bookingMethod === 'hour' ? '/(client)/book/hour' : '/(client)/book/slot',
          params: { serviceId: selectedServiceId },
        });
      }}
    />
  );
}
