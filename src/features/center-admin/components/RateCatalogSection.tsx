import { useState } from 'react';

import { LoadErrorState } from '@/features/join';
import type { RateListResponseDtoRatesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { useRateCatalog } from '../hooks/useRateCatalog';
import { RateRow } from './RateRow';
import { RemoveRateSheet } from './RemoveRateSheet';
import { SectionHeader } from './SectionHeader';

interface RateCatalogSectionProps {
  onNewRate: () => void;
}

/** Error con reintento, esqueleto mientras carga o vacío con la acción de crear el primero. */
function RateCatalogState({
  catalog,
  onNewRate,
}: Readonly<{
  catalog: ReturnType<typeof useRateCatalog>;
  onNewRate: () => void;
}>): React.JSX.Element {
  const isEmpty = catalog.isSuccess && catalog.data.rates.length === 0;

  return (
    <>
      {catalog.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {catalog.isError ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.passes.errorTitle')}
          error={catalog.error}
          onRetry={() => void catalog.refetch()}
          isRetrying={catalog.isFetching}
        />
      ) : null}
      {isEmpty ? (
        <EmptyState
          iconName="creditCard"
          title={i18n.t('centerAdmin.passes.emptyTitle')}
          description={i18n.t('centerAdmin.passes.emptyDescription')}
          actionLabel={i18n.t('centerAdmin.passes.newAction')}
          onActionPress={onNewRate}
        />
      ) : null}
    </>
  );
}

/** «Bonos a la venta»: la lista, con «Quitar» confirmado. */
export function RateCatalogSection({
  onNewRate,
}: Readonly<RateCatalogSectionProps>): React.JSX.Element {
  const catalog = useRateCatalog();
  const [rateToRemove, setRateToRemove] = useState<RateListResponseDtoRatesItem | null>(null);

  return (
    <>
      <SectionHeader
        title={i18n.t('centerAdmin.passes.ratesTitle')}
        actionLabel={i18n.t('centerAdmin.passes.newAction')}
        onActionPress={onNewRate}
      />
      <RateCatalogState catalog={catalog} onNewRate={onNewRate} />
      {(catalog.data?.rates ?? []).map((rate) => (
        <RateRow
          key={rate.id}
          rate={rate}
          onRemovePress={() => {
            setRateToRemove(rate);
          }}
        />
      ))}
      <RemoveRateSheet
        rate={rateToRemove}
        onClose={() => {
          setRateToRemove(null);
        }}
      />
    </>
  );
}
