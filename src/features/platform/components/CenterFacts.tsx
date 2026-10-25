import { View } from 'react-native';

import { formatStorageSize } from '@/features/videos';
import type { PlatformCenterDetailResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { getPlanName } from '../model/plan-labels';
import {
  buildClientsLine,
  buildLastBookingLine,
  buildUsageLine,
  getStatusLabel,
  getStatusTone,
} from '../model/center-labels';
import { createFactsCardStyle, FACT_ROW_STYLE, FACTS_STYLE } from './CenterFacts.styles';

const PLATFORM_TIME_ZONE = 'Europe/Madrid';

interface CenterFactsProps {
  center: PlatformCenterDetailResponseDto;
}

function FactRow({ label, value }: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <View style={FACT_ROW_STYLE} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text color="ink2">{label}</Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

function FactsCard({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createFactsCardStyle(theme)}>
      <Text variant="overline" color="ink2">
        {title}
      </Text>
      {children}
    </View>
  );
}

function readModulesOff(center: PlatformCenterDetailResponseDto): string {
  if (center.disabledModules.length === 0) return i18n.t('platform.center.allModulesOn');
  return center.disabledModules
    .map((moduleId) => i18n.t(`centerAdmin.modules.${moduleId as 'content'}.title`))
    .join(', ');
}

function BusinessFacts({ center }: Readonly<CenterFactsProps>): React.JSX.Element {
  const stripeLabel = center.stripeChargesEnabled
    ? i18n.t('platform.center.stripeOn')
    : i18n.t('platform.center.stripeOff');

  return (
    <FactsCard title={i18n.t('platform.center.businessSection')}>
      <FactRow
        label={i18n.t('platform.center.sector')}
        value={i18n.t(`onboarding.sectors.${center.sectorId as 'gym'}`)}
      />
      <FactRow label={i18n.t('platform.center.city')} value={center.city ?? '—'} />
      <FactRow
        label={i18n.t('platform.center.createdAt')}
        value={formatShortDate(center.createdAt, PLATFORM_TIME_ZONE)}
      />
      <FactRow label={i18n.t('platform.center.timezone')} value={center.timezone} />
      <FactRow label={i18n.t('platform.center.stripe')} value={stripeLabel} />
    </FactsCard>
  );
}

function PlanFacts({ center }: Readonly<CenterFactsProps>): React.JSX.Element {
  const trialEnd =
    center.trialEndsAt === null
      ? i18n.t('platform.center.noTrial')
      : formatShortDate(center.trialEndsAt, PLATFORM_TIME_ZONE);
  const capLabel =
    center.maxClients === null ? i18n.t('platform.center.noCap') : String(center.maxClients);
  const videoLabel =
    center.videoStorageLimitBytes === null
      ? i18n.t('platform.center.noVideo')
      : formatStorageSize(center.videoStorageLimitBytes);

  return (
    <FactsCard title={i18n.t('platform.center.planSection')}>
      <FactRow label={i18n.t('platform.center.plan')} value={getPlanName(center.planId)} />
      <FactRow label={i18n.t('platform.center.trialEnd')} value={trialEnd} />
      <FactRow label={i18n.t('platform.center.clientCap')} value={capLabel} />
      <FactRow
        label={i18n.t('platform.center.documents')}
        value={formatStorageSize(center.documentStorageLimitBytes)}
      />
      <FactRow label={i18n.t('platform.center.video')} value={videoLabel} />
      <FactRow
        label={i18n.t('platform.center.photos')}
        value={formatStorageSize(center.photoStorageLimitBytes)}
      />
      <FactRow label={i18n.t('platform.center.modulesOff')} value={readModulesOff(center)} />
    </FactsCard>
  );
}

function UsageFacts({ center }: Readonly<CenterFactsProps>): React.JSX.Element {
  return (
    <FactsCard title={i18n.t('platform.center.usageSection')}>
      <Text variant="bodyStrong">{buildClientsLine(center)}</Text>
      <Text color="ink2">{buildUsageLine(center)}</Text>
      <Text color="ink2">{buildLastBookingLine(center.lastBookingAt)}</Text>
    </FactsCard>
  );
}

/** Los datos del centro, su plan y límites y su uso. Todo es de negocio: ningún dato de personas. */
export function CenterFacts({ center }: Readonly<CenterFactsProps>): React.JSX.Element {
  return (
    <View style={FACTS_STYLE}>
      <Badge label={getStatusLabel(center.status)} tone={getStatusTone(center.status)} />
      <BusinessFacts center={center} />
      <PlanFacts center={center} />
      <UsageFacts center={center} />
    </View>
  );
}
