import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { AccessibilityInfo } from 'react-native';

import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { SlotChoiceBody } from '../components/SlotChoiceBody';
import { useBookSlotChoice } from '../hooks/useBookSlotChoice';
import { useCenterServices } from '../hooks/useCenterServices';
import { useRescheduleBooking } from '../hooks/useRescheduleBooking';
import {
  DEFAULT_CENTER_TIME_ZONE,
  formatBookingDayAndTime,
  formatServiceDuration,
} from '../model/booking-labels';
import {
  rescheduleRouteParamsSchema,
  type RescheduleRouteParams,
} from '../model/booking-route-params';

/** Pide el cambio al servidor y, cuando lo confirma, vuelve a «Mis citas» anunciándolo. */
function useConfirmReschedule(
  bookingId: string,
  selectedStartsAt: string | undefined,
): { confirmReschedule: () => void; isRescheduling: boolean; errorMessage: string | null } {
  const router = useRouter();
  const reschedule = useRescheduleBooking();

  return {
    confirmReschedule: () => {
      if (selectedStartsAt === undefined) return;
      reschedule.rescheduleBooking({ bookingId, startsAt: selectedStartsAt }, () => {
        AccessibilityInfo.announceForAccessibility(i18n.t('booking.reschedule.announcement'));
        router.dismissTo('/(client)/(tabs)/bookings');
      });
    },
    isRescheduling: reschedule.isRescheduling,
    errorMessage: reschedule.rescheduleErrorMessage,
  };
}

function buildSubtitle(params: RescheduleRouteParams): string {
  return i18n.t('booking.reschedule.subtitle', {
    serviceName: params.serviceName,
    whenLabel: formatBookingDayAndTime(params.startsAt, DEFAULT_CENTER_TIME_ZONE),
  });
}

function RescheduleBookingContent({
  params,
}: Readonly<{ params: RescheduleRouteParams }>): React.JSX.Element {
  const router = useRouter();
  const choice = useBookSlotChoice(params.serviceId, params.staffMembershipId);
  const reschedule = useConfirmReschedule(params.bookingId, choice.selectedSlot?.startsAt);
  const service = useCenterServices().data?.services.find(
    (candidate) => candidate.id === params.serviceId,
  );

  return (
    <ScreenTemplate
      title={i18n.t('booking.reschedule.title')}
      subtitle={buildSubtitle(params)}
      isLoading={reschedule.isRescheduling}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <Button
          label={i18n.t('booking.reschedule.confirmLabel')}
          isFullWidth
          isDisabled={choice.selectedSlot === null}
          isLoading={reschedule.isRescheduling}
          onPress={reschedule.confirmReschedule}
        />
      }
    >
      {reschedule.errorMessage === null ? null : (
        <FormErrorBanner message={reschedule.errorMessage} />
      )}
      <SlotChoiceBody
        choice={choice}
        minNoticeLabel={
          service === undefined ? null : formatServiceDuration(service.minNoticeMinutes)
        }
      />
    </ScreenTemplate>
  );
}

/** Cambiar la hora de una cita: mismos días y horas libres que al reservar, con confirmación directa. */
export function RescheduleBookingScreen(): React.JSX.Element {
  const params = rescheduleRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(client)/(tabs)/bookings" />;
  return <RescheduleBookingContent params={params.data} />;
}
