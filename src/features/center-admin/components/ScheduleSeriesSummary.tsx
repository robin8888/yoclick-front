import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { describeSeriesPeriod, type ScheduleSeries } from '../model/schedule-summary';
import { createAdminCardStyle } from './AdminCard.styles';

const SUMMARY_STYLE = { flexDirection: 'column', alignItems: 'stretch', gap: 6 } as const;

function SummaryLine({
  label,
  value,
}: Readonly<{ label: string; value: string }>): React.JSX.Element {
  return (
    <Text>
      <Text color="ink2">{`${label}: `}</Text>
      {value}
    </Text>
  );
}

/** Servicio, espacio, profesor, modo, plazas y periodo de un horario; «Terminado» si ya no sigue. */
export function ScheduleSeriesSummary({
  series,
}: Readonly<{ series: ScheduleSeries }>): React.JSX.Element {
  const theme = useTheme();
  const modeLabel = i18n.t(
    series.mode === 'group'
      ? 'centerAdmin.schedules.modeGroup'
      : 'centerAdmin.schedules.modePrivate',
  );

  return (
    <View style={[createAdminCardStyle(theme), SUMMARY_STYLE]}>
      {series.status === 'ended' ? (
        <Badge label={i18n.t('centerAdmin.schedules.statusEnded')} tone="neutral" />
      ) : null}
      <SummaryLine
        label={i18n.t('centerAdmin.schedules.summaryService')}
        value={series.service.name}
      />
      <SummaryLine
        label={i18n.t('centerAdmin.schedules.summaryRoom')}
        value={series.room?.name ?? i18n.t('centerAdmin.schedules.noRoom')}
      />
      <SummaryLine
        label={i18n.t('centerAdmin.schedules.summaryTeacher')}
        value={series.staff.fullName}
      />
      <SummaryLine label={i18n.t('centerAdmin.schedules.summaryMode')} value={modeLabel} />
      <SummaryLine
        label={i18n.t('centerAdmin.schedules.summaryCapacity')}
        value={String(series.capacity)}
      />
      <SummaryLine
        label={i18n.t('centerAdmin.schedules.summaryPeriod')}
        value={describeSeriesPeriod(series)}
      />
    </View>
  );
}
