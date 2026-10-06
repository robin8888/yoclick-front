import { Pressable, View } from 'react-native';

import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Badge } from '@/ui/atoms/Badge';
import { Text } from '@/ui/atoms/Text';

import type { StaffAgendaColumn } from '../model/center-agenda-summary';
import {
  createColumnEntryStyle,
  createColumnHeaderStyle,
  createColumnStyle,
  createColumnsStackStyle,
  createEmptyColumnStyle,
  COLUMN_HEADER_TEXT_STYLE,
  ENTRY_TEXT_STYLE,
  ENTRY_TIME_STYLE,
} from './StaffAgendaColumns.styles';

interface StaffAgendaColumnsProps {
  columns: readonly StaffAgendaColumn[];
  timeZone: string;
  onEntryPress: (bookingId: string) => void;
}

interface ColumnEntryProps {
  entry: AgendaResponseDtoEntriesItem;
  timeZone: string;
  onPress: (bookingId: string) => void;
}

function ColumnEntry({ entry, timeZone, onPress }: Readonly<ColumnEntryProps>): React.JSX.Element {
  const theme = useTheme();
  const startTime = formatTime24h(entry.booking.startsAt, timeZone);

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${startTime}. ${entry.client.fullName}. ${entry.booking.service.name}`}
      onPress={() => {
        onPress(entry.booking.id);
      }}
      style={createColumnEntryStyle(theme)}
    >
      <View style={ENTRY_TIME_STYLE}>
        <Text variant="bodyStrong" color="brandInk">
          {startTime}
        </Text>
      </View>
      <View style={ENTRY_TEXT_STYLE}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {entry.client.fullName}
        </Text>
        <Text variant="caption" color="ink2" numberOfLines={1}>
          {entry.booking.service.name}
        </Text>
      </View>
    </Pressable>
  );
}

interface StaffColumnProps {
  column: StaffAgendaColumn;
  timeZone: string;
  onEntryPress: (bookingId: string) => void;
}

function StaffColumn({
  column,
  timeZone,
  onEntryPress,
}: Readonly<StaffColumnProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createColumnStyle(theme)}>
      <View style={createColumnHeaderStyle(theme)}>
        <Avatar name={column.fullName} size="md" isDecorative />
        <View style={COLUMN_HEADER_TEXT_STYLE}>
          <Text variant="titleMd" numberOfLines={2}>
            {column.fullName}
          </Text>
        </View>
        <Badge
          label={i18n.t('staffAgenda.center.appointmentCount', { count: column.entries.length })}
          tone={column.entries.length === 0 ? 'neutral' : 'brand'}
        />
      </View>
      {column.entries.length === 0 ? (
        <View style={createEmptyColumnStyle(theme)}>
          <Text variant="caption" color="ink2">
            {i18n.t('staffAgenda.center.noAppointments')}
          </Text>
        </View>
      ) : null}
      {column.entries.map((entry) => (
        <ColumnEntry
          key={entry.booking.id}
          entry={entry}
          timeZone={timeZone}
          onPress={onEntryPress}
        />
      ))}
    </View>
  );
}

/** Prototipo `aagenda`, «Por instructor»: una tarjeta por profesional, una debajo de otra. */
export function StaffAgendaColumns({
  columns,
  timeZone,
  onEntryPress,
}: Readonly<StaffAgendaColumnsProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createColumnsStackStyle(theme)}>
      {columns.map((column) => (
        <StaffColumn
          key={column.membershipId}
          column={column}
          timeZone={timeZone}
          onEntryPress={onEntryPress}
        />
      ))}
    </View>
  );
}
