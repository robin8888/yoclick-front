import { useState } from 'react';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { usePlatformCharges } from '../hooks/usePlatformCharges';
import type { PlatformCharge } from '../model/charge-labels';
import {
  canShiftToNextPeriod,
  formatMonthLabel,
  getCurrentMonthKey,
  shiftMonth,
} from '../model/charge-period';
import { ChargeCard } from './ChargeCard';
import { ChargeEditSheet } from './ChargeEditSheet';
import { PeriodNavigator } from './PeriodNavigator';

const LIST_STYLE = { gap: 12 } as const;

interface ChargesTabProps {
  /** El `admin` cambia cobros; el gestor (`accountant`) solo los lee. */
  isReadOnly: boolean;
}

type ChargesQuery = ReturnType<typeof usePlatformCharges>;

/** Las tarjetas de cobros ya cargados, con «ver más» y la hoja de edición (solo para el `admin`). */
function ChargeEntries({
  charges,
  isReadOnly,
}: Readonly<{ charges: ChargesQuery; isReadOnly: boolean }>): React.JSX.Element {
  const [editedCharge, setEditedCharge] = useState<PlatformCharge | null>(null);
  const entries = charges.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      {entries.map((charge) => (
        <ChargeCard
          key={charge.id}
          charge={charge}
          {...(isReadOnly
            ? {}
            : {
                onEditPress: () => {
                  setEditedCharge(charge);
                },
              })}
        />
      ))}
      {charges.hasNextPage ? (
        <Button
          variant="outline"
          label={i18n.t('platform.charges.loadMore')}
          isLoading={charges.isFetchingNextPage}
          onPress={() => void charges.fetchNextPage()}
        />
      ) : null}
      <ChargeEditSheet
        charge={editedCharge}
        onDismiss={() => {
          setEditedCharge(null);
        }}
      />
    </>
  );
}

function ChargeList({
  monthKey,
  isReadOnly,
}: Readonly<{ monthKey: string; isReadOnly: boolean }>): React.JSX.Element {
  const charges = usePlatformCharges({ month: monthKey });
  const entries = charges.data?.pages.flatMap((page) => page.data) ?? [];

  if (charges.isError) {
    return (
      <LoadErrorState
        title={i18n.t('platform.charges.errorTitle')}
        error={charges.error}
        onRetry={() => void charges.refetch()}
        isRetrying={charges.isFetching}
      />
    );
  }
  if (charges.isPending) {
    return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  }
  if (entries.length === 0) {
    return (
      <EmptyState
        iconName="file"
        title={i18n.t('platform.charges.emptyTitle')}
        description={i18n.t(
          isReadOnly ? 'platform.charges.emptyReadOnly' : 'platform.charges.emptyDescription',
        )}
        actionLabel={i18n.t('platform.audit.refresh')}
        onActionPress={() => void charges.refetch()}
      />
    );
  }
  return <ChargeEntries charges={charges} isReadOnly={isReadOnly} />;
}

/** Los cobros de los planes mes a mes: lo que ha cobrado Yoclick a cada centro. */
export function ChargesTab({ isReadOnly }: Readonly<ChargesTabProps>): React.JSX.Element {
  const currentMonthKey = getCurrentMonthKey(new Date());
  const [monthKey, setMonthKey] = useState(currentMonthKey);

  return (
    <View style={LIST_STYLE}>
      <PeriodNavigator
        periodLabel={formatMonthLabel(monthKey)}
        canGoNext={canShiftToNextPeriod('month', monthKey, currentMonthKey)}
        onPreviousPress={() => {
          setMonthKey(shiftMonth(monthKey, -1));
        }}
        onNextPress={() => {
          setMonthKey(shiftMonth(monthKey, 1));
        }}
      />
      <ChargeList monthKey={monthKey} isReadOnly={isReadOnly} />
    </View>
  );
}
