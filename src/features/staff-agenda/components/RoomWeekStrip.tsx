import { Pressable, View } from 'react-native';

import type { RoomAgendaResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { useTickingNow } from '@/shared/hooks/useTickingNow';
import { buildFinishedLook, useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import { getTodayIsoDate } from '../model/agenda-date';
import { useRoomWeekAgendas } from '../hooks/useRoomWeekAgendas';
import { buildAgendaDays, type AgendaDayOption } from '../model/agenda-days';
import { assignRoomMarks, findRoomMark, type RoomMark } from '../model/room-marks';
import { listRoomIdsWithClasses, listWeekIsoDates, MAX_DOTS_PER_DAY } from '../model/room-week';
import { createWeekDayStyle, createWeekStripStyle, WEEK_DOTS_STYLE } from './RoomDayGrid.styles';
import { RoomMarkDot } from './RoomMarkDot';

/** El día «pasado» cambia a medianoche; con mirar cada minuto basta. */
const DAY_REFRESH_MS = 60_000;

interface WeekDayProps {
  day: AgendaDayOption;
  agendaOfDay: RoomAgendaResponseDto | undefined;
  marks: readonly RoomMark[];
  isSelected: boolean;
  /** El día ya pasó: va en gris con texto blanco. */
  isPast: boolean;
  onPress: () => void;
}

/** Cuántas salas tienen clase ese día y las marcas de las primeras (los puntos que se dibujan). */
function describeBusyRooms(
  agendaOfDay: RoomAgendaResponseDto | undefined,
  marks: readonly RoomMark[],
): { busyRoomCount: number; dotMarks: RoomMark[] } {
  const busyRoomIds = listRoomIdsWithClasses(agendaOfDay);
  const dotMarks = busyRoomIds
    .slice(0, MAX_DOTS_PER_DAY)
    .map((roomId) => findRoomMark(marks, roomId))
    .filter((mark): mark is RoomMark => mark !== undefined);
  return { busyRoomCount: busyRoomIds.length, dotMarks };
}

/** Un día de la semana: nombre, número y un punto por sala con clases (hasta cuatro). */
function WeekDay({
  day,
  agendaOfDay,
  marks,
  isSelected,
  isPast,
  onPress,
}: Readonly<WeekDayProps>): React.JSX.Element {
  const theme = useTheme();
  const { tint } = buildFinishedLook(isPast);
  const { busyRoomCount, dotMarks } = describeBusyRooms(agendaOfDay, marks);

  return (
    <Pressable
      role="button"
      accessibilityLabel={i18n.t('staffAgenda.rooms.weekDayLabel', {
        day: day.fullLabel,
        count: busyRoomCount,
      })}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={createWeekDayStyle(theme, { isSelected, isPast })}
    >
      <Text variant="caption" color={isSelected && !isPast ? 'onBrand' : 'ink2'} {...tint}>
        {day.weekdayLabel}
      </Text>
      <Text variant="bodyStrong" color={isSelected && !isPast ? 'onBrand' : 'ink'} {...tint}>
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
  const now = useTickingNow(DAY_REFRESH_MS);
  const todayIsoDate = getTodayIsoDate(now, agenda.timezone);
  const days = buildAgendaDays(weekIsoDates[0] ?? selectedIsoDate, weekIsoDates.length);
  const theme = useTheme();

  return (
    <View style={createWeekStripStyle(theme)}>
      {days.map((day) => (
        <WeekDay
          key={day.isoDate}
          day={day}
          agendaOfDay={agendasByDate[day.isoDate]}
          marks={marks}
          isSelected={day.isoDate === selectedIsoDate}
          isPast={day.isoDate < todayIsoDate}
          onPress={() => {
            onDaySelect(day.isoDate);
          }}
        />
      ))}
    </View>
  );
}
