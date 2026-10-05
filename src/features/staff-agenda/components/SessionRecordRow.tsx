import { View } from 'react-native';

import type { SessionRecordsResponseDtoRecordsItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatShortDate } from '@/shared/lib/format/format-short-date';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Badge, type BadgeTone } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import { formatTimerDuration } from '../model/session-timer';
import { createRecordRowStyle, RECORD_HEADER_STYLE } from './SessionRecordRow.styles';

interface RecordStatus {
  labelKey: 'statusOpen' | 'statusClosed' | 'statusMissing';
  tone: BadgeTone;
}

function resolveRecordStatus(record: SessionRecordsResponseDtoRecordsItem): RecordStatus {
  if (record.isOpen) return { labelKey: 'statusOpen', tone: 'warning' };
  if (record.booking.startedAt === null) return { labelKey: 'statusMissing', tone: 'neutral' };
  return { labelKey: 'statusClosed', tone: 'success' };
}

interface SessionRecordRowProps {
  record: SessionRecordsResponseDtoRecordsItem;
  timeZone: string;
}

/** Una clase del registro: quién, cuándo y su duración real frente a la prevista. */
export function SessionRecordRow({
  record,
  timeZone,
}: Readonly<SessionRecordRowProps>): React.JSX.Element {
  const theme = useTheme();
  const status = resolveRecordStatus(record);
  const planned = formatTimerDuration(record.plannedDurationSeconds);
  const durationText =
    record.actualDurationSeconds === null
      ? i18n.t('staffAgenda.records.plannedOnly', { planned })
      : i18n.t('staffAgenda.records.realVersusPlanned', {
          actual: formatTimerDuration(record.actualDurationSeconds),
          planned,
        });

  return (
    <View style={createRecordRowStyle(theme)}>
      <View style={RECORD_HEADER_STYLE}>
        <Text variant="bodyStrong">{record.booking.service.name}</Text>
        <Badge label={i18n.t(`staffAgenda.records.${status.labelKey}`)} tone={status.tone} />
      </View>
      <Text color="ink2">
        {`${formatShortDate(record.booking.startsAt, timeZone)} · ${formatTime24h(record.booking.startsAt, timeZone)}`}
      </Text>
      <Text color="ink2">{`${record.staff.fullName} → ${record.client.fullName}`}</Text>
      <Text variant="caption" color="ink2">
        {durationText}
      </Text>
    </View>
  );
}
