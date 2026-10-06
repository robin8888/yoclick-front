import { Pressable, View } from 'react-native';

import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import type { TimelineRow } from '../model/day-timeline';
import {
  CLOSED_SLOT_STYLE,
  createAppointmentBlockStyle,
  createFreeSlotStyle,
  createHourRowStyle,
  HOUR_LABEL_STYLE,
  TIMELINE_STYLE,
} from './DayTimeline.styles';

const MINUTES_PER_HOUR = 60;
const MILLISECONDS_PER_MINUTE = 60_000;

interface DayTimelineProps {
  rows: readonly TimelineRow[];
  timeZone: string;
  onEntryPress: (bookingId: string) => void;
  onFreeSlotPress: (hourLabel: string) => void;
}

function countHoursSpanned(entry: AgendaResponseDtoEntriesItem): number {
  const { startsAt, endsAt } = entry.booking;
  const minutes = (Date.parse(endsAt) - Date.parse(startsAt)) / MILLISECONDS_PER_MINUTE;
  return Math.max(Math.ceil(minutes / MINUTES_PER_HOUR), 1);
}

interface AppointmentBlockProps {
  entry: AgendaResponseDtoEntriesItem;
  timeZone: string;
  onPress: () => void;
}

function AppointmentBlock({
  entry,
  timeZone,
  onPress,
}: Readonly<AppointmentBlockProps>): React.JSX.Element {
  const theme = useTheme();
  const { booking, client } = entry;
  const timeRange = i18n.t('staffAgenda.agenda.timeRange', {
    startTime: formatTime24h(booking.startsAt, timeZone),
    endTime: formatTime24h(booking.endsAt, timeZone),
  });

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${timeRange}. ${booking.service.name}. ${client.fullName}`}
      onPress={onPress}
      style={createAppointmentBlockStyle(theme)}
    >
      <Text variant="bodyStrong" numberOfLines={1}>
        {booking.service.name}
      </Text>
      <Text variant="caption" color="ink2" numberOfLines={1}>
        {`${client.fullName} · ${timeRange}`}
      </Text>
    </Pressable>
  );
}

function FreeSlot({ onPress }: Readonly<{ onPress: () => void }>): React.JSX.Element {
  const theme = useTheme();

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('staffAgenda.instructor.freeSlotLabel')}
      onPress={onPress}
      style={createFreeSlotStyle(theme)}
    >
      <Text color="ink2">{`+ ${i18n.t('staffAgenda.instructor.freeSlotLabel')}`}</Text>
    </Pressable>
  );
}

function renderRowContent(row: TimelineRow, props: DayTimelineProps): React.JSX.Element | null {
  if (row.kind === 'booked' && row.entry !== null) {
    const bookingId = row.entry.booking.id;
    return (
      <AppointmentBlock
        entry={row.entry}
        timeZone={props.timeZone}
        onPress={() => {
          props.onEntryPress(bookingId);
        }}
      />
    );
  }
  if (row.kind === 'free') {
    return (
      <FreeSlot
        onPress={() => {
          props.onFreeSlotPress(row.label);
        }}
      />
    );
  }
  return (
    <View style={CLOSED_SLOT_STYLE}>
      <Text variant="caption" color="ink2">
        {i18n.t('staffAgenda.instructor.closedLabel')}
      </Text>
    </View>
  );
}

/** Prototipo `iagenda`: la rejilla hora a hora con las citas como bloques y los huecos con «+». */
export function DayTimeline(props: Readonly<DayTimelineProps>): React.JSX.Element {
  return (
    <View style={TIMELINE_STYLE}>
      {props.rows
        .filter((row) => row.kind !== 'covered')
        .map((row) => (
          <View
            key={row.hour}
            style={createHourRowStyle(row.entry === null ? 1 : countHoursSpanned(row.entry))}
          >
            <View style={HOUR_LABEL_STYLE}>
              <Text variant="caption" color="ink2">
                {row.label}
              </Text>
            </View>
            {renderRowContent(row, props)}
          </View>
        ))}
    </View>
  );
}
