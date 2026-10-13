import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { WheelColumn, type WheelOption } from '@/ui/molecules/WheelColumn';

import { createTimeWheelCardStyle, createTimeWheelFieldStyle } from './TimeWheelField.styles';
import type { TimeWheelFieldProps } from './TimeWheelField.types';
import { listHourChoices, listMinuteChoices, listTimeChoices, snapToChoice } from './time-choices';

const HOUR_LENGTH = 2;

function toOptions(values: readonly string[], describe: (value: string) => string): WheelOption[] {
  return values.map((value) => ({ value, label: value, accessibilityLabel: describe(value) }));
}

interface TimeParts {
  choices: string[];
  hour: string;
  minute: string;
}

/** Las horas elegibles entre los límites y la hora actual partida en horas y minutos (ya ajustada). */
function resolveTimeParts(props: Readonly<TimeWheelFieldProps>): TimeParts {
  const choices = listTimeChoices({
    minTime: props.minTime,
    maxTime: props.maxTime,
    stepMinutes: props.stepMinutes,
  });
  const chosenTime = snapToChoice(props.time, choices);
  return {
    choices,
    hour: chosenTime?.slice(0, HOUR_LENGTH) ?? '',
    minute: chosenTime?.slice(HOUR_LENGTH + 1) ?? '',
  };
}

/** Al cambiar de hora se conserva el minuto si también se puede elegir; si no, el primero. */
function pickMinuteForHour(parts: TimeParts, nextHour: string): string | undefined {
  const minutes = listMinuteChoices(parts.choices, nextHour);
  return minutes.includes(parts.minute) ? parts.minute : minutes[0];
}

/**
 * Una hora elegida con dos ruedas, como la del iPhone: horas y minutos. Solo se pueden elegir horas
 * entre `minTime` y `maxTime`, así que «hasta» nunca queda por debajo de «de».
 */
export function TimeWheelField(props: Readonly<TimeWheelFieldProps>): React.JSX.Element {
  const { label, accessibilityName, visibleItems, onTimeChange } = props;
  const theme = useTheme();
  const parts = resolveTimeParts(props);

  return (
    <View style={createTimeWheelFieldStyle(theme)}>
      <Text variant="caption" color="ink2">
        {label}
      </Text>
      <View style={createTimeWheelCardStyle(theme)}>
        <WheelColumn
          options={toOptions(
            listHourChoices(parts.choices),
            (value) => `${accessibilityName}, ${value} h`,
          )}
          selectedValue={parts.hour}
          visibleItems={visibleItems}
          accessibilityLabel={`${accessibilityName}, ${i18n.t('calendar.hours')}`}
          onValueChange={(nextHour) => {
            const nextMinute = pickMinuteForHour(parts, nextHour);
            if (nextMinute !== undefined) onTimeChange(`${nextHour}:${nextMinute}`);
          }}
        />
        <Text variant="titleLg">:</Text>
        <WheelColumn
          options={toOptions(
            listMinuteChoices(parts.choices, parts.hour),
            (value) => `${accessibilityName}, ${parts.hour}:${value}`,
          )}
          selectedValue={parts.minute}
          visibleItems={visibleItems}
          accessibilityLabel={`${accessibilityName}, ${i18n.t('calendar.minutes')}`}
          onValueChange={(nextMinute) => {
            onTimeChange(`${parts.hour}:${nextMinute}`);
          }}
        />
      </View>
    </View>
  );
}
