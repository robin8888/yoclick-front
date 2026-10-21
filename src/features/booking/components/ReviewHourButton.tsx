import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

import type { SlotOption } from '../model/slot-option';

interface ReviewHourButtonProps {
  serviceId: string;
  selectedSlot: SlotOption | null;
}

/** «Revisar reserva»: desactivado hasta elegir una hora; lleva a la confirmación de esa hora. */
export function ReviewHourButton({
  serviceId,
  selectedSlot,
}: Readonly<ReviewHourButtonProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      label={i18n.t('booking.slot.continueLabel')}
      isFullWidth
      isDisabled={selectedSlot === null}
      onPress={() => {
        if (selectedSlot === null) return;
        router.push({
          pathname: '/(client)/book/hour-confirm',
          params: {
            serviceId,
            startsAt: selectedSlot.startsAt,
            staffMembershipId: selectedSlot.staffMembershipId,
            staffName: selectedSlot.staffName,
          },
        });
      }}
    />
  );
}
