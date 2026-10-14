import { Pressable, View } from 'react-native';

import type { TimeEntryResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Badge } from '@/ui/atoms/Badge';
import { Icon } from '@/ui/atoms/Icon';
import { Text } from '@/ui/atoms/Text';

import type { WorkDay } from '../model/group-entries-by-day';
import { formatWorkedMinutes } from '../model/worked-time';
import {
  createDayCardStyle,
  createDayHeaderStyle,
  createEntryBadgesStyle,
  createEntryRowStyle,
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

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${range}. ${i18n.t('timeClock.editor.editTitle')}`}
      onPress={onPress}
      style={createEntryRowStyle(theme)}
    >
      <View>
        <Text variant="bodyStrong">{range}</Text>
        <View style={createEntryBadgesStyle(theme)}>
          {entry.isOpen ? <Badge tone="info" label={i18n.t('timeClock.openBadge')} /> : null}
          {entry.isEdited ? <Badge tone="warning" label={i18n.t('timeClock.editedBadge')} /> : null}
        </View>
      </View>
      <View style={createDayHeaderStyle(theme)}>
        {entry.isOpen ? null : <Text color="ink2">{formatWorkedMinutes(entry.workedMinutes)}</Text>}
        <Icon name="chevronRight" size="inline" color="ink2" />
      </View>
    </Pressable>
  );
}

interface WorkDayCardProps {
  day: WorkDay;
  /** «lunes, 5 de octubre», ya escrito por quien llama. */
  dayLabel: string;
  timeZone: string;
  onEntryPress: (entry: TimeEntryResponseDto) => void;
}

/** Un día del mes: su fecha, lo trabajado en total y cada fichaje (turno partido incluido). */
export function WorkDayCard({
  day,
  dayLabel,
  timeZone,
  onEntryPress,
}: Readonly<WorkDayCardProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createDayCardStyle(theme)}>
      <View style={createDayHeaderStyle(theme)}>
        <Text variant="bodyStrong" role="heading">
          {dayLabel}
        </Text>
        <Text color="ink2">{formatWorkedMinutes(day.workedMinutes)}</Text>
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
  );
}
