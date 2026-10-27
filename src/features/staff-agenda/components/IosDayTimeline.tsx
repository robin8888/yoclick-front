import { Pressable, View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import type { DayEvent, IosDayLayout } from '../model/ios-day-layout';
import { InProgressText } from './InProgressClock';
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
  onPress: (bookingId: string) => void;
}

/** «Sin alumnos todavía» o «N personas»: cuántos vienen, nunca quiénes (eso va en el detalle). */
function describePeople(personCount: number): string {
  if (personCount === 0) return i18n.t('staffAgenda.agenda.noPeopleYet');
  return i18n.t('staffAgenda.attendance.peopleCount', { count: personCount });
}

interface EventBlockTextProps {
  serviceName: string;
  detailLine: string;
  peopleLine: string;
  /** Con la clase en marcha, desde cuándo: se cuenta el tiempo que lleva. */
  runningSince: string | null;
}

/** Los tres renglones de un bloque: servicio en negrita, hora y sala, y cuántos vienen. */
function EventBlockText({
  serviceName,
  detailLine,
  peopleLine,
  runningSince,
}: Readonly<EventBlockTextProps>): React.JSX.Element {
  return (
    <>
      <Text variant="bodyStrong" numberOfLines={1}>
        {serviceName}
      </Text>
      <Text variant="caption" color="ink2" numberOfLines={1}>
        {detailLine}
      </Text>
      <Text variant="caption" color="ink2" numberOfLines={1}>
        {peopleLine}
      </Text>
      {runningSince === null ? null : <InProgressText startedAt={runningSince} />}
    </>
  );
}

/** «09:00 – 10:00» de una clase. */
function describeTimeRange(event: DayEvent): string {
  return i18n.t('staffAgenda.agenda.timeRange', {
    startTime: formatClock(event.startMinutes),
    endTime: formatClock(event.endMinutes),
  });
}

/** Dónde se dibuja: por minutos desde la primera hora y por columna si se solapa con otras. */
function toPlacement(
  event: DayEvent,
  firstHour: number,
): { top: number; height: number; leftPercent: number; widthPercent: number } {
  return {
    top: toTop(event.startMinutes, firstHour),
    height: ((event.endMinutes - event.startMinutes) / MINUTES_PER_HOUR) * IOS_HOUR_HEIGHT,
    leftPercent: (event.column / event.columnCount) * PERCENT,
    widthPercent: PERCENT / event.columnCount,
  };
}

/** Una clase como bloque; con gente se abre al tocarla, sin alumnos solo informa. */
function EventBlock({ event, firstHour, onPress }: Readonly<EventBlockProps>): React.JSX.Element {
  const theme = useTheme();
  const timeRange = describeTimeRange(event);
  const place = event.roomName === null ? '' : ` · ${event.roomName}`;
  const { bookingId } = event;
  const people = describePeople(event.personCount);
  const placement = toPlacement(event, firstHour);
  const label = `${timeRange}. ${event.serviceName}. ${people}`;
  const content = (
    <EventBlockText
      serviceName={event.serviceName}
      detailLine={`${timeRange}${place}`}
      peopleLine={people}
      runningSince={event.runningSince}
    />
  );

  if (bookingId === null) {
    return (
      <View
        accessible
        accessibilityLabel={label}
        style={createEventStyle(theme, { ...placement, isEmpty: true })}
      >
        {content}
      </View>
    );
  }
  return (
    <Pressable
      role="button"
      accessibilityLabel={label}
      onPress={() => {
        onPress(bookingId);
      }}
      style={createEventStyle(theme, { ...placement, isEmpty: false })}
    >
      {content}
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
              <Text variant="caption" color="ink2" numberOfLines={1} adjustsFontSizeToFit>
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
            onPress={onEventPress}
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
