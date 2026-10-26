import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useFormState } from 'react-hook-form';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { ProblemModal } from '@/ui/organisms/ProblemModal';
import { FormTextField } from '@/ui/molecules/FormTextField';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ChoiceChipsField } from '../components/ChoiceChipsField';
import { SchedulePeriodFields } from '../components/SchedulePeriodFields';
import { SessionLocationFields } from '../components/SessionLocationFields';
import { SkippedOccurrencesSheet } from '../components/SkippedOccurrencesSheet';
import { TimeRangeStepFields } from '../components/TimeRangeStepFields';
import { useEditScheduleForm, type EditScheduleForm } from '../hooks/useEditScheduleForm';
import { useScheduleFormOptions } from '../hooks/useScheduleFormOptions';
import { useScheduleSeriesList } from '../hooks/useScheduleSeriesList';
import { NO_ROOM_VALUE } from '../model/schedule-form';
import { scheduleRouteParamsSchema } from '../model/schedule-route-params';
import { describeSeriesName, type ScheduleSeries } from '../model/schedule-summary';

interface EditFieldsProps {
  form: EditScheduleForm;
  series: ScheduleSeries;
}

/** Espacio y profesor: solo los espacios que admiten el servicio del horario. */
function EditPlaceFields({ form, series }: Readonly<EditFieldsProps>): React.JSX.Element {
  const options = useScheduleFormOptions({
    serviceId: series.service.id,
    roomId: form.values.roomId,
  });
  const { errors } = useFormState({ control: form.control });

  return (
    <>
      <ChoiceChipsField
        title={i18n.t('centerAdmin.schedules.roomLabel')}
        options={[
          { value: NO_ROOM_VALUE, label: i18n.t('centerAdmin.schedules.roomNone') },
          ...options.compatibleRooms.map((room) => ({ value: room.id, label: room.name })),
        ]}
        selectedValue={form.values.roomId}
        onValueChange={(roomId) => {
          form.setValue('roomId', roomId);
        }}
      />
      <ChoiceChipsField
        title={i18n.t('centerAdmin.schedules.teacherLabel')}
        options={options.staffMembers.map((member) => ({
          value: member.membershipId,
          label: member.fullName,
        }))}
        selectedValue={form.values.staffMembershipId}
        errorMessage={errors.staffMembershipId?.message}
        onValueChange={(staffMembershipId) => {
          form.setValue('staffMembershipId', staffMembershipId, { shouldValidate: true });
        }}
      />
    </>
  );
}

/** Nombre, plazas, hora y fin: lo que se puede cambiar sin terminar el horario. */
function EditTimingFields({ form }: Readonly<Pick<EditFieldsProps, 'form'>>): React.JSX.Element {
  const { errors } = useFormState({ control: form.control });

  return (
    <>
      <FormTextField
        control={form.control}
        name="label"
        label={i18n.t('centerAdmin.schedules.labelLabel')}
        placeholder={i18n.t('centerAdmin.schedules.labelPlaceholder')}
      />
      <FormTextField
        control={form.control}
        name="capacity"
        label={i18n.t('centerAdmin.schedules.summaryCapacity')}
        keyboardType="number-pad"
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
      <SchedulePeriodFields
        endsOn={form.values.endsOn}
        errorMessage={errors.endsOn?.message}
        onEndsOnChange={(isoDate) => {
          form.setValue('endsOn', isoDate, { shouldValidate: true });
        }}
      />
    </>
  );
}

/** Si la clase es fuera del centro: dónde. Cambiarlo avisa, pero no rehace las sesiones. */
function EditLocationField({ form }: Readonly<Pick<EditFieldsProps, 'form'>>): React.JSX.Element {
  const { errors } = useFormState({ control: form.control });

  return (
    <SessionLocationFields
      value={form.values.location}
      nameErrorMessage={errors.location?.name?.message}
      onChange={(location) => {
        form.setValue('location', location, { shouldValidate: true });
      }}
    />
  );
}

function EditScheduleContent({ series }: Readonly<{ series: ScheduleSeries }>): React.JSX.Element {
  const router = useRouter();
  const form = useEditScheduleForm(series);

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.schedules.editTitle')}
      subtitle={describeSeriesName(series)}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={form.isSaving}
      footer={
        <Button
          isFullWidth
          label={i18n.t('centerAdmin.schedules.editSaveAction')}
          onPress={form.submit}
        />
      }
    >
      <EditTimingFields form={form} />
      <EditPlaceFields form={form} series={series} />
      <EditLocationField form={form} />
      <ProblemModal
        message={form.errorMessage}
        onDismiss={form.clearError}
        {...getProblemModalCopy()}
      />
      <SkippedOccurrencesSheet
        title={i18n.t('centerAdmin.schedules.updatedTitle')}
        skipped={form.skipped}
        onDone={form.finish}
      />
    </ScreenTemplate>
  );
}

/** Edita un horario: el servidor rehace las sesiones futuras que no tengan citas sueltas. */
export function EditScheduleScreen(): React.JSX.Element {
  const router = useRouter();
  const params = scheduleRouteParamsSchema.safeParse(useLocalSearchParams());
  const seriesList = useScheduleSeriesList();
  const series = seriesList.data?.series.find(
    (candidate) => params.success && candidate.seriesId === params.data.seriesId,
  );

  if (!params.success) return <Redirect href="/(admin)/(tabs)/management" />;
  if (series === undefined) {
    return (
      <ScreenTemplate
        title={i18n.t('centerAdmin.schedules.editTitle')}
        onBackPress={router.back}
        backLabel={i18n.t('actions.back')}
      >
        {seriesList.isSuccess ? (
          <Text color="ink2">{i18n.t('centerAdmin.schedules.notFound')}</Text>
        ) : null}
      </ScreenTemplate>
    );
  }
  return <EditScheduleContent series={series} />;
}
