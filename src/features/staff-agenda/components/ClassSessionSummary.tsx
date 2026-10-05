import { View } from 'react-native';

import type { AgendaResponseDtoEntriesItemBooking } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { formatTimerDuration } from '../model/session-timer';
import { createSummaryStyle, SUMMARY_ROW_STYLE } from './ClassSessionSummary.styles';

const SECONDS_PER_MINUTE = 60;

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: Readonly<SummaryRowProps>): React.JSX.Element {
  return (
    <View style={SUMMARY_ROW_STYLE}>
      <Text color="ink2">{label}</Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

interface ClassSessionSummaryProps {
  booking: AgendaResponseDtoEntriesItemBooking;
  timeZone: string;
}

/** Previsto frente a real: hora prevista, inicio y fin registrados y la duración real. */
export function ClassSessionSummary({
  booking,
  timeZone,
}: Readonly<ClassSessionSummaryProps>): React.JSX.Element {
  const theme = useTheme();
  const plannedSeconds = booking.service.durationMinutes * SECONDS_PER_MINUTE;

  return (
    <View style={createSummaryStyle(theme)}>
      <SummaryRow
        label={i18n.t('staffAgenda.session.plannedLabel')}
        value={`${formatTime24h(booking.startsAt, timeZone)}–${formatTime24h(booking.endsAt, timeZone)}`}
      />
      {booking.startedAt === null ? null : (
        <SummaryRow
          label={i18n.t('staffAgenda.session.startedLabel')}
          value={formatTime24h(booking.startedAt, timeZone)}
        />
      )}
      {booking.endedAt === null ? null : (
        <SummaryRow
          label={i18n.t('staffAgenda.session.endedLabel')}
          value={formatTime24h(booking.endedAt, timeZone)}
        />
      )}
      {booking.actualDurationSeconds === null ? null : (
        <SummaryRow
          label={i18n.t('staffAgenda.session.realDurationLabel')}
          value={i18n.t('staffAgenda.session.finishedSummary', {
            actual: formatTimerDuration(booking.actualDurationSeconds),
            planned: formatTimerDuration(plannedSeconds),
          })}
        />
      )}
    </View>
  );
}
