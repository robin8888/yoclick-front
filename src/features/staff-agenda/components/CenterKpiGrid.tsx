import { View } from 'react-native';

import type { DaySummaryResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';

import { formatOccupancyLabel } from '../model/center-kpi-captions';
import { createKpiGridStyle } from './CenterKpiGrid.styles';
import { KpiCard } from './KpiCard';

interface CenterKpiGridProps {
  scheduledCount: number;
  cancelledCount: number;
  /** Cuántas citas más o menos que el mismo día de la semana pasada; `null` mientras carga. */
  scheduledDifference: string | null;
  weekdayName: string;
  /** Ocupación y clientes; `undefined` mientras carga o si falla. */
  summary: DaySummaryResponseDto | undefined;
}

function buildScheduledCaption(
  scheduledDifference: string | null,
  weekdayName: string,
): string | undefined {
  if (scheduledDifference === null) return undefined;
  return i18n.t('staffAgenda.center.sinceLastWeek', {
    difference: scheduledDifference,
    weekdayName,
  });
}

function buildActiveClientsCaption(summary: DaySummaryResponseDto | undefined): string | undefined {
  if (summary === undefined) return undefined;
  return i18n.t('staffAgenda.center.activeClients', { count: summary.activeClientCount });
}

/** Prototipo `aagenda`: citas hoy, ocupación, cancelaciones y altas de la semana. */
export function CenterKpiGrid({
  scheduledCount,
  cancelledCount,
  scheduledDifference,
  weekdayName,
  summary,
}: Readonly<CenterKpiGridProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createKpiGridStyle(theme)}>
      <KpiCard
        label={i18n.t('staffAgenda.center.scheduledLabel')}
        value={String(scheduledCount)}
        caption={buildScheduledCaption(scheduledDifference, weekdayName)}
      />
      <KpiCard
        label={i18n.t('staffAgenda.center.occupancyLabel')}
        value={formatOccupancyLabel(summary?.occupancyPercent)}
        progressPercent={summary?.occupancyPercent ?? 0}
      />
      <KpiCard label={i18n.t('staffAgenda.center.cancelledLabel')} value={String(cancelledCount)} />
      <KpiCard
        label={i18n.t('staffAgenda.center.newClientsLabel')}
        value={
          summary === undefined ? formatOccupancyLabel(null) : String(summary.newClientsThisWeek)
        }
        caption={buildActiveClientsCaption(summary)}
      />
    </View>
  );
}
