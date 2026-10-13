import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import {
  CALENDAR_ARROWS_STYLE,
  CALENDAR_HEADER_STYLE,
  CALENDAR_WEEK_STYLE,
  createCalendarStyle,
  createDayCellStyle,
  createDayCircleStyle,
  WEEKDAY_CELL_STYLE,
} from './CalendarGrid.styles';
import type { CalendarGridProps } from './CalendarGrid.types';
import { addMonths, buildMonthWeeks, readMonthOfIsoDate, type MonthRef } from './month-grid';

const DAY_NUMBER_START = 8;
const MONTHS_PER_YEAR = 12;

interface DayCellProps {
  isoDate: string | null;
  isSelected: boolean;
  isToday: boolean;
  /** Día anterior al mínimo: se ve apagado y no se puede elegir. */
  isDisabled: boolean;
  describeDay: (isoDate: string) => string;
  onPress: (isoDate: string) => void;
}

function pickDayColor(state: {
  isSelected: boolean;
  isToday: boolean;
  isDisabled: boolean;
}): 'onBrand' | 'ink2' | 'brandInk' | 'ink' {
  const { isSelected, isToday, isDisabled } = state;
  if (isDisabled) return 'ink2';
  if (isSelected) return 'onBrand';
  return isToday ? 'brandInk' : 'ink';
}

function DayCell({
  isoDate,
  isSelected,
  isToday,
  isDisabled,
  describeDay,
  onPress,
}: Readonly<DayCellProps>): React.JSX.Element {
  const theme = useTheme();
  if (isoDate === null) return <View style={createDayCellStyle()} />;

  return (
    <Pressable
      role="button"
      accessibilityLabel={describeDay(isoDate)}
      accessibilityState={{ selected: isSelected, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => {
        onPress(isoDate);
      }}
      style={createDayCellStyle()}
    >
      <View style={createDayCircleStyle(theme, isSelected)}>
        <Text
          variant={isSelected || isToday ? 'bodyStrong' : 'body'}
          color={pickDayColor({ isSelected, isToday, isDisabled })}
        >
          {String(Number(isoDate.slice(DAY_NUMBER_START)))}
        </Text>
      </View>
    </Pressable>
  );
}

function CalendarHeader({
  labels,
  canGoToPrevious,
  onPrevious,
  onNext,
}: Readonly<{
  labels: CalendarGridProps['labels'];
  canGoToPrevious: boolean;
  onPrevious: () => void;
  onNext: () => void;
}>): React.JSX.Element {
  return (
    <View style={CALENDAR_HEADER_STYLE}>
      <Text variant="titleMd" role="heading">
        {labels.monthTitle}
      </Text>
      <View style={CALENDAR_ARROWS_STYLE}>
        <IconButton
          iconName="chevronLeft"
          isDisabled={!canGoToPrevious}
          accessibilityLabel={labels.previousMonth}
          onPress={onPrevious}
        />
        <IconButton
          iconName="chevronRight"
          accessibilityLabel={labels.nextMonth}
          onPress={onNext}
        />
      </View>
    </View>
  );
}

function WeekdayRow({ initials }: Readonly<{ initials: readonly string[] }>): React.JSX.Element {
  return (
    <View style={CALENDAR_WEEK_STYLE}>
      {initials.map((initial, index) => (
        <View key={`${initial}-${String(index)}`} style={WEEKDAY_CELL_STYLE}>
          <Text variant="caption" color="ink2">
            {initial}
          </Text>
        </View>
      ))}
    </View>
  );
}

type MonthWeeksProps = Pick<
  CalendarGridProps,
  | 'visibleMonth'
  | 'selectedDate'
  | 'todayDate'
  | 'minDate'
  | 'enabledDates'
  | 'labels'
  | 'onDateSelect'
>;

/** Las filas del mes: una por semana, con sus días. */
function MonthWeeks({
  visibleMonth,
  selectedDate,
  todayDate,
  minDate,
  enabledDates,
  labels,
  onDateSelect,
}: Readonly<MonthWeeksProps>): React.JSX.Element {
  return (
    <>
      {buildMonthWeeks(visibleMonth).map((week, weekIndex) => (
        <View key={String(weekIndex)} style={CALENDAR_WEEK_STYLE}>
          {week.map((isoDate, dayIndex) => (
            <DayCell
              key={isoDate ?? `blank-${String(dayIndex)}`}
              isoDate={isoDate}
              isSelected={isoDate !== null && isoDate === selectedDate}
              isToday={isoDate !== null && isoDate === todayDate}
              isDisabled={isDateDisabled(isoDate, { minDate, enabledDates })}
              describeDay={labels.describeDay}
              onPress={onDateSelect}
            />
          ))}
        </View>
      ))}
    </>
  );
}

/** Un día apagado: anterior al mínimo, o fuera de la lista de días que se pueden elegir. */
function isDateDisabled(
  isoDate: string | null,
  limits: { minDate: string | undefined; enabledDates: ReadonlySet<string> | undefined },
): boolean {
  if (isoDate === null) return false;
  if (limits.minDate !== undefined && isoDate < limits.minDate) return true;
  return limits.enabledDates !== undefined && !limits.enabledDates.has(isoDate);
}

/** Se puede volver al mes anterior solo si tiene algún día que se pueda elegir. */
function canGoToPreviousMonth(visibleMonth: MonthRef, minDate: string | undefined): boolean {
  if (minDate === undefined) return true;
  const firstMonth = readMonthOfIsoDate(minDate);
  if (firstMonth === null) return true;
  return (
    visibleMonth.year * MONTHS_PER_YEAR + visibleMonth.month >
    firstMonth.year * MONTHS_PER_YEAR + firstMonth.month
  );
}

/** Un mes en rejilla de lunes a domingo para elegir un día; las etiquetas llegan ya traducidas. */
export function CalendarGrid({
  visibleMonth,
  onVisibleMonthChange,
  selectedDate,
  todayDate,
  minDate,
  enabledDates,
  onDateSelect,
  labels,
}: Readonly<CalendarGridProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCalendarStyle(theme)}>
      <CalendarHeader
        labels={labels}
        canGoToPrevious={canGoToPreviousMonth(visibleMonth, minDate)}
        onPrevious={() => {
          onVisibleMonthChange(addMonths(visibleMonth, -1));
        }}
        onNext={() => {
          onVisibleMonthChange(addMonths(visibleMonth, 1));
        }}
      />
      <WeekdayRow initials={labels.weekdayInitials} />
      <MonthWeeks
        visibleMonth={visibleMonth}
        selectedDate={selectedDate}
        todayDate={todayDate}
        minDate={minDate}
        enabledDates={enabledDates}
        labels={labels}
        onDateSelect={onDateSelect}
      />
    </View>
  );
}
