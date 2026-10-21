import type { ServiceListResponseDtoServicesItem } from '@/shared/api/generated/model';
import { useActiveCenterModules } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { OptionCard } from '@/ui/molecules/OptionCard';

import { getBookingMethod } from '../model/booking-method';
import { buildServiceMetaLabel } from '../model/booking-labels';
import { describeServiceSchedules } from '../model/service-schedule-labels';

interface ServiceOptionListProps {
  services: readonly ServiceListResponseDtoServicesItem[];
  selectedServiceId: string | null;
  onServiceSelect: (serviceId: string) => void;
  onRetry: () => void;
  /** No escribe «Individual»: el centro elige aparte si la cita es privada o grupal. */
  isKindHidden?: boolean;
}

/** Lo que dice el servicio de sí mismo y, debajo, cuándo y dónde se da. */
function buildDescription(service: ServiceListResponseDtoServicesItem): string | undefined {
  const lines = [service.description ?? '', ...describeServiceSchedules(service.schedules)];
  const text = lines.filter((line) => line !== '').join('\n');
  return text === '' ? undefined : text;
}

/** Los servicios reservables como opciones a elegir, o el vacío con reintento. */
export function ServiceOptionList({
  services,
  selectedServiceId,
  onServiceSelect,
  onRetry,
  isKindHidden = false,
}: Readonly<ServiceOptionListProps>): React.JSX.Element {
  // Con salas, un servicio en grupo solo se reserva cuando el centro le ha dado sala y horario; uno
  // individual se reserva por hora libre.
  const isRoomsModuleOn = useActiveCenterModules().rooms;
  if (services.length === 0) {
    return (
      <EmptyState
        iconName="calendar"
        title={i18n.t('booking.book.emptyTitle')}
        description={i18n.t('booking.book.emptyDescription')}
        actionLabel={getSharedStateCopy().retryLabel}
        onActionPress={onRetry}
      />
    );
  }
  return (
    <>
      {services.map((service) => (
        <OptionCard
          key={service.id}
          title={service.name}
          meta={buildServiceMetaLabel(service, { isKindHidden })}
          description={buildDescription(service)}
          isSelected={service.id === selectedServiceId}
          isDisabled={getBookingMethod(service, { isRoomsModuleOn }) === 'unavailable'}
          disabledReason={i18n.t('booking.book.noScheduleYet')}
          onPress={() => {
            onServiceSelect(service.id);
          }}
        />
      ))}
    </>
  );
}
