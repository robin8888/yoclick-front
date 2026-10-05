import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { SlotChoiceBody } from '../components/SlotChoiceBody';
import { useBookSlotChoice } from '../hooks/useBookSlotChoice';
import { useCenterServices } from '../hooks/useCenterServices';
import { serviceRouteParamsSchema } from '../model/booking-route-params';

interface BookSlotContentProps {
  serviceId: string;
}

function BookSlotContent({ serviceId }: Readonly<BookSlotContentProps>): React.JSX.Element {
  const router = useRouter();
  const choice = useBookSlotChoice(serviceId);
  const serviceName = useCenterServices().data?.services.find(
    (service) => service.id === serviceId,
  )?.name;
  const { selectedSlot } = choice;

  function goToConfirmation(): void {
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
  }

  return (
    <ScreenTemplate
      title={i18n.t('booking.slot.title')}
      subtitle={serviceName}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <Button
          label={i18n.t('booking.slot.continueLabel')}
          isFullWidth
          isDisabled={selectedSlot === null}
          onPress={goToConfirmation}
        />
      }
    >
      <SlotChoiceBody choice={choice} />
    </ScreenTemplate>
  );
}

/** Prototipo `book3`: día y hora libres. Los huecos los calcula el servidor. */
export function BookSlotScreen(): React.JSX.Element {
  const params = serviceRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(client)/(tabs)/book" />;
  return <BookSlotContent serviceId={params.data.serviceId} />;
}
