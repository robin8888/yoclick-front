import { View } from 'react-native';

import type { PlatformOverviewResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { MetricCard } from './MetricCard';
import { METRIC_GRID_STYLE } from './MetricCard.styles';
import { MonthlyBars } from './MonthlyBars';

const SECTIONS_STYLE = { gap: 16 } as const;
const SECTOR_LIST_STYLE = { gap: 4 } as const;

interface OverviewSectionsProps {
  overview: PlatformOverviewResponseDto;
}

function CenterMetrics({ overview }: Readonly<OverviewSectionsProps>): React.JSX.Element {
  const { centers } = overview;

  return (
    <View style={METRIC_GRID_STYLE}>
      <MetricCard label={i18n.t('platform.overview.total')} value={centers.total} />
      <MetricCard label={i18n.t('platform.status.active')} value={centers.byStatus.active} />
      <MetricCard label={i18n.t('platform.status.trial')} value={centers.byStatus.trial} />
      <MetricCard label={i18n.t('platform.status.past_due')} value={centers.byStatus.past_due} />
      <MetricCard label={i18n.t('platform.status.suspended')} value={centers.byStatus.suspended} />
      <MetricCard label={i18n.t('platform.overview.newLast30Days')} value={centers.newLast30Days} />
      <MetricCard
        label={i18n.t('platform.overview.trialsEnding')}
        value={centers.trialsEndingWithin7Days}
      />
    </View>
  );
}

function UsageMetrics({ overview }: Readonly<OverviewSectionsProps>): React.JSX.Element {
  return (
    <View style={METRIC_GRID_STYLE}>
      <MetricCard
        label={i18n.t('platform.overview.activeClients')}
        value={overview.people.activeClients}
      />
      <MetricCard
        label={i18n.t('platform.overview.teamMembers')}
        value={overview.people.activeTeamMembers}
      />
      <MetricCard
        label={i18n.t('platform.overview.bookings30Days')}
        value={overview.bookingsLast30Days}
      />
    </View>
  );
}

function SectorList({ overview }: Readonly<OverviewSectionsProps>): React.JSX.Element {
  return (
    <View style={SECTOR_LIST_STYLE}>
      <Text variant="bodyStrong">{i18n.t('platform.overview.sectorsTitle')}</Text>
      {overview.centersBySector.map(({ sectorId, count }) => {
        const sectorLabel = i18n.t(`onboarding.sectors.${sectorId as 'gym'}`);
        return (
          <Text key={sectorId} color="ink2">
            {`${sectorLabel}: ${String(count)}`}
          </Text>
        );
      })}
    </View>
  );
}

/** El resumen de la plataforma: centros, uso, evolución mensual y reparto por tipo. */
export function OverviewSections({ overview }: Readonly<OverviewSectionsProps>): React.JSX.Element {
  return (
    <View style={SECTIONS_STYLE}>
      <Text variant="titleMd">{i18n.t('platform.overview.centersTitle')}</Text>
      <CenterMetrics overview={overview} />
      <Text variant="titleMd">{i18n.t('platform.overview.usageTitle')}</Text>
      <UsageMetrics overview={overview} />
      <MonthlyBars
        title={i18n.t('platform.overview.monthlyCentersTitle')}
        months={overview.monthly.newCenters}
      />
      <MonthlyBars
        title={i18n.t('platform.overview.monthlyBookingsTitle')}
        months={overview.monthly.bookings}
      />
      <SectorList overview={overview} />
      <Text variant="caption" color="ink2">
        {i18n.t('platform.privacyNote')}
      </Text>
    </View>
  );
}
