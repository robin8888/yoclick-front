import { View } from 'react-native';

import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { WheelColumn, type WheelOption } from '@/ui/molecules/WheelColumn';

import {
  createChosenSlotStyle,
  createSlotPickerCardStyle,
  createSlotWheelsRowStyle,
} from './SlotWheelPicker.styles';
import type {
  SlotWheelPickerLabels,
  SlotWheelPickerProps,
  WheelHour,
} from './SlotWheelPicker.types';

function buildHourOptions(hours: readonly WheelHour[]): WheelOption[] {
  return hours.map((group) => ({
    value: String(group.hour),
    label: group.hourLabel,
    accessibilityLabel: `${group.hourLabel} h`,
  }));
}

function buildMinuteOptions(group: WheelHour): WheelOption[] {
  return group.minutes.map((minute) => ({
    value: minute.startsAt,
    label: minute.minuteLabel,
    accessibilityLabel: `${group.hourLabel}:${minute.minuteLabel}`,
  }));
}

interface ChosenTimeProps {
  chosenTimeLabel: string | null;
  labels: SlotWheelPickerLabels;
}

/** «Hora elegida 10:30» grande, o la indicación de deslizar mientras no se haya elegido. */
function ChosenTime({ chosenTimeLabel, labels }: Readonly<ChosenTimeProps>): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={createChosenSlotStyle(theme)}>
      <Text color="ink2">
        {chosenTimeLabel === null ? labels.swipeToChoose : labels.chosenTime}
      </Text>
      {chosenTimeLabel === null ? null : (
        <Text variant="titleLg" color="brandInk">
          {chosenTimeLabel}
        </Text>
      )}
    </View>
  );
}

interface SlotWheelsProps {
  hours: readonly WheelHour[];
  activeGroup: WheelHour;
  selectedStartsAt: string | null;
  onSlotSelect: (startsAt: string) => void;
  labels: SlotWheelPickerLabels;
}

/** Las dos ruedas: al cambiar de hora se conserva el minuto si también está libre. */
function SlotWheels({
  hours,
  activeGroup,
  selectedStartsAt,
  onSlotSelect,
  labels,
}: Readonly<SlotWheelsProps>): React.JSX.Element {
  const theme = useTheme();
  const selectedMinuteLabel = activeGroup.minutes.find(
    (minute) => minute.startsAt === selectedStartsAt,
  )?.minuteLabel;

  return (
    <View style={createSlotWheelsRowStyle(theme)}>
      <WheelColumn
        options={buildHourOptions(hours)}
        selectedValue={String(activeGroup.hour)}
        accessibilityLabel={labels.hours}
        onValueChange={(hourValue) => {
          const nextGroup = hours.find((group) => String(group.hour) === hourValue);
          const nextMinute =
            nextGroup?.minutes.find((minute) => minute.minuteLabel === selectedMinuteLabel) ??
            nextGroup?.minutes[0];
          if (nextMinute !== undefined) onSlotSelect(nextMinute.startsAt);
        }}
      />
      <Text variant="titleLg">:</Text>
      <WheelColumn
        options={buildMinuteOptions(activeGroup)}
        selectedValue={selectedStartsAt}
        accessibilityLabel={labels.minutes}
        onValueChange={onSlotSelect}
      />
    </View>
  );
}

/**
 * Las horas libres como en el iPhone: dos ruedas, horas y minutos, que se deslizan. Solo pinta lo
 * que recibe: quien la usa decide qué horas hay (libres y futuras) y cómo se escriben.
 */
export function SlotWheelPicker({
  hours,
  activeHour,
  selectedStartsAt,
  chosenTimeLabel,
  onSlotSelect,
  labels,
}: Readonly<SlotWheelPickerProps>): React.JSX.Element {
  const theme = useTheme();
  const activeGroup = hours.find((group) => group.hour === activeHour) ?? hours[0];

  if (activeGroup === undefined) return <Text color="ink2">{labels.noSlots}</Text>;
  return (
    <View style={createSlotPickerCardStyle(theme)}>
      <SlotWheels
        hours={hours}
        activeGroup={activeGroup}
        selectedStartsAt={selectedStartsAt}
        onSlotSelect={onSlotSelect}
        labels={labels}
      />
      <ChosenTime chosenTimeLabel={chosenTimeLabel} labels={labels} />
    </View>
  );
}
