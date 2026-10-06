import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

import { ANY_STAFF_CHOICE } from '../model/booking-route-params';

interface ContinueToSlotButtonProps {
  serviceId: string;
  /** `ANY_STAFF_CHOICE` o el `membershipId` elegido. */
  staffChoice: string;
}

/** «Continuar» del paso 2: lleva a elegir día y hora, solo con las horas de quien se eligió. */
export function ContinueToSlotButton({
  serviceId,
  staffChoice,
}: Readonly<ContinueToSlotButtonProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      label={i18n.t('booking.staff.continueLabel')}
      isFullWidth
      onPress={() => {
        router.push({
          pathname: '/(client)/book/slot',
          params:
            staffChoice === ANY_STAFF_CHOICE
              ? { serviceId }
              : { serviceId, staffMembershipId: staffChoice },
        });
      }}
    />
  );
}
