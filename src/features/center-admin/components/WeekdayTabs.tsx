import { Pressable, View } from 'react-native';

import { useTheme, type Theme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';

import {
  describeWeekday,
  describeWeekdayInitial,
  SCHEDULE_WEEKDAYS,
  type ScheduleWeekday,
} from '../model/schedule-form';
import {
  createWeekdayDotStyle,
  createWeekdayTabsStyle,
  createWeekdayTabStyle,
} from './WeekdayTabs.styles';

interface WeekdayTabsProps {
  selectedWeekday: ScheduleWeekday;
  /** Los días de la semana que tienen alguna clase fija. */
  busyWeekdays: ReadonlySet<ScheduleWeekday>;
  onWeekdaySelect: (weekday: ScheduleWeekday) => void;
}

interface DotInput {
  theme: Theme;
  isBusy: boolean;
  isSelected: boolean;
}

/** Color del punto: invisible sin clases; sobre el día elegido (fondo de marca) va en `onBrand`. */
function pickDotColor({ theme, isBusy, isSelected }: DotInput): string {
  if (!isBusy) return 'transparent';
  return isSelected ? theme.colors.onBrand : theme.colors.brand;
}

/** Lunes a domingo en una sola barra: el día elegido va relleno y un punto marca los que tienen clases. */
export function WeekdayTabs({
  selectedWeekday,
  busyWeekdays,
  onWeekdaySelect,
}: Readonly<WeekdayTabsProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createWeekdayTabsStyle(theme)}>
      {SCHEDULE_WEEKDAYS.map((weekday) => {
        const isSelected = weekday === selectedWeekday;
        const dotColor = pickDotColor({ theme, isBusy: busyWeekdays.has(weekday), isSelected });
        return (
          <Pressable
            key={weekday}
            role="radio"
            accessibilityLabel={describeWeekday(weekday)}
            accessibilityState={{ checked: isSelected }}
            onPress={() => {
              onWeekdaySelect(weekday);
            }}
            style={createWeekdayTabStyle(theme, isSelected)}
          >
            <Text variant="bodyStrong" color={isSelected ? 'onBrand' : 'ink'}>
              {describeWeekdayInitial(weekday)}
            </Text>
            <View style={createWeekdayDotStyle(dotColor)} />
          </Pressable>
        );
      })}
    </View>
  );
}
