import { useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import type { ServiceListResponseDtoServicesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ListItem } from '@/ui/molecules/ListItem';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useCenterServices } from '../hooks/useCenterServices';
import { formatServiceDuration, formatServicePrice } from '../model/booking-labels';

interface ServiceListProps {
  services: readonly ServiceListResponseDtoServicesItem[];
  onServiceSelect: (serviceId: string) => void;
  onRetry: () => void;
}

function ServiceList({
  services,
  onServiceSelect,
  onRetry,
}: Readonly<ServiceListProps>): React.JSX.Element {
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
        <ListItem
          key={service.id}
          title={service.name}
          subtitle={[
            formatServiceDuration(service.durationMinutes),
            formatServicePrice(service.priceCents) ?? i18n.t('booking.book.priceOnRequest'),
          ].join(' · ')}
          onPress={() => {
            onServiceSelect(service.id);
          }}
        />
      ))}
    </>
  );
}

/** Prototipo `book1`: el servicio que se quiere reservar, con su duración y su precio. */
export function BookServiceScreen(): React.JSX.Element {
  const router = useRouter();
  const services = useCenterServices();

  return (
    <ScreenTemplate title={i18n.t('booking.book.title')} subtitle={i18n.t('booking.book.subtitle')}>
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
        <ServiceList
          services={services.data.services}
          onServiceSelect={(serviceId) => {
            router.push({ pathname: '/(client)/book/slot', params: { serviceId } });
          }}
          onRetry={() => void services.refetch()}
        />
      )}
    </ScreenTemplate>
  );
}
