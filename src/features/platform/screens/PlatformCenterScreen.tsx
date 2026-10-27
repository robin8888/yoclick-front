import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { z } from 'zod';

import { LoadErrorState } from '@/features/join';
import { resolveApiAssetUrl } from '@/shared/api/asset-url';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Avatar } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AuditEntryList } from '../components/AuditEntryList';
import { CenterActions } from '../components/CenterActions';
import { CenterFacts } from '../components/CenterFacts';
import { FLEXIBLE_TEXT_STYLE } from '../components/Panel.styles';
import { RecordChargeAction } from '../components/RecordChargeAction';
import { usePlatformAudit } from '../hooks/usePlatformAudit';
import { usePlatformCenter } from '../hooks/usePlatformCenter';

const routeParamsSchema = z.object({ centerId: z.uuid() });
const HISTORY_PAGE_SIZE = 10;
const CENTER_HEADING_STYLE = { flexDirection: 'row', alignItems: 'center', gap: 12 } as const;

function CenterHistory({ centerId }: Readonly<{ centerId: string }>): React.JSX.Element {
  const audit = usePlatformAudit({ centerId, limit: HISTORY_PAGE_SIZE });
  const entries = audit.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <>
      <Text variant="titleMd">{i18n.t('platform.center.historySection')}</Text>
      {entries.length === 0 ? (
        <Text color="ink2">{i18n.t('platform.center.noHistory')}</Text>
      ) : (
        <AuditEntryList entries={entries} />
      )}
    </>
  );
}

function CenterContent({ centerId }: Readonly<{ centerId: string }>): React.JSX.Element {
  const center = usePlatformCenter(centerId);

  if (center.isError) {
    return (
      <LoadErrorState
        title={i18n.t('platform.center.errorTitle')}
        error={center.error}
        onRetry={() => void center.refetch()}
        isRetrying={center.isFetching}
      />
    );
  }
  if (center.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  return (
    <>
      <View style={CENTER_HEADING_STYLE}>
        <Avatar
          name={center.data.name}
          photoUrl={resolveApiAssetUrl(center.data.logoUrl)}
          size="lg"
          isDecorative
        />
        <View style={FLEXIBLE_TEXT_STYLE}>
          <Text variant="titleLg">{center.data.name}</Text>
        </View>
      </View>
      <CenterFacts center={center.data} />
      <CenterActions center={center.data} />
      <RecordChargeAction center={center.data} />
      <CenterHistory centerId={centerId} />
    </>
  );
}

/** Un centro visto desde la plataforma: sus datos, plan, uso, acciones y el historial de cambios. */
export function PlatformCenterScreen(): React.JSX.Element {
  const router = useRouter();
  const params = routeParamsSchema.safeParse(useLocalSearchParams());

  if (!params.success) return <Redirect href="/(platform)/home" />;
  return (
    <ScreenTemplate
      hasPlatformHeroBackground
      title={i18n.t('platform.center.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      <CenterContent centerId={params.data.centerId} />
    </ScreenTemplate>
  );
}
