import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import type { DayEvent, IosDayLayout } from '../model/ios-day-layout';
import {
  createEventStyle,
  createHourLabelStyle,
  createHourLineStyle,
  createNowDotStyle,
  createNowLineStyle,
  createTimelineStyle,
  EVENTS_AREA_STYLE,
  IOS_HOUR_HEIGHT,
} from './IosDayTimeline.styles';

const MINUTES_PER_HOUR = 60;
const PERCENT = 100;
const HOUR_DIGITS_LENGTH = 2;

function toTop(minutes: number, firstHour: number): number {
  return ((minutes - firstHour * MINUTES_PER_HOUR) / MINUTES_PER_HOUR) * IOS_HOUR_HEIGHT;
}

function formatClock(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  return `${String(hours).padStart(HOUR_DIGITS_LENGTH, '0')}:${String(minutes).padStart(HOUR_DIGITS_LENGTH, '0')}`;
}

interface EventBlockProps {
  event: DayEvent;
  firstHour: number;
  onPress: () => void;
}

/** Una clase: servicio en negrita, hora, sala y quién viene. */
function EventBlock({ event, firstHour, onPress }: Readonly<EventBlockProps>): React.JSX.Element {
  const theme = useTheme();
  const timeRange = i18n.t('staffAgenda.agenda.timeRange', {
    startTime: formatClock(event.startMinutes),
    endTime: formatClock(event.endMinutes),
  });
  const people = event.clientNames.join(', ');
  const place = event.roomName === null ? '' : ` · ${event.roomName}`;

  return (
    <Pressable
      role="button"
      accessibilityLabel={`${timeRange}. ${event.serviceName}. ${people}`}
      onPress={onPress}
      style={createEventStyle(theme, {
        top: toTop(event.startMinutes, firstHour),
        height: ((event.endMinutes - event.startMinutes) / MINUTES_PER_HOUR) * IOS_HOUR_HEIGHT,
        leftPercent: (event.column / event.columnCount) * PERCENT,
        widthPercent: PERCENT / event.columnCount,
      })}
    >
      <Text variant="bodyStrong" numberOfLines={1}>
        {event.serviceName}
      </Text>
      <Text variant="caption" color="ink2" numberOfLines={1}>
        {`${timeRange}${place}`}
      </Text>
      <Text variant="caption" color="ink2" numberOfLines={2}>
        {people}
      </Text>
    </Pressable>
  );
}

/** Las etiquetas y rayas de cada hora en punto. */
function HourGrid({ layout }: Readonly<{ layout: IosDayLayout }>): React.JSX.Element {
  const theme = useTheme();
  const hours = Array.from(
    { length: layout.lastHour - layout.firstHour + 1 },
    (_, index) => layout.firstHour + index,
  );

  return (
    <>
      {hours.map((hour) => {
        const top = (hour - layout.firstHour) * IOS_HOUR_HEIGHT;
        return (
          <View key={hour}>
            <View style={createHourLabelStyle(top)}>
              <Text variant="caption" color="ink2">
                {formatClock(hour * MINUTES_PER_HOUR)}
              </Text>
            </View>
            <View style={createHourLineStyle(theme, top)} />
          </View>
        );
      })}
    </>
  );
}

interface IosDayTimelineProps {
  layout: IosDayLayout;
  /** Minutos desde las 00:00 de ahora si el día mostrado es hoy; `null` en otros días. */
  nowMinutes: number | null;
  onEventPress: (bookingId: string) => void;
}

/**
 * La agenda del profesional como el calendario de iOS: una rejilla de horas con rayas finas, cada
 * clase como un bloque a su altura exacta (las que se solapan, en columnas) y la línea roja de «ahora».
 */
export function IosDayTimeline({
  layout,
  nowMinutes,
  onEventPress,
}: Readonly<IosDayTimelineProps>): React.JSX.Element {
  const theme = useTheme();
  const totalHeight = (layout.lastHour - layout.firstHour) * IOS_HOUR_HEIGHT;
  const isNowVisible =
    nowMinutes !== null &&
    nowMinutes >= layout.firstHour * MINUTES_PER_HOUR &&
    nowMinutes <= layout.lastHour * MINUTES_PER_HOUR;

  return (
    <View style={createTimelineStyle(totalHeight)}>
      <HourGrid layout={layout} />
      <View style={EVENTS_AREA_STYLE}>
        {layout.events.map((event) => (
          <EventBlock
            key={event.sessionId}
            event={event}
            firstHour={layout.firstHour}
            onPress={() => {
              onEventPress(event.bookingId);
            }}
          />
        ))}
      </View>
      {isNowVisible ? (
        <View style={createNowLineStyle(theme, toTop(nowMinutes, layout.firstHour))}>
          <View style={createNowDotStyle(theme)} />
        </View>
      ) : null}
    </View>
  );
}
