import { Pressable, View } from 'react-native';

import type { TimeEntryResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import { describeWorkDate } from '../model/describe-work-date';
import type { WorkDay } from '../model/group-entries-by-day';
import { formatWorkedMinutes } from '../model/worked-time';
import {
  createDateBlockStyle,
  createDayBodyStyle,
  createDayCardStyle,
  createDayHeaderStyle,
  createEntryBadgesStyle,
  createEntryMainStyle,
  createEntryRowStyle,
  createRangeRowStyle,
  createStatusDotStyle,
} from './TimeClock.styles';

interface TimeEntryRowProps {
  entry: TimeEntryResponseDto;
  timeZone: string;
  onPress: () => void;
}

function describeEntryRange(entry: TimeEntryResponseDto, timeZone: string): string {
  const inTime = formatTime24h(entry.clockInAt, timeZone);
  if (entry.clockOutAt === null) return i18n.t('timeClock.entryOpen', { inTime });
  return i18n.t('timeClock.entryRange', {
    inTime,
    outTime: formatTime24h(entry.clockOutAt, timeZone),
  });
}

/** Un fichaje: de qué hora a qué hora, con su estado en palabra; al pulsarlo se corrige. */
function TimeEntryRow({
  entry,
  timeZone,
  onPress,
}: Readonly<TimeEntryRowProps>): React.JSX.Element {
  const theme = useTheme();
  const range = describeEntryRange(entry, timeZone);
  const hasBadges = entry.isOpen || entry.isEdited;

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${range}. ${i18n.t('timeClock.editor.editTitle')}`}
      onPress={onPress}
      style={createEntryRowStyle(theme)}
    >
      <View style={createEntryMainStyle(theme)}>
        <View style={createRangeRowStyle(theme)}>
          <View style={createStatusDotStyle(theme, entry.isOpen)} />
          <Text variant="bodyStrong">{range}</Text>
        </View>
        {hasBadges ? (
          <View style={createEntryBadgesStyle(theme)}>
            {entry.isOpen ? <Badge tone="info" label={i18n.t('timeClock.openBadge')} /> : null}
            {entry.isEdited ? (
              <Badge tone="warning" label={i18n.t('timeClock.editedBadge')} />
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={createRangeRowStyle(theme)}>
        {entry.isOpen ? null : <Text color="ink2">{formatWorkedMinutes(entry.workedMinutes)}</Text>}
        <Icon name="chevronRight" size="inline" color="ink2" />
      </View>
    </Pressable>
  );
}

interface WorkDayCardProps {
  day: WorkDay;
  /** «lunes, 5 de octubre», ya escrito por quien llama: lo lee el lector de pantalla. */
  dayLabel: string;
  timeZone: string;
  onEntryPress: (entry: TimeEntryResponseDto) => void;
}

/** Un día del mes: su bloque de fecha, lo trabajado en total y cada fichaje (turno partido incluido). */
export function WorkDayCard({
  day,
  dayLabel,
  timeZone,
  onEntryPress,
}: Readonly<WorkDayCardProps>): React.JSX.Element {
  const theme = useTheme();
  const { weekday, dayNumber } = describeWorkDate(day.workDate);

  return (
    <View style={createDayCardStyle(theme)}>
      <View style={createDateBlockStyle(theme)} accessible accessibilityLabel={dayLabel}>
        <Text variant="overline" color="brandInk">
          {weekday.toUpperCase()}
        </Text>
        <Text variant="titleMd" color="brandInk">
          {dayNumber}
        </Text>
      </View>
      <View style={createDayBodyStyle(theme)}>
        <View style={createDayHeaderStyle(theme)}>
          <Text color="ink2" role="heading">
            {formatWorkedMinutes(day.workedMinutes)}
          </Text>
        </View>
        {day.entries.map((entry) => (
          <TimeEntryRow
            key={entry.id}
            entry={entry}
            timeZone={timeZone}
            onPress={() => {
              onEntryPress(entry);
            }}
          />
        ))}
      </View>
    </View>
  );
}
