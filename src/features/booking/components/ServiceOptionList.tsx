import type { ServiceListResponseDtoServicesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { OptionCard } from '@/ui/molecules/OptionCard';

import { buildServiceMetaLabel } from '../model/booking-labels';

interface ServiceOptionListProps {
  services: readonly ServiceListResponseDtoServicesItem[];
  selectedServiceId: string | null;
  onServiceSelect: (serviceId: string) => void;
  onRetry: () => void;
  /** No escribe «Individual»: el centro elige aparte si la cita es privada o grupal. */
  isKindHidden?: boolean;
}

/** Los servicios reservables como opciones a elegir, o el vacío con reintento. */
export function ServiceOptionList({
  services,
  selectedServiceId,
  onServiceSelect,
  onRetry,
  isKindHidden = false,
}: Readonly<ServiceOptionListProps>): React.JSX.Element {
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
          description={service.description ?? undefined}
          isSelected={service.id === selectedServiceId}
          onPress={() => {
            onServiceSelect(service.id);
          }}
        />
      ))}
    </>
  );
}
