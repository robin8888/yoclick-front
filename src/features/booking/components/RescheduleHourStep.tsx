import { useRouter } from 'expo-router';
import { AccessibilityInfo } from 'react-native';

import { i18n } from '@/shared/i18n';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { ProblemModal } from '@/ui/organisms/ProblemModal';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useBookSlotChoice } from '../hooks/useBookSlotChoice';
import { useCenterServices } from '../hooks/useCenterServices';
import { useRescheduleHourBooking } from '../hooks/useRescheduleHourBooking';
import {
  DEFAULT_CENTER_TIME_ZONE,
  formatBookingDayAndTime,
  formatServiceDuration,
} from '../model/booking-labels';
import type { RescheduleRouteParams } from '../model/booking-route-params';
import { SlotChoiceBody } from './SlotChoiceBody';

/** Pide el cambio al servidor y, cuando lo confirma, vuelve a «Mis citas» anunciándolo. */
function useMoveToHour(params: RescheduleRouteParams, selectedStartsAt: string | undefined) {
  const router = useRouter();
  const reschedule = useRescheduleHourBooking();

  return {
    ...reschedule,
    confirmMove: () => {
      if (selectedStartsAt === undefined) return;
      reschedule.rescheduleToHour(
        { bookingId: params.bookingId, startsAt: selectedStartsAt },
        () => {
          AccessibilityInfo.announceForAccessibility(i18n.t('booking.reschedule.hourAnnouncement'));
          router.dismissTo('/(client)/(tabs)/bookings');
        },
      );
    },
  };
}

/** «2 h»: antelación mínima del servicio; `null` mientras no se conoce. */
function useMinNoticeLabel(serviceId: string): string | null {
  const service = useCenterServices().data?.services.find(
    (candidate) => candidate.id === serviceId,
  );
  return service === undefined ? null : formatServiceDuration(service.minNoticeMinutes);
}

/** Elegir otra hora libre de la misma persona y pasar a ella la cita. */
export function RescheduleHourStep({
  params,
}: Readonly<{ params: RescheduleRouteParams }>): React.JSX.Element {
  const router = useRouter();
  const choice = useBookSlotChoice(params.serviceId, params.staffMembershipId);
  const move = useMoveToHour(params, choice.selectedSlot?.startsAt);
  const minNoticeLabel = useMinNoticeLabel(params.serviceId);

  return (
    <ScreenTemplate
      title={i18n.t('booking.reschedule.hourTitle')}
      subtitle={i18n.t('booking.reschedule.subtitle', {
        serviceName: params.serviceName,
        whenLabel: formatBookingDayAndTime(params.startsAt, DEFAULT_CENTER_TIME_ZONE),
      })}
      isLoading={move.isRescheduling}
      loadingLabel={getSharedStateCopy().loadingLabel}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={
        <Button
          label={i18n.t('booking.reschedule.confirmLabel')}
          isFullWidth
          isDisabled={choice.selectedSlot === null}
          isLoading={move.isRescheduling}
          onPress={move.confirmMove}
        />
      }
    >
      <ProblemModal
        message={move.rescheduleErrorMessage}
        onDismiss={move.clearError}
        {...getProblemModalCopy()}
      />
      <SlotChoiceBody choice={choice} minNoticeLabel={minNoticeLabel} />
    </ScreenTemplate>
  );
}
