import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Text } from '@/ui/atoms/Text';

import type { CreateClassForm } from '../hooks/useCreateClassForm';
import { NO_END_DATE, type BusySlot, type HoursProblem } from '../model/create-class';
import { SchedulePeriodFields } from './SchedulePeriodFields';
import { TimeRangeStepFields } from './TimeRangeStepFields';

const SECTION_STYLE = { gap: 8 } as const;

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

/** Desde cuándo y hasta cuándo se da; el día de la semana es el de la fecha de inicio. */
function DatesFields({ form }: Readonly<{ form: CreateClassForm }>): React.JSX.Element {
  const { draft } = form;
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

/** Cuándo se da la clase: desde y hasta qué fecha, y de qué hora a qué hora. */
export function CreateClassWhenFields({
  form,
}: Readonly<{ form: CreateClassForm }>): React.JSX.Element {
  return (
    <>
      <DatesFields form={form} />
      <TimesFields form={form} />
    </>
  );
}
