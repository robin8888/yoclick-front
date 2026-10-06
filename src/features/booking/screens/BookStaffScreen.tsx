import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { StepProgress } from '@/ui/molecules/StepProgress';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ContinueToSlotButton } from '../components/ContinueToSlotButton';
import { StaffOptionList } from '../components/StaffOptionList';
import { useCenterServices } from '../hooks/useCenterServices';
import { ANY_STAFF_CHOICE, serviceRouteParamsSchema } from '../model/booking-route-params';

const BOOKING_STEP_COUNT = 3;

function BookStaffContent({ serviceId }: Readonly<{ serviceId: string }>): React.JSX.Element {
  const router = useRouter();
  const services = useCenterServices();
  const staffWord = getSectorVocabulary(useActiveCenterSectorId()).staff.singular;
  const [staffChoice, setStaffChoice] = useState(ANY_STAFF_CHOICE);
  const service = services.data?.services.find((candidate) => candidate.id === serviceId);

  return (
    <ScreenTemplate
      title={i18n.t('booking.staff.title', { staffWord })}
      subtitle={i18n.t('booking.staff.subtitle', { serviceName: service?.name ?? '' })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={<ContinueToSlotButton serviceId={serviceId} staffChoice={staffChoice} />}
    >
      <StepProgress
        currentStep={2}
        stepCount={BOOKING_STEP_COUNT}
        accessibilityLabel={i18n.t('booking.staff.stepLabel')}
      />
      {services.isError ? (
        <LoadErrorState
          title={i18n.t('booking.book.errorTitle')}
          error={services.error}
          onRetry={() => void services.refetch()}
          isRetrying={services.isFetching}
        />
      ) : null}
      {services.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {service === undefined ? null : (
        <StaffOptionList
          staff={service.staff}
          selectedChoice={staffChoice}
          onChoiceSelect={setStaffChoice}
        />
      )}
    </ScreenTemplate>
  );
}

/** Prototipo `book2`: paso 2 de 3, con quién se quiere la cita (o «Cualquiera disponible»). */
export function BookStaffScreen(): React.JSX.Element {
  const params = serviceRouteParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(client)/(tabs)/book" />;
  return <BookStaffContent serviceId={params.data.serviceId} />;
}
