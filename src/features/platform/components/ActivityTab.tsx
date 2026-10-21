import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import { usePlatformAudit } from '../hooks/usePlatformAudit';
import { AuditEntryList } from './AuditEntryList';

const LIST_STYLE = { gap: 12 } as const;

interface ActivityTabProps {
  onCenterOpen: (centerId: string) => void;
}

/** Todo lo que se ha cambiado desde la administración: quién cambió qué y cuándo, lo último primero. */
export function ActivityTab({ onCenterOpen }: Readonly<ActivityTabProps>): React.JSX.Element {
  const audit = usePlatformAudit();
  const entries = audit.data?.pages.flatMap((page) => page.data) ?? [];

  if (audit.isError) {
    return (
      <LoadErrorState
        title={i18n.t('platform.audit.errorTitle')}
        error={audit.error}
        onRetry={() => void audit.refetch()}
        isRetrying={audit.isFetching}
      />
    );
  }
  if (audit.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (entries.length === 0) {
    return (
      <EmptyState
        iconName="clock"
        title={i18n.t('platform.audit.emptyTitle')}
        description={i18n.t('platform.audit.emptyDescription')}
        actionLabel={i18n.t('platform.audit.refresh')}
        onActionPress={() => void audit.refetch()}
      />
    );
  }
  return (
    <View style={LIST_STYLE}>
      <AuditEntryList entries={entries} onCenterOpen={onCenterOpen} />
      {audit.hasNextPage ? (
        <Button
          variant="outline"
          label={i18n.t('platform.audit.loadMore')}
          isLoading={audit.isFetchingNextPage}
          onPress={() => void audit.fetchNextPage()}
        />
      ) : null}
    </View>
  );
}
