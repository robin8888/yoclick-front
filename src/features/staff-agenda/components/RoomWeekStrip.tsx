import { Pressable, View } from 'react-native';

import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { useRoomWeekAgendas } from '../hooks/useRoomWeekAgendas';
import { buildAgendaDays, type AgendaDayOption } from '../model/agenda-days';
import { assignRoomMarks, findRoomMark, type RoomMark } from '../model/room-marks';
import { listRoomIdsWithClasses, listWeekIsoDates, MAX_DOTS_PER_DAY } from '../model/room-week';
import { createWeekDayStyle, WEEK_DOTS_STYLE, WEEK_STRIP_STYLE } from './RoomDayGrid.styles';
import { RoomMarkDot } from './RoomMarkDot';

interface WeekDayProps {
  day: AgendaDayOption;
  agendaOfDay: RoomAgendaResponseDto | undefined;
  marks: readonly RoomMark[];
  isSelected: boolean;
  onPress: () => void;
}

/** Un día de la semana: nombre, número y un punto por sala con clases (hasta cuatro). */
function WeekDay({
  day,
  agendaOfDay,
  marks,
  isSelected,
  onPress,
}: Readonly<WeekDayProps>): React.JSX.Element {
  const theme = useTheme();
  const busyRoomIds = listRoomIdsWithClasses(agendaOfDay);
  const dotMarks = busyRoomIds
    .slice(0, MAX_DOTS_PER_DAY)
    .map((roomId) => findRoomMark(marks, roomId))
    .filter((mark): mark is RoomMark => mark !== undefined);

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('staffAgenda.rooms.weekDayLabel', {
        day: day.fullLabel,
        count: busyRoomIds.length,
      })}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={createWeekDayStyle(theme, isSelected)}
    >
      <Text variant="caption" color={isSelected ? 'brandInk' : 'ink2'}>
        {day.weekdayLabel}
      </Text>
      <Text variant="bodyStrong" color={isSelected ? 'brandInk' : 'ink'}>
        {day.dayLabel}
      </Text>
      <View style={WEEK_DOTS_STYLE}>
        {dotMarks.map((mark) => (
          <RoomMarkDot key={mark.roomId} mark={mark} size="sm" />
        ))}
      </View>
    </Pressable>
  );
}

interface RoomWeekStripProps {
  selectedIsoDate: string;
  /** La agenda del día elegido: de ella salen las salas (letras y colores) de la semana. */
  agenda: RoomAgendaResponseDto;
  onDaySelect: (isoDate: string) => void;
}

/** La semana del día elegido (lunes a domingo) con puntos de color por sala con clases, como un calendario. */
export function RoomWeekStrip({
  selectedIsoDate,
  agenda,
  onDaySelect,
}: Readonly<RoomWeekStripProps>): React.JSX.Element {
  const weekIsoDates = listWeekIsoDates(selectedIsoDate);
  const agendasByDate = useRoomWeekAgendas(weekIsoDates);
  const marks = assignRoomMarks(agenda.rooms);
  const days = buildAgendaDays(weekIsoDates[0] ?? selectedIsoDate, weekIsoDates.length);

  return (
    <View style={WEEK_STRIP_STYLE}>
      {days.map((day) => (
        <WeekDay
          key={day.isoDate}
          day={day}
          agendaOfDay={agendasByDate[day.isoDate]}
          marks={marks}
          isSelected={day.isoDate === selectedIsoDate}
          onPress={() => {
            onDaySelect(day.isoDate);
          }}
        />
      ))}
    </View>
  );
}
