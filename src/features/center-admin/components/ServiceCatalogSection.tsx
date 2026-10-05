import { LoadErrorState } from '@/features/join';
import type { ServiceListResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Text } from '@/ui/atoms/Text';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import type { useServiceCatalog } from '../hooks/useServiceCatalog';
import { SectionHeader } from './SectionHeader';
import { ServiceRow } from './ServiceRow';

interface ServiceCatalogSectionProps {
  catalog: ReturnType<typeof useServiceCatalog>;
  onServiceOpen: (serviceId: string) => void;
  onNewService: () => void;
}

interface ServiceListProps {
  catalogData: ServiceListResponseDto;
  onServiceOpen: (serviceId: string) => void;
  onNewService: () => void;
}

function ServiceList({
  catalogData,
  onServiceOpen,
  onNewService,
}: Readonly<ServiceListProps>): React.JSX.Element {
  if (catalogData.services.length === 0) {
    return (
      <EmptyState
        iconName="calendar"
        title={i18n.t('centerAdmin.services.emptyTitle')}
        description={i18n.t('centerAdmin.services.emptyDescription')}
        actionLabel={i18n.t('centerAdmin.services.newAction')}
        onActionPress={onNewService}
      />
    );
  }
  return (
    <>
      {catalogData.services.map((service) => (
        <ServiceRow
          key={service.id}
          service={service}
          onPress={() => {
            onServiceOpen(service.id);
          }}
        />
      ))}
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.services.editHint')}
      </Text>
    </>
  );
}

/** «Servicios» de `asvc`: carga, error con reintento, vacío o la lista del catálogo. */
export function ServiceCatalogSection({
  catalog,
  onServiceOpen,
  onNewService,
}: Readonly<ServiceCatalogSectionProps>): React.JSX.Element {
  return (
    <>
      <SectionHeader
        title={i18n.t('centerAdmin.services.listTitle')}
        actionLabel={i18n.t('centerAdmin.services.newAction')}
        onActionPress={onNewService}
      />
      {catalog.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {catalog.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.services.errorTitle')}
          error={catalog.error}
          onRetry={() => void catalog.refetch()}
          isRetrying={catalog.isFetching}
        />
      ) : null}
      {catalog.data === undefined ? null : (
        <ServiceList
          catalogData={catalog.data}
          onServiceOpen={onServiceOpen}
          onNewService={onNewService}
        />
      )}
    </>
  );
}
