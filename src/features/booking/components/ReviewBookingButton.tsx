import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

import type { SlotOption } from './SlotGrid';

interface ReviewBookingButtonProps {
  serviceId: string;
  selectedSlot: SlotOption | null;
}

/** «Revisar reserva» del paso 2: desactivado hasta elegir una hora; lleva a la confirmación. */
export function ReviewBookingButton({
  serviceId,
  selectedSlot,
}: Readonly<ReviewBookingButtonProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      label={i18n.t('booking.slot.continueLabel')}
      isFullWidth
      isDisabled={selectedSlot === null}
      onPress={() => {
        if (selectedSlot === null) return;
        router.push({
          pathname: '/(client)/book/confirm',
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
