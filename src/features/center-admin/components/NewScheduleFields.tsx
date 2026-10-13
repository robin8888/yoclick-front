import { useFormState } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { FormTextField } from '@/ui/molecules/FormTextField';

import type { NewScheduleForm } from '../hooks/useNewScheduleForm';
import type { ScheduleFormOptions } from '../hooks/useScheduleFormOptions';
import {
  applyServiceChoice,
  NO_END_VALUE,
  NO_ROOM_VALUE,
  ROOM_TEACHER_VALUE,
  toggleWeekday,
} from '../model/schedule-form';
import { getEndOfWeeks } from '../model/schedule-week';
import { ChoiceChipsField, type ChoiceOption } from './ChoiceChipsField';
import { ScheduleModeField } from './ScheduleModeField';
import { SchedulePeriodFields } from './SchedulePeriodFields';
import { ScheduleWeekdaysField } from './ScheduleWeekdaysField';
import { TimeRangeStepFields } from './TimeRangeStepFields';

interface NewScheduleFieldsProps {
  form: NewScheduleForm;
  options: ScheduleFormOptions;
}

/** «Sin espacio» y los espacios que admiten el servicio. */
function listRoomOptions(options: ScheduleFormOptions): ChoiceOption[] {
  return [
    { value: NO_ROOM_VALUE, label: i18n.t('centerAdmin.schedules.roomNone') },
    ...options.compatibleRooms.map((room) => ({ value: room.id, label: room.name })),
  ];
}

/** El profesor fijo del espacio (si lo tiene) y el resto del equipo. */
function listTeacherOptions(options: ScheduleFormOptions): ChoiceOption[] {
  const roomTeacher = options.selectedRoom?.staff ?? null;
  // El profesor fijo del espacio solo vale si es de los que dan ese servicio.
  const isRoomTeacherGivingService = options.staffMembers.some(
    (member) => member.membershipId === roomTeacher?.membershipId,
  );
  const roomTeacherOption =
    roomTeacher === null || !isRoomTeacherGivingService
      ? []
      : [
          {
            value: ROOM_TEACHER_VALUE,
            label: i18n.t('centerAdmin.schedules.teacherOfRoom', { name: roomTeacher.fullName }),
          },
        ];
  return [
    ...roomTeacherOption,
    ...options.staffMembers.map((member) => ({
      value: member.membershipId,
      label: member.fullName,
    })),
  ];
}

/** El servicio: al elegirlo se ajustan el modo y el espacio para que el servidor los acepte. */
function ServiceChoiceField({
  form,
  options,
}: Readonly<NewScheduleFieldsProps>): React.JSX.Element {
  const { errors } = useFormState({ control: form.control });

  return (
    <ChoiceChipsField
      title={i18n.t('centerAdmin.schedules.serviceLabel')}
      options={options.services.map((service) => ({ value: service.id, label: service.name }))}
      selectedValue={form.values.serviceId}
      emptyText={i18n.t('centerAdmin.schedules.serviceEmpty')}
      errorMessage={errors.serviceId?.message}
      onValueChange={(serviceId) => {
        const service = options.services.find((candidate) => candidate.id === serviceId);
        if (service === undefined) return;
        const choice = applyServiceChoice({
          formValues: form.values,
          service,
          rooms: options.rooms,
        });
        form.setValue('serviceId', choice.serviceId, { shouldValidate: true });
        form.setValue('mode', choice.mode);
        form.setValue('roomId', choice.roomId);
      }}
    />
  );
}

/** Servicio, espacio, profesor y modo: lo que decide quién, dónde y cómo. */
export function ScheduleChoiceFields({
  form,
  options,
}: Readonly<NewScheduleFieldsProps>): React.JSX.Element {
  return (
    <>
      <ServiceChoiceField form={form} options={options} />
      <ChoiceChipsField
        title={i18n.t('centerAdmin.schedules.roomLabel')}
        helperText={i18n.t('centerAdmin.schedules.roomHelper')}
        options={listRoomOptions(options)}
        selectedValue={form.values.roomId}
        onValueChange={(roomId) => {
          form.setValue('roomId', roomId);
        }}
      />
      <ChoiceChipsField
        title={i18n.t('centerAdmin.schedules.teacherLabel')}
        helperText={i18n.t('centerAdmin.schedules.teacherHelper')}
        options={listTeacherOptions(options)}
        selectedValue={form.values.staffMembershipId}
        onValueChange={(staffMembershipId) => {
          form.setValue('staffMembershipId', staffMembershipId);
        }}
      />
      <ScheduleModeField
        allowedModes={options.allowedModes}
        selectedMode={form.values.mode}
        onModeChange={(mode) => {
          form.setValue('mode', mode);
        }}
      />
    </>
  );
}

/** Días de la semana y hora. */
function ScheduleWhenFields({
  form,
}: Readonly<Pick<NewScheduleFieldsProps, 'form'>>): React.JSX.Element {
  const { errors } = useFormState({ control: form.control });

  return (
    <>
      <ScheduleWeekdaysField
        selectedWeekdays={form.values.weekdays}
        errorMessage={errors.weekdays?.message}
        onWeekdayToggle={(weekday) => {
          form.setValue('weekdays', toggleWeekday(form.values.weekdays, weekday), {
            shouldValidate: true,
          });
        }}
      />
      <TimeRangeStepFields
        title={i18n.t('centerAdmin.schedules.timeLabel')}
        startName={i18n.t('centerAdmin.schedules.timeFrom')}
        endName={i18n.t('centerAdmin.schedules.timeUntil')}
        startsAtTime={form.values.startsAtTime}
        endsAtTime={form.values.endsAtTime}
        errorMessage={errors.endsAtTime?.message}
        onStartTimeChange={(time) => {
          form.setValue('startsAtTime', time);
        }}
        onEndTimeChange={(time) => {
          form.setValue('endsAtTime', time);
        }}
      />
    </>
  );
}

/** Plazas, periodo y nombre del grupo. */
function ScheduleExtraFields({
  form,
}: Readonly<Pick<NewScheduleFieldsProps, 'form'>>): React.JSX.Element {
  const { errors } = useFormState({ control: form.control });

  return (
    <>
      <FormTextField
        control={form.control}
        name="capacity"
        label={i18n.t('centerAdmin.schedules.capacityLabel')}
        helperText={i18n.t('centerAdmin.schedules.capacityHelper')}
        keyboardType="number-pad"
      />
      <SchedulePeriodFields
        startsOn={form.values.startsOn}
        endsOn={form.values.endsOn}
        errorMessage={errors.startsOn?.message ?? errors.endsOn?.message}
        onStartsOnChange={(isoDate) => {
          form.setValue('startsOn', isoDate, { shouldValidate: true });
        }}
        onEndsOnChange={(isoDate) => {
          form.setValue('endsOn', isoDate, { shouldValidate: true });
        }}
        onPeriodPresetSelect={(weekCount) => {
          form.setValue(
            'endsOn',
            weekCount === null ? NO_END_VALUE : getEndOfWeeks(form.values.startsOn, weekCount),
            { shouldValidate: true },
          );
        }}
      />
      <FormTextField
        control={form.control}
        name="label"
        label={i18n.t('centerAdmin.schedules.labelLabel')}
        placeholder={i18n.t('centerAdmin.schedules.labelPlaceholder')}
      />
    </>
  );
}

/** Días, hora, plazas, periodo y nombre: cuándo y cuántos. */
export function ScheduleTimingFields({
  form,
}: Readonly<Pick<NewScheduleFieldsProps, 'form'>>): React.JSX.Element {
  return (
    <>
      <ScheduleWhenFields form={form} />
      <ScheduleExtraFields form={form} />
    </>
  );
}
