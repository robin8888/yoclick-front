import { useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

import { serviceListRouteParamsSchema } from '../model/booking-route-params';

interface ContinueToStaffButtonProps {
  selectedServiceId: string | null;
}

/**
 * «Continuar» del paso 1: desactivado hasta elegir servicio; lleva a elegir quién. Si se llegó desde el
 * perfil de una persona del equipo, ya se sabe con quién y se va directo a elegir día y hora.
 */
export function ContinueToStaffButton({
  selectedServiceId,
}: Readonly<ContinueToStaffButtonProps>): React.JSX.Element {
  const router = useRouter();
  const preferredStaffMembershipId =
    serviceListRouteParamsSchema.safeParse(useLocalSearchParams()).data?.staffMembershipId;

  return (
    <Button
      label={i18n.t('booking.book.continueLabel')}
      isFullWidth
      isDisabled={selectedServiceId === null}
      onPress={() => {
        if (selectedServiceId === null) return;
        if (preferredStaffMembershipId !== undefined) {
          router.push({
            pathname: '/(client)/book/slot',
            params: { serviceId: selectedServiceId, staffMembershipId: preferredStaffMembershipId },
          });
          return;
        }
        router.push({ pathname: '/(client)/book/staff', params: { serviceId: selectedServiceId } });
      }}
    />
  );
}
