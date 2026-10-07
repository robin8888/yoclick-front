import { Pressable, View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import {
  CALENDAR_HEADER_STYLE,
  CALENDAR_WEEK_STYLE,
  createCalendarStyle,
  createDayCellStyle,
  WEEKDAY_CELL_STYLE,
} from './CalendarGrid.styles';
import type { CalendarGridProps } from './CalendarGrid.types';
import { addMonths, buildMonthWeeks } from './month-grid';

const DAY_NUMBER_START = 8;

interface DayCellProps {
  isoDate: string | null;
  isSelected: boolean;
  describeDay: (isoDate: string) => string;
  onPress: (isoDate: string) => void;
}

function DayCell({
  isoDate,
  isSelected,
  describeDay,
  onPress,
}: Readonly<DayCellProps>): React.JSX.Element {
  const theme = useTheme();
  if (isoDate === null) return <View style={createDayCellStyle(theme, false)} />;

  return (
    <Pressable
      role="button"
      accessibilityLabel={describeDay(isoDate)}
      accessibilityState={{ selected: isSelected }}
      onPress={() => {
        onPress(isoDate);
      }}
      style={createDayCellStyle(theme, isSelected)}
    >
      <Text variant="body" color={isSelected ? 'onBrand' : 'ink'}>
        {String(Number(isoDate.slice(DAY_NUMBER_START)))}
      </Text>
    </Pressable>
  );
}

function CalendarHeader({
  labels,
  onPrevious,
  onNext,
}: Readonly<{
  labels: CalendarGridProps['labels'];
  onPrevious: () => void;
  onNext: () => void;
}>): React.JSX.Element {
  return (
    <View style={CALENDAR_HEADER_STYLE}>
      <IconButton
        iconName="chevronLeft"
        accessibilityLabel={labels.previousMonth}
        onPress={onPrevious}
      />
      <Text variant="bodyStrong" role="heading">
        {labels.monthTitle}
      </Text>
      <IconButton iconName="chevronRight" accessibilityLabel={labels.nextMonth} onPress={onNext} />
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

/** Un mes en rejilla de lunes a domingo para elegir un día; las etiquetas llegan ya traducidas. */
export function CalendarGrid({
  visibleMonth,
  onVisibleMonthChange,
  selectedDate,
  onDateSelect,
  labels,
}: Readonly<CalendarGridProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createCalendarStyle(theme)}>
      <CalendarHeader
        labels={labels}
        onPrevious={() => {
          onVisibleMonthChange(addMonths(visibleMonth, -1));
        }}
        onNext={() => {
          onVisibleMonthChange(addMonths(visibleMonth, 1));
        }}
      />
      <WeekdayRow initials={labels.weekdayInitials} />
      {buildMonthWeeks(visibleMonth).map((week, weekIndex) => (
        <View key={String(weekIndex)} style={CALENDAR_WEEK_STYLE}>
          {week.map((isoDate, dayIndex) => (
            <DayCell
              key={isoDate ?? `blank-${String(dayIndex)}`}
              isoDate={isoDate}
              isSelected={isoDate !== null && isoDate === selectedDate}
              describeDay={labels.describeDay}
              onPress={onDateSelect}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
