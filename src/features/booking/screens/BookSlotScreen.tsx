import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { StepProgress } from '@/ui/molecules/StepProgress';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ReviewBookingButton } from '../components/ReviewBookingButton';
import { SlotChoiceBody } from '../components/SlotChoiceBody';
import { useBookSlotChoice } from '../hooks/useBookSlotChoice';
import { useCenterServices } from '../hooks/useCenterServices';
import { formatServiceDuration } from '../model/booking-labels';
import { slotRouteParamsSchema, type SlotRouteParams } from '../model/booking-route-params';

const BOOKING_STEP_COUNT = 3;

function BookSlotContent({
  serviceId,
  staffMembershipId,
}: Readonly<SlotRouteParams>): React.JSX.Element {
  const router = useRouter();
  const choice = useBookSlotChoice(serviceId, staffMembershipId);
  const service = useCenterServices().data?.services.find(
    (candidate) => candidate.id === serviceId,
  );
  const staffName =
    staffMembershipId === undefined
      ? i18n.t('booking.staff.anyTitle')
      : service?.staff.find((member) => member.membershipId === staffMembershipId)?.fullName;

  return (
    <ScreenTemplate
      title={i18n.t('booking.slot.title')}
      subtitle={
        staffName === undefined
          ? i18n.t('booking.slot.subtitleWithoutStaff')
          : i18n.t('booking.slot.subtitle', { staffLabel: staffName })
      }
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={<ReviewBookingButton serviceId={serviceId} selectedSlot={choice.selectedSlot} />}
    >
      <StepProgress
        currentStep={BOOKING_STEP_COUNT}
        stepCount={BOOKING_STEP_COUNT}
        accessibilityLabel={i18n.t('booking.slot.stepLabel')}
      />
      <SlotChoiceBody
        choice={choice}
        minNoticeLabel={
          service === undefined ? null : formatServiceDuration(service.minNoticeMinutes)
        }
      />
    </ScreenTemplate>
  );
}

/** Prototipo `book3`: día y hora libres de quien se eligió. Los huecos los calcula el servidor. */
export function BookSlotScreen(): React.JSX.Element {
  const params = slotRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(client)/(tabs)/book" />;
  return <BookSlotContent {...params.data} />;
}
