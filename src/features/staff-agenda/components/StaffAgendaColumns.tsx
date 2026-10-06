import { Pressable, ScrollView, View } from 'react-native';

import type { AgendaResponseDtoEntriesItem } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatTime24h } from '@/shared/lib/format/format-time';
import { useTheme } from '@/shared/theme';
import { Avatar } from '@/ui/atoms/Avatar';
import { Text } from '@/ui/atoms/Text';

import type { StaffAgendaColumn } from '../model/center-agenda-summary';
import {
  createColumnEntryStyle,
  createColumnHeaderStyle,
  createColumnStyle,
  createColumnsRowStyle,
  createEmptyColumnStyle,
  COLUMN_HEADER_TEXT_STYLE,
  MAX_COLUMNS_WITHOUT_SCROLL,
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
      <Text variant="bodyStrong">{startTime}</Text>
      <Text>{entry.client.fullName}</Text>
      <Text variant="caption" color="ink2">
        {entry.booking.service.name}
      </Text>
    </Pressable>
  );
}

interface StaffColumnProps {
  column: StaffAgendaColumn;
  /** Con pocas columnas se reparten el ancho; con más, cada una mide lo mismo y se desplaza. */
  isFilled: boolean;
  timeZone: string;
  onEntryPress: (bookingId: string) => void;
}

function StaffColumn({
  column,
  isFilled,
  timeZone,
  onEntryPress,
}: Readonly<StaffColumnProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createColumnStyle(theme, isFilled)}>
      <View style={createColumnHeaderStyle(theme)}>
        <Avatar name={column.fullName} size="sm" isDecorative />
        <View style={COLUMN_HEADER_TEXT_STYLE}>
          <Text variant="bodyStrong" numberOfLines={2}>
            {column.fullName}
          </Text>
          <Text variant="caption" color="ink2">
            {i18n.t('staffAgenda.center.appointmentCount', { count: column.entries.length })}
          </Text>
        </View>
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

/**
 * Prototipo `aagenda`, «Por instructor»: una columna por profesional con sus citas del día. Hasta
 * dos columnas se reparten el ancho sin desplazamiento; con más, se desplazan a los lados.
 */
export function StaffAgendaColumns({
  columns,
  timeZone,
  onEntryPress,
}: Readonly<StaffAgendaColumnsProps>): React.JSX.Element {
  const theme = useTheme();
  const isFilled = columns.length <= MAX_COLUMNS_WITHOUT_SCROLL;
  const columnViews = columns.map((column) => (
    <StaffColumn
      key={column.membershipId}
      column={column}
      isFilled={isFilled}
      timeZone={timeZone}
      onEntryPress={onEntryPress}
    />
  ));

  if (isFilled) return <View style={createColumnsRowStyle(theme)}>{columnViews}</View>;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={createColumnsRowStyle(theme)}
    >
      {columnViews}
    </ScrollView>
  );
}
