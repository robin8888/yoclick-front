import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { useBackAction } from '@/shared/hooks/useBackAction';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { StepProgress } from '@/ui/molecules/StepProgress';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ActingForSelector } from '@/features/guardians';

import { ContinueToClassesButton } from '../components/ContinueToClassesButton';
import { ServiceOptionList } from '../components/ServiceOptionList';
import { useCenterServices } from '../hooks/useCenterServices';
import { useServiceChoice } from '../hooks/useServiceChoice';

const BOOKING_STEP_COUNT = 2;

interface ServicesStepBodyProps {
  services: ReturnType<typeof useCenterServices>;
  selectedServiceId: string | null;
  onServiceSelect: (serviceId: string) => void;
}

/** Los tres estados de la lista: error con reintento, cargando y los servicios a elegir. */
function ServicesStepBody({
  services,
  selectedServiceId,
  onServiceSelect,
}: Readonly<ServicesStepBodyProps>): React.JSX.Element {
  return (
    <>
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
          onServiceSelect={onServiceSelect}
          onRetry={() => void services.refetch()}
        />
      )}
    </>
  );
}

/** Prototipo `book1`: paso 1 de 3, el servicio que se quiere reservar con su duración y precio. */
export function BookServiceScreen(): React.JSX.Element {
  const onBackPress = useBackAction();
  const services = useCenterServices();
  const { selectedServiceId, bookingMethod, selectService } = useServiceChoice(
    services.data?.services,
  );

  return (
    <ScreenTemplate
      onBackPress={onBackPress}
      title={i18n.t('booking.book.title')}
      subtitle={i18n.t('booking.book.subtitle')}
      footer={
        <ContinueToClassesButton
          selectedServiceId={selectedServiceId}
          bookingMethod={bookingMethod}
        />
      }
    >
      <ActingForSelector />
      <StepProgress
        currentStep={1}
        stepCount={BOOKING_STEP_COUNT}
        accessibilityLabel={i18n.t('booking.book.stepLabel')}
      />
      <ServicesStepBody
        services={services}
        selectedServiceId={selectedServiceId}
        onServiceSelect={selectService}
      />
    </ScreenTemplate>
  );
}
