import { useState } from 'react';
import { View } from 'react-native';

import type { SlotOption } from '@/features/booking';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { SlotButton } from '@/ui/molecules/SlotButton';

import { findHourOfSlot, groupSlotsByHour, type HourGroup } from '../model/slot-hours';
import { CHIP_ROW_STYLE } from './AppointmentTimePicker.styles';

interface AppointmentTimePickerProps {
  slots: readonly SlotOption[];
  timeZone: string;
  selectedStartsAt: string | null;
  onSlotSelect: (slot: SlotOption) => void;
}

interface HourRowProps {
  hourGroups: readonly HourGroup[];
  activeHour: number | null;
  onHourSelect: (hour: number) => void;
}

function HourRow({
  hourGroups,
  activeHour,
  onHourSelect,
}: Readonly<HourRowProps>): React.JSX.Element {
  return (
    <View style={CHIP_ROW_STYLE.row}>
      {hourGroups.map((group) => (
        <Button
          key={group.hour}
          size="sm"
          variant={group.hour === activeHour ? 'primary' : 'outline'}
          label={`${group.hourLabel} h`}
          onPress={() => {
            onHourSelect(group.hour);
          }}
        />
      ))}
    </View>
  );
}

interface MinuteRowProps {
  group: HourGroup;
  selectedStartsAt: string | null;
  onMinuteSelect: (startsAt: string) => void;
}

function MinuteRow({
  group,
  selectedStartsAt,
  onMinuteSelect,
}: Readonly<MinuteRowProps>): React.JSX.Element {
  return (
    <View style={CHIP_ROW_STYLE.row}>
      {group.minutes.map((minute) => (
        <SlotButton
          key={minute.startsAt}
          timeLabel={`${group.hourLabel}:${minute.minuteLabel}`}
          isSelected={minute.startsAt === selectedStartsAt}
          onPress={() => {
            onMinuteSelect(minute.startsAt);
          }}
        />
      ))}
    </View>
  );
}

/** Primero la hora y luego los minutos (10 → 10:00, 10:15, 10:30, 10:45), solo con lo libre. */
export function AppointmentTimePicker({
  slots,
  timeZone,
  selectedStartsAt,
  onSlotSelect,
}: Readonly<AppointmentTimePickerProps>): React.JSX.Element {
  const [chosenHour, setChosenHour] = useState<number | null>(null);
  const hourGroups = groupSlotsByHour(slots, timeZone);
  const activeHour = chosenHour ?? findHourOfSlot(selectedStartsAt, timeZone);
  const activeGroup = hourGroups.find((group) => group.hour === activeHour);

  if (hourGroups.length === 0) {
    return <Text color="ink2">{i18n.t('booking.slot.noSlotsThisDay')}</Text>;
  }
  return (
    <View style={CHIP_ROW_STYLE.container}>
      <Text variant="caption" color="ink2">
        {i18n.t('staffAgenda.newAppointment.hourLabel')}
      </Text>
      <HourRow hourGroups={hourGroups} activeHour={activeHour} onHourSelect={setChosenHour} />
      {activeGroup === undefined ? null : (
        <>
          <Text variant="caption" color="ink2">
            {i18n.t('staffAgenda.newAppointment.minuteLabel')}
          </Text>
          <MinuteRow
            group={activeGroup}
            selectedStartsAt={selectedStartsAt}
            onMinuteSelect={(startsAt) => {
              const slot = slots.find((candidate) => candidate.startsAt === startsAt);
              if (slot !== undefined) onSlotSelect(slot);
            }}
          />
        </>
      )}
    </View>
  );
}
