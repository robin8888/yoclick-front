import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';
import { SegmentedControl } from '@/ui/molecules/SegmentedControl';

import type { CreateClassForm } from '../hooks/useCreateClassForm';
import {
  NO_END_DATE,
  type BusySlot,
  type ClassRepeat,
  type HoursProblem,
} from '../model/create-class';
import { ScheduleWeekdaysField } from './ScheduleWeekdaysField';
import { SchedulePeriodFields } from './SchedulePeriodFields';
import { SpanishDateField } from './SpanishDateField';
import { TimeRangeStepFields } from './TimeRangeStepFields';

const SECTION_STYLE = { gap: 8 } as const;

const REPEAT_OPTIONS = [
  { value: 'weekly', label: i18n.t('centerAdmin.createClass.repeatWeekly') },
  { value: 'once', label: i18n.t('centerAdmin.createClass.repeatOnce') },
] as const;

function describeProblem(problem: HoursProblem): string {
  switch (problem.kind) {
    case 'order':
      return i18n.t('centerAdmin.createClass.problemOrder');
    case 'closed':
      return i18n.t('centerAdmin.createClass.problemClosed');
    case 'outside_hours':
      return i18n.t('centerAdmin.createClass.problemOutsideHours', {
        opensAt: problem.opensAt,
        closesAt: problem.closesAt,
      });
    case 'busy':
      return i18n.t('centerAdmin.createClass.problemBusy', {
        name: problem.className,
        start: problem.startsAtTime,
        end: problem.endsAtTime,
      });
  }
}

/** Lo que ya ocupa la sala o el profesor en los días elegidos: ayuda a elegir sin chocar. */
function BusyLines({
  busy,
  weekdays,
}: Readonly<{ busy: readonly BusySlot[]; weekdays: readonly number[] }>) {
  const relevant = busy.filter((slot) => weekdays.includes(slot.weekday));
  if (relevant.length === 0) return null;
  return (
    <View style={SECTION_STYLE}>
      <Text variant="caption" color="ink2">
        {i18n.t('centerAdmin.createClass.busyIntro')}
      </Text>
      {relevant.map((slot) => (
        <Text
          key={`${String(slot.weekday)}-${slot.startsAtTime}-${slot.className}`}
          variant="caption"
          color="ink2"
        >
          {i18n.t(
            slot.source === 'room'
              ? 'centerAdmin.createClass.busyRoomLine'
              : 'centerAdmin.createClass.busyTeacherLine',
            { name: slot.className, start: slot.startsAtTime, end: slot.endsAtTime },
          )}
        </Text>
      ))}
    </View>
  );
}

/** Desde cuándo y hasta cuándo se da: cada semana (con o sin fin) o un solo día. */
function DatesFields({ form }: Readonly<{ form: CreateClassForm }>): React.JSX.Element {
  const { draft } = form;
  if (draft.repeat === 'once') {
    return (
      <View style={SECTION_STYLE}>
        <Text variant="bodyStrong">{i18n.t('centerAdmin.createClass.dayLabel')}</Text>
        <SpanishDateField
          value={draft.startsOn}
          onValueChange={form.chooseStartsOn}
          accessibilityLabel={i18n.t('centerAdmin.createClass.dayLabel')}
          isInitiallyOpen={false}
        />
      </View>
    );
  }
  return (
    <SchedulePeriodFields
      startsOn={draft.startsOn}
      endsOn={draft.endsOn === NO_END_DATE ? '' : draft.endsOn}
      onStartsOnChange={form.chooseStartsOn}
      onEndsOnChange={form.chooseEndsOn}
      onPeriodPresetSelect={form.choosePeriodWeeks}
    />
  );
}

/** Inicio y fin de la clase con ruedas, limitadas al horario del centro cuando se conoce. */
function TimesFields({ form }: Readonly<{ form: CreateClassForm }>): React.JSX.Element {
  const { draft } = form;

  return (
    <View style={SECTION_STYLE}>
      <TimeRangeStepFields
        title={i18n.t('centerAdmin.createClass.timeTitle')}
        startName={i18n.t('centerAdmin.createClass.timeFrom')}
        endName={i18n.t('centerAdmin.createClass.timeUntil')}
        startsAtTime={draft.startsAtTime}
        endsAtTime={draft.endsAtTime}
        onStartTimeChange={form.chooseStartsAtTime}
        onEndTimeChange={form.chooseEndsAtTime}
        errorMessage={form.hoursProblem === null ? undefined : describeProblem(form.hoursProblem)}
      />
      <BusyLines busy={form.busy} weekdays={form.weekdays} />
    </View>
  );
}

/** Cada semana (días, desde y hasta) o una sola vez (un día), y la hora de inicio y de fin. */
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
      <DatesFields form={form} />
      <TimesFields form={form} />
    </>
  );
}
