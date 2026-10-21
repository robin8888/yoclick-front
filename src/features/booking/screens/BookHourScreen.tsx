import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { LoadErrorState } from '@/features/join';
import type { ServiceListResponseDtoServicesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Text } from '@/ui/atoms/Text';
import { StepProgress } from '@/ui/molecules/StepProgress';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ReviewHourButton } from '../components/ReviewHourButton';
import { SlotChoiceBody } from '../components/SlotChoiceBody';
import { StaffChoiceChips } from '../components/StaffChoiceChips';
import { useBookSlotChoice } from '../hooks/useBookSlotChoice';
import { useCenterServices } from '../hooks/useCenterServices';
import { formatServiceDuration } from '../model/booking-labels';
import { hourRouteParamsSchema } from '../model/hour-route-params';
import { ANY_STAFF_CHOICE } from '../model/staff-choice';

const BOOKING_STEP_COUNT = 2;

/** Con más de una persona que lo da se puede elegir con quién; con una o ninguna no hay nada que elegir. */
function HourStep({
  service,
}: Readonly<{ service: ServiceListResponseDtoServicesItem }>): React.JSX.Element {
  const router = useRouter();
  const [staffChoice, setStaffChoice] = useState(ANY_STAFF_CHOICE);
  const choice = useBookSlotChoice(
    service.id,
    staffChoice === ANY_STAFF_CHOICE ? undefined : staffChoice,
  );

  return (
    <ScreenTemplate
      title={i18n.t('booking.hour.title')}
      subtitle={service.name}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={<ReviewHourButton serviceId={service.id} selectedSlot={choice.selectedSlot} />}
    >
      <StepProgress
        currentStep={BOOKING_STEP_COUNT}
        stepCount={BOOKING_STEP_COUNT}
        accessibilityLabel={i18n.t('booking.slot.stepLabel')}
      />
      {service.staff.length > 1 ? (
        <>
          <Text variant="titleMd">{i18n.t('booking.hour.staffLabel')}</Text>
          <StaffChoiceChips
            staff={service.staff}
            selectedChoice={staffChoice}
            onChoiceSelect={setStaffChoice}
            accessibilityLabel={i18n.t('booking.hour.staffLabel')}
          />
        </>
      ) : null}
      <SlotChoiceBody
        choice={choice}
        minNoticeLabel={formatServiceDuration(service.minNoticeMinutes)}
      />
    </ScreenTemplate>
  );
}

function BookHourContent({ serviceId }: Readonly<{ serviceId: string }>): React.JSX.Element {
  const services = useCenterServices();
  const service = services.data?.services.find((candidate) => candidate.id === serviceId);

  if (services.isError) {
    return (
      <LoadErrorState
        title={i18n.t('booking.slot.errorTitle')}
        error={services.error}
        onRetry={() => void services.refetch()}
        isRetrying={services.isFetching}
      />
    );
  }
  if (services.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (service === undefined) return <Redirect href="/(client)/(tabs)/book" />;
  return <HourStep service={service} />;
}

/**
 * Día y hora de un servicio que se reserva por disponibilidad (citas): las horas libres de quien lo da
 * las calcula el servidor. Los servicios con clases fijas del centro usan `BookSlotScreen`.
 */
export function BookHourScreen(): React.JSX.Element {
  const params = hourRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(client)/(tabs)/book" />;
  return <BookHourContent serviceId={params.data.serviceId} />;
}
