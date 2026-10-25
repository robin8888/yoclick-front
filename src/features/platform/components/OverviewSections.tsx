import { View } from 'react-native';

import type { PlatformOverviewResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import { MetricCard } from './MetricCard';
import { METRIC_GRID_STYLE } from './MetricCard.styles';
import { MonthlyBars } from './MonthlyBars';
import { SectorBars } from './SectorBars';
import { StatusDistribution } from './StatusDistribution';

const SECTIONS_STYLE = { gap: 16 } as const;

interface OverviewSectionsProps {
  overview: PlatformOverviewResponseDto;
}

/** Lo que pide acción: centros que no pagan, suspendidos y pruebas a punto de acabar. */
function AttentionMetrics({ overview }: Readonly<OverviewSectionsProps>): React.JSX.Element {
  const { centers } = overview;

  return (
    <View style={METRIC_GRID_STYLE}>
      <MetricCard
        label={i18n.t('platform.status.past_due')}
        value={centers.byStatus.past_due}
        iconName="alertTriangle"
        tone="warning"
      />
      <MetricCard
        label={i18n.t('platform.status.suspended')}
        value={centers.byStatus.suspended}
        iconName="xCircle"
        tone="danger"
      />
      <MetricCard
        label={i18n.t('platform.overview.trialsEnding')}
        value={centers.trialsEndingWithin7Days}
        iconName="clock"
        tone="warning"
      />
      <MetricCard
        label={i18n.t('platform.overview.newLast30Days')}
        value={centers.newLast30Days}
        iconName="plus"
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
        iconName="users"
      />
      <MetricCard
        label={i18n.t('platform.overview.teamMembers')}
        value={overview.people.activeTeamMembers}
        iconName="user"
      />
      <MetricCard
        label={i18n.t('platform.overview.bookings30Days')}
        value={overview.bookingsLast30Days}
        iconName="calendar"
        isFeatured
      />
    </View>
  );
}

/** El resumen de la plataforma: centros, avisos, uso, evolución mensual y reparto por tipo. */
export function OverviewSections({ overview }: Readonly<OverviewSectionsProps>): React.JSX.Element {
  return (
    <View style={SECTIONS_STYLE}>
      <MetricCard
        label={i18n.t('platform.overview.total')}
        value={overview.centers.total}
        iconName="home"
        isFeatured
      />
      <StatusDistribution byStatus={overview.centers.byStatus} />
      <Text variant="titleMd">{i18n.t('platform.overview.attentionTitle')}</Text>
      <AttentionMetrics overview={overview} />
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
      <SectorBars sectors={overview.centersBySector} />
      <Text variant="caption" color="ink2">
        {i18n.t('platform.privacyNote')}
      </Text>
    </View>
  );
}
