import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';
import { SlotButton } from '@/ui/molecules/SlotButton';

import type { CreateClassForm } from '../hooks/useCreateClassForm';
import { addMinutesToTime, type ClassRepeat } from '../model/create-class';
import { ScheduleWeekdaysField } from './ScheduleWeekdaysField';
import { SpanishDateField } from './SpanishDateField';

const SECTION_STYLE = { gap: 8 } as const;
const SLOTS_STYLE = { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } as const;

const REPEAT_OPTIONS = [
  { value: 'weekly', label: i18n.t('centerAdmin.createClass.repeatWeekly') },
  { value: 'once', label: i18n.t('centerAdmin.createClass.repeatOnce') },
] as const;

/** Las horas libres: solo salen las que no pisan a otra clase de la sala o del profesor. */
function FreeTimes({ form }: Readonly<{ form: CreateClassForm }>): React.JSX.Element | null {
  const { draft, service } = form;
  if (service === undefined || draft.roomId === null || draft.staffMembershipId === null) {
    return <Text color="ink2">{i18n.t('centerAdmin.createClass.timeNeedsPlace')}</Text>;
  }
  if (form.isCheckingTimes) {
    return <Text color="ink2">{i18n.t('centerAdmin.createClass.checkingTimes')}</Text>;
  }
  if (form.freeTimes.length === 0) {
    return <Text color="danger">{i18n.t('centerAdmin.createClass.noFreeTimes')}</Text>;
  }
  return (
    <>
      <View style={SLOTS_STYLE}>
        {form.freeTimes.map((time) => (
          <SlotButton
            key={time}
            timeLabel={time}
            isSelected={draft.startsAtTime === time}
            onPress={() => {
              form.chooseTime(time);
            }}
          />
        ))}
      </View>
      {draft.startsAtTime === null ? null : (
        <Text color="brandInk">
          {i18n.t('centerAdmin.createClass.chosenTime', {
            start: draft.startsAtTime,
            end: addMinutesToTime(draft.startsAtTime, service.durationMinutes),
          })}
        </Text>
      )}
    </>
  );
}

/** «Desde el día» si se repite cada semana; «Día» si es una sola vez. */
function StartDateField({ form }: Readonly<{ form: CreateClassForm }>): React.JSX.Element {
  const { draft } = form;
  const labelKey =
    draft.repeat === 'weekly'
      ? 'centerAdmin.createClass.startsFrom'
      : 'centerAdmin.createClass.dayLabel';

  return (
    <View style={SECTION_STYLE}>
      <Text variant="bodyStrong">{i18n.t(labelKey)}</Text>
      <SpanishDateField
        value={draft.startsOn}
        onValueChange={form.chooseStartsOn}
        accessibilityLabel={i18n.t('centerAdmin.createClass.dayLabel')}
        isInitiallyOpen={false}
      />
    </View>
  );
}

/** Cada semana (días + desde cuándo) o una sola vez (un día), y la hora entre las libres. */
export function CreateClassWhenFields({
  form,
}: Readonly<{ form: CreateClassForm }>): React.JSX.Element {
  const { draft } = form;

  return (
    <>
      <View style={SECTION_STYLE}>
        <Text variant="titleMd" role="heading">
          {i18n.t('centerAdmin.createClass.whenTitle')}
        </Text>
        <SegmentedControl<ClassRepeat>
          options={REPEAT_OPTIONS}
          selectedValue={draft.repeat}
          onValueChange={form.chooseRepeat}
        />
      </View>

      {draft.repeat === 'weekly' ? (
        <ScheduleWeekdaysField selectedWeekdays={draft.weekdays} onWeekdayToggle={form.toggleDay} />
      ) : null}

      <StartDateField form={form} />

      <View style={SECTION_STYLE}>
        <Text variant="bodyStrong">{i18n.t('centerAdmin.createClass.timeTitle')}</Text>
        <FreeTimes form={form} />
      </View>
    </>
  );
}
