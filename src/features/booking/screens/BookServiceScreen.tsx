import { useState } from 'react';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { StepProgress } from '@/ui/molecules/StepProgress';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ContinueToStaffButton } from '../components/ContinueToStaffButton';
import { ServiceOptionList } from '../components/ServiceOptionList';
import { useCenterServices } from '../hooks/useCenterServices';

const BOOKING_STEP_COUNT = 3;

/** Prototipo `book1`: paso 1 de 3, el servicio que se quiere reservar con su duración y precio. */
export function BookServiceScreen(): React.JSX.Element {
  const services = useCenterServices();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  return (
    <ScreenTemplate
      title={i18n.t('booking.book.title')}
      subtitle={i18n.t('booking.book.subtitle')}
      footer={<ContinueToStaffButton selectedServiceId={selectedServiceId} />}
    >
      <StepProgress
        currentStep={1}
        stepCount={BOOKING_STEP_COUNT}
        accessibilityLabel={i18n.t('booking.book.stepLabel')}
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
      {services.data === undefined ? null : (
        <ServiceOptionList
          services={services.data.services}
          selectedServiceId={selectedServiceId}
          onServiceSelect={setSelectedServiceId}
          onRetry={() => void services.refetch()}
        />
      )}
    </ScreenTemplate>
  );
}
